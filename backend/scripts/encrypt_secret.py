import sys
import os
import getpass

# Add parent directory to sys.path so we can import services
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.secrets import encrypt_secret

def main():
    print("--- ComiSure Secret Key Encryption Tool ---")
    secret_key = getpass.getpass("Enter raw Stellar private key or seed phrase: ").strip()
    if not secret_key:
        print("Error: Secret key cannot be empty")
        sys.exit(1)
        
    passphrase = getpass.getpass("Enter decryption passphrase: ").strip()
    if not passphrase:
        print("Error: Passphrase cannot be empty")
        sys.exit(1)
        
    confirm_passphrase = getpass.getpass("Confirm decryption passphrase: ").strip()
    if passphrase != confirm_passphrase:
        print("Error: Passphrases do not match")
        sys.exit(1)
        
    try:
        encrypted_val = encrypt_secret(secret_key, passphrase)
        print("\nEncryption successful!")
        print("\nCopy the following base64 string to your env var:")
        print("=" * 60)
        print(encrypted_val)
        print("=" * 60)
    except Exception as e:
        print(f"Error during encryption: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
