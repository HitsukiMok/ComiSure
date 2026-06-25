import base64
import os
import logging
from contextlib import contextmanager
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

logger = logging.getLogger(__name__)

def clear_bytearray(ba: bytearray):
    """Overwrite all bytes in the bytearray with zeros to minimize in-memory key exposure."""
    if ba:
        for i in range(len(ba)):
            ba[i] = 0

def derive_key(passphrase: str, salt: bytes) -> bytes:
    """Derive a 256-bit key from a passphrase and salt using PBKDF2-HMAC-SHA256."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # 256-bit key
        salt=salt,
        iterations=100_000,
    )
    return kdf.derive(passphrase.encode('utf-8'))

def encrypt_secret(secret_key: str, passphrase: str) -> str:
    """Encrypt a secret key using AES-256-GCM and a passphrase-derived key."""
    salt = os.urandom(16)
    nonce = os.urandom(12)
    key = derive_key(passphrase, salt)
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, secret_key.encode('utf-8'), None)
    # Payload: salt (16) + nonce (12) + ciphertext
    payload = salt + nonce + ciphertext
    return base64.b64encode(payload).decode('utf-8')

def decrypt_secret(encrypted_b64: str, passphrase: str) -> bytearray:
    """Decrypt an AES-256-GCM payload using a passphrase and return a mutable bytearray."""
    try:
        payload = base64.b64decode(encrypted_b64.strip().encode('utf-8'))
    except Exception as e:
        raise ValueError(f"Failed to decode base64 payload: {e}")
        
    if len(payload) < 28:
        raise ValueError("Invalid encrypted payload size: too short")
        
    salt = payload[:16]
    nonce = payload[16:28]
    ciphertext = payload[28:]
    
    key = derive_key(passphrase, salt)
    aesgcm = AESGCM(key)
    try:
        decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
    except Exception as e:
        raise ValueError(f"Failed to decrypt secret: invalid passphrase or tampered payload ({e})")
        
    return bytearray(decrypted_bytes)

@contextmanager
def get_decrypted_key(version: str = None):
    """
    Context manager that decrypts the deployer secret key, yields it as a bytearray,
    and guarantees it is zeroed out in memory upon exit.
    """
    if not version:
        version = os.getenv("DEPLOYER_SECRET_KEY_VERSION", "v1")
        
    # Search for version-specific encrypted env var, e.g., DEPLOYER_SECRET_KEY_ENCRYPTED_v1
    env_var_name = f"DEPLOYER_SECRET_KEY_ENCRYPTED_{version}"
    encrypted_val = os.getenv(env_var_name)
    
    # Fallback to DEPLOYER_SECRET_KEY_ENCRYPTED if version is v1
    if not encrypted_val and version == "v1":
        encrypted_val = os.getenv("DEPLOYER_SECRET_KEY_ENCRYPTED")
        
    if not encrypted_val:
        # Fallback to plain text for local development if decryption passphrase is not provided
        plain_fallback = os.getenv("DEPLOYER_SECRET_KEY")
        if plain_fallback:
            logger.warning(
                f"⚠️ DEPLOYER_SECRET_KEY loaded in plaintext from environment (version: {version}). "
                "This fallback is only suitable for local development."
            )
            ba = bytearray(plain_fallback.strip().encode('utf-8'))
            try:
                yield ba
            finally:
                clear_bytearray(ba)
            return
        else:
            raise ValueError(f"Stellar deployer key secret not found in env for version '{version}'.")

    passphrase = os.getenv("DEPLOYER_DECRYPTION_PASSPHRASE")
    if not passphrase:
        raise ValueError("DEPLOYER_DECRYPTION_PASSPHRASE is not set but an encrypted key is configured")
        
    ba = decrypt_secret(encrypted_val, passphrase)
    try:
        yield ba
    finally:
        clear_bytearray(ba)
