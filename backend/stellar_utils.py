import subprocess
import os
import platform
import logging
from services.secrets import get_decrypted_key

logger = logging.getLogger(__name__)

USDC_TOKEN = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
NETWORK = "testnet"

# Resolve absolute path to wasm file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WASM_PATH = os.path.join(BASE_DIR, "comi_sure.wasm")

# On Windows, subprocess needs shell=True for PATH resolution.
# On Linux/Docker, shell=True with a list silently drops all arguments.
USE_SHELL = platform.system() == "Windows"

def _is_seed_phrase(value: str) -> bool:
    """Return True when the value looks like a Stellar mnemonic seed phrase."""
    words = value.strip().split()
    return len(words) >= 12

def _run(cmd, env_vars=None, **kwargs):
    """Cross-platform subprocess wrapper that handles the env and shell arguments correctly."""
    env = os.environ.copy()
    if env_vars:
        env.update(env_vars)
    return subprocess.run(cmd, capture_output=True, text=True, shell=USE_SHELL, env=env, **kwargs)

def get_deployer_address(version: str = None) -> str:
    """Derives the public G... address from either the env seed/secret or the local alias."""
    try:
        with get_decrypted_key(version) as dec_key:
            value = dec_key.decode('utf-8').strip()
            if not value:
                raise ValueError("Decrypted key is empty")
                
            if _is_seed_phrase(value):
                # Stellar CLI can resolve a seed phrase directly and knows which HD path to use.
                res = _run(["stellar", "keys", "public-key", "--hd-path", "0", value])
                if res.returncode != 0:
                    raise Exception(f"Failed to derive deployer address from seed phrase: {res.stderr}")
                return res.stdout.strip()

            # Raw Ed25519 secret seed path (S...).
            try:
                from stellar_sdk import Keypair
                kp = Keypair.from_secret(value)
                return kp.public_key
            except Exception as exc:
                raise Exception(f"Failed to derive deployer address from secret key: {exc}")
    except Exception as e:
        # On local: fallback to the saved alias
        res = _run(["stellar", "keys", "address", "backend_deployer"])
        if res.returncode != 0:
            raise Exception(f"Failed to get deployer address: {res.stderr} (Decryption failure: {e})")
        return res.stdout.strip()

def setup_cloud_deployer():
    """Validates that the cloud deployer can be resolved on startup."""
    version = os.getenv("DEPLOYER_SECRET_KEY_VERSION", "v1")
    try:
        addr = get_deployer_address(version)
        print(f"☁️ Cloud Deployer ready! Public address: {addr} (version: {version})")
    except Exception as e:
        raise Exception(f"Cloud Deployer setup failed: {e}")

def deploy_and_initialize_escrow(client_address: str, artist_address: str, version: str = None, deadline_unix: int = None) -> str:
    """
    Deploys a new instance of the ComiSure escrow contract on the testnet
    and initializes it with the given participants and deadline.
    """
    admin_address = get_deployer_address(version)
    env_vars = {}
    has_secret = False
    
    try:
        with get_decrypted_key(version) as dec_key:
            if len(dec_key) > 0:
                has_secret = True
    except Exception:
        pass

    if has_secret:
        with get_decrypted_key(version) as dec_key:
            env_vars["STELLAR_SIGN_WITH_KEY"] = dec_key.decode('utf-8')
            source_arg = admin_address
    else:
        source_arg = "backend_deployer"

    print(f"Deploying new contract for Client: {client_address} & Artist: {artist_address} ...")
    
    # 1. Deploy the contract
    deploy_cmd = [
        "stellar", "contract", "deploy",
        "--wasm", WASM_PATH,
        "--source", source_arg,
        "--network", NETWORK
    ]
    deploy_res = _run(deploy_cmd, env_vars=env_vars)
    
    if deploy_res.returncode != 0:
        # Redact the secret env vars if they could be leaked in output (should not, but safety first)
        raise Exception(f"Deployment failed: {deploy_res.stderr} \n {deploy_res.stdout}")
    
    contract_id = deploy_res.stdout.strip()
    
    # Verify we actually got a real contract ID (56 chars, starts with 'C')
    if not contract_id.startswith("C") or len(contract_id) != 56:
        lines = contract_id.splitlines()
        for line in lines:
            if line.startswith("C") and len(line) == 56:
                contract_id = line
                break
        else:
            raise Exception(f"Invalid contract ID extracted: {contract_id}")

    print(f"Contract deployed successfully: {contract_id}")

    # 2. Initialize the contract
    print(f"Initializing contract {contract_id} ...")
    init_cmd = [
        "stellar", "contract", "invoke",
        "--id", contract_id,
        "--source", source_arg,
        "--network", NETWORK,
        "--", "initialize",
        "--client", client_address,
        "--artist", artist_address,
        "--admin", admin_address,
        "--token", USDC_TOKEN,
        "--deadline", str(deadline_unix)
    ]
    
    init_res = _run(init_cmd, env_vars=env_vars)
    if init_res.returncode != 0:
        raise Exception(f"Initialization failed: {init_res.stderr} \n {init_res.stdout}")

    print(f"Contract {contract_id} initialized exclusively for this commission!")
    return contract_id

def perform_admin_action(contract_id: str, action: str, version: str = None):
    """
    Executes 'admin_refund' or 'admin_force_release' on-chain using the backend_deployer identity.
    """
    admin_address = get_deployer_address(version)
    env_vars = {}
    has_secret = False
    
    try:
        with get_decrypted_key(version) as dec_key:
            if len(dec_key) > 0:
                has_secret = True
    except Exception:
        pass
        
    if has_secret:
        with get_decrypted_key(version) as dec_key:
            env_vars["STELLAR_SIGN_WITH_KEY"] = dec_key.decode('utf-8')
            source_arg = admin_address
    else:
        source_arg = "backend_deployer"

    cmd = [
        "stellar", "contract", "invoke",
        "--id", contract_id,
        "--source", source_arg,
        "--network", NETWORK,
        "--", action,
        "--caller", admin_address
    ]
    res = _run(cmd, env_vars=env_vars)
    if res.returncode != 0:
        raise Exception(f"Admin action '{action}' failed: {res.stderr}\n{res.stdout}")
    
    return "success"

def get_contract_state_on_chain(contract_id: str, version: str = None) -> str:
    """
    Queries the escrow contract state on-chain without signing a transaction.
    """
    admin_address = get_deployer_address(version)
    cmd = [
        "stellar", "contract", "invoke",
        "--id", contract_id,
        "--source", admin_address,
        "--network", NETWORK,
        "--", "get_state"
    ]
    res = _run(cmd)
    if res.returncode != 0:
        raise Exception(f"Failed to query contract state: {res.stderr}\n{res.stdout}")
        
    output = res.stdout.strip()
    normalized = output.replace('"', '').strip()
    return normalized
