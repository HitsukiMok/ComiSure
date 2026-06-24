import subprocess
import os
import platform

USDC_TOKEN = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
NETWORK = "testnet"

# Resolve absolute path to wasm file (now copied locally into the backend repo for cloud deployment)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WASM_PATH = os.path.join(BASE_DIR, "comi_sure.wasm")

# On Windows, subprocess needs shell=True for PATH resolution.
# On Linux/Docker, shell=True with a list silently drops all arguments.
USE_SHELL = platform.system() == "Windows"


def _is_seed_phrase(value: str) -> bool:
    """Return True when the value looks like a Stellar mnemonic seed phrase."""
    words = value.strip().split()
    return len(words) >= 12

def _run(cmd, **kwargs):
    """Cross-platform subprocess wrapper that handles the shell argument correctly."""
    return subprocess.run(cmd, capture_output=True, text=True, shell=USE_SHELL, **kwargs)

def _get_source():
    """
    Returns the --source value for the Stellar CLI.
    On cloud (Railway): uses the raw secret key directly (no alias needed).
    On local (Windows): uses the 'backend_deployer' alias from your local CLI keystore.
    """
    secret = os.getenv("DEPLOYER_SECRET_KEY")
    if secret:
        return secret.strip()
    return "backend_deployer"

def get_deployer_address():
    """Derives the public G... address from either the env seed/secret or the local alias."""
    secret = os.getenv("DEPLOYER_SECRET_KEY")
    if secret:
        value = secret.strip()
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
    else:
        # On local: use the saved alias
        res = _run(["stellar", "keys", "address", "backend_deployer"])
        if res.returncode != 0:
            raise Exception(f"Failed to get deployer address: {res.stderr}")
        return res.stdout.strip()

def setup_cloud_deployer():
    """Validates that the cloud deployer can be resolved on startup."""
    secret = os.getenv("DEPLOYER_SECRET_KEY")
    if secret:
        try:
            addr = get_deployer_address()
            print(f"☁️ Cloud Deployer ready! Public address: {addr}")
        except Exception as e:
            print(f"❌ Cloud Deployer setup failed: {e}")
    else:
        print("🏠 Running locally — using 'backend_deployer' alias from your CLI keystore.")

def deploy_and_initialize_escrow(client_address: str, artist_address: str) -> str:
    """
    Deploys a new instance of the ComiSure escrow contract on the testnet
    and initializes it with the given participants.
    """
    source = _get_source()
    print(f"Deploying new contract for Client: {client_address} & Artist: {artist_address} ...")
    
    # 1. Deploy the contract
    deploy_cmd = [
        "stellar", "contract", "deploy",
        "--wasm", WASM_PATH,
        "--source", source,
        "--network", NETWORK
    ]
    deploy_res = _run(deploy_cmd)
    
    if deploy_res.returncode != 0:
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
    
    # The automated backend deployer acts as the admin for dispute resolutions
    admin_address = get_deployer_address()

    # 2. Initialize the contract
    print(f"Initializing contract {contract_id} ...")
    init_cmd = [
        "stellar", "contract", "invoke",
        "--id", contract_id,
        "--source", source,
        "--network", NETWORK,
        "--", "initialize",
        "--client", client_address,
        "--artist", artist_address,
        "--admin", admin_address,
        "--token", USDC_TOKEN
    ]
    
    init_res = _run(init_cmd)
    if init_res.returncode != 0:
        raise Exception(f"Initialization failed: {init_res.stderr} \n {init_res.stdout}")

    print(f"Contract {contract_id} initialized exclusively for this commission!")
    return contract_id

def perform_admin_action(contract_id: str, action: str):
    """
    Executes 'admin_refund' or 'admin_force_release' on-chain using the backend_deployer identity.
    """
    source = _get_source()
    admin_address = get_deployer_address()
    cmd = [
        "stellar", "contract", "invoke",
        "--id", contract_id,
        "--source", source,
        "--network", NETWORK,
        "--", action,
        "--caller", admin_address
    ]
    res = _run(cmd)
    if res.returncode != 0:
        raise Exception(f"Admin action '{action}' failed: {res.stderr}\n{res.stdout}")
    
    return "success"
