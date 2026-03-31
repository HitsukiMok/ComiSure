import subprocess
import os
import platform

DEPLOYER_ALIAS = "backend_deployer"
USDC_TOKEN = "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA"
NETWORK = "testnet"

# Resolve absolute path to wasm file (now copied locally into the backend repo for cloud deployment)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WASM_PATH = os.path.join(BASE_DIR, "comi_sure.wasm")

# On Windows, subprocess needs shell=True for PATH resolution.
# On Linux/Docker, shell=True with a list silently drops all arguments.
USE_SHELL = platform.system() == "Windows"

def _run(cmd, **kwargs):
    """Cross-platform subprocess wrapper that handles the shell argument correctly."""
    return subprocess.run(cmd, capture_output=True, text=True, shell=USE_SHELL, **kwargs)

def setup_cloud_deployer():
    """
    On cloud providers like Railway, the Stellar CLI won't have the deployer identity pre-saved.
    This reads the DEPLOYER_SECRET_KEY env variable and provisions it dynamically on boot!
    """
    secret = os.getenv("DEPLOYER_SECRET_KEY")
    if secret:
        print("☁️ Cloud Deployer Secret Key Detected! Provisioning alias securely...")
        # Check if already provisioned
        existing = _run(["stellar", "keys", "address", DEPLOYER_ALIAS])
        if existing.returncode != 0:
            # --secret-key flag tells the CLI to read a secret key from stdin
            result = subprocess.run(
                ["stellar", "keys", "add", DEPLOYER_ALIAS, "--secret-key"],
                input=secret.strip() + "\n",
                text=True,
                shell=USE_SHELL,
                capture_output=True
            )
            if result.returncode != 0:
                print(f"⚠️ Key add failed: {result.stderr} {result.stdout}")
                # Fallback: try without the flag (older CLI versions)
                subprocess.run(
                    ["stellar", "keys", "add", DEPLOYER_ALIAS],
                    input=secret.strip() + "\n",
                    text=True,
                    shell=USE_SHELL,
                    capture_output=True
                )
            # Verify it actually worked
            verify = _run(["stellar", "keys", "address", DEPLOYER_ALIAS])
            if verify.returncode == 0:
                print(f"✅ Backend Deployer provisioned: {verify.stdout.strip()}")
            else:
                print(f"❌ Deployer provisioning FAILED: {verify.stderr}")

def get_deployer_address():
    res = _run(["stellar", "keys", "address", DEPLOYER_ALIAS])
    if res.returncode != 0:
        raise Exception(f"Failed to get deployer address: {res.stderr}")
    return res.stdout.strip()

def deploy_and_initialize_escrow(client_address: str, artist_address: str) -> str:
    """
    Deploys a new instance of the ComiSure escrow contract on the testnet
    and initializes it with the given participants.
    """
    print(f"Deploying new contract for Client: {client_address} & Artist: {artist_address} ...")
    
    # 1. Deploy the contract
    deploy_cmd = [
        "stellar", "contract", "deploy",
        "--wasm", WASM_PATH,
        "--source", DEPLOYER_ALIAS,
        "--network", NETWORK
    ]
    deploy_res = _run(deploy_cmd)
    
    if deploy_res.returncode != 0:
        raise Exception(f"Deployment failed: {deploy_res.stderr} \n {deploy_res.stdout}")
    
    contract_id = deploy_res.stdout.strip()
    
    # Verify we actually got a real contract ID (56 chars, starts with 'C')
    if not contract_id.startswith("C") or len(contract_id) != 56:
        # Sometimes the CLI writes non-ID log messages to stdout, we might need to parse it
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
        "--source", DEPLOYER_ALIAS,
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
    admin_address = get_deployer_address()
    cmd = [
        "stellar", "contract", "invoke",
        "--id", contract_id,
        "--source", DEPLOYER_ALIAS,
        "--network", NETWORK,
        "--", action,
        "--caller", admin_address
    ]
    res = _run(cmd)
    if res.returncode != 0:
        raise Exception(f"Admin action '{action}' failed: {res.stderr}\n{res.stdout}")
    
    return "success"
