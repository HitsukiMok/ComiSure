from stellar_sdk import Keypair
from middleware.auth import (
    generate_challenge_message,
    parse_challenge_and_verify,
    verify_stellar_signature,
    create_access_token,
    decode_access_token,
    is_admin_wallet
)

def test_stellar_wallet_auth_challenge_response():
    # 1. Generate test wallet keypair
    kp = Keypair.random()
    wallet_address = kp.public_key
    
    # 2. Backend generates challenge
    challenge = generate_challenge_message(wallet_address)
    assert wallet_address in challenge
    assert "ComiSure Login Challenge:" in challenge
    
    # 3. Verify parse_challenge_and_verify works on fresh challenge
    assert parse_challenge_and_verify(challenge, wallet_address) == True
    # Test mismatch address
    assert parse_challenge_and_verify(challenge, Keypair.random().public_key) == False
    
    # 4. Frontend signs challenge
    signature_bytes = kp.sign(challenge.encode('utf-8'))
    signature_hex = signature_bytes.hex()
    
    # 5. Backend verifies signature
    assert verify_stellar_signature(wallet_address, challenge, signature_hex) == True
    # Verify with modified challenge fails
    assert verify_stellar_signature(wallet_address, challenge + "modified", signature_hex) == False

def test_jwt_operations():
    wallet_address = "GDX" * 18 + "GG"  # 56 chars mock Stellar wallet
    role = "client"
    
    # Create token
    token = create_access_token(wallet_address, role)
    assert isinstance(token, str)
    
    # Decode and validate
    user = decode_access_token(token)
    assert user is not None
    assert user.wallet_address == wallet_address
    assert user.role == role
    
    # Test invalid token returns None
    assert decode_access_token(token + "invalid") is None

def test_admin_wallet_validation(monkeypatch):
    admin_wallet = "GA4GHSZWDI2SFG54BVNIVX4XOPVD5BGEVJD54CJQCISUBLDGBXA3JOH5"
    client_wallet = "GBC" * 18 + "GG"
    
    assert is_admin_wallet(admin_wallet) == True
    assert is_admin_wallet(client_wallet) == False
    
    # Check custom admin wallet list
    monkeypatch.setenv("ADMIN_WALLET_ADDRESSES", "GBC...client, GBX...anotheradmin")
    assert is_admin_wallet("GBC...client") == True
    assert is_admin_wallet("GBX...anotheradmin") == True
