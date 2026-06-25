import os
import pytest
from services.secrets import encrypt_secret, decrypt_secret, get_decrypted_key, clear_bytearray

def test_encryption_decryption():
    passphrase = "my-secure-passphrase"
    secret = "S...stellar-secret-key-goes-here"
    
    encrypted = encrypt_secret(secret, passphrase)
    assert encrypted != secret
    
    decrypted_ba = decrypt_secret(encrypted, passphrase)
    decrypted_str = decrypted_ba.decode('utf-8')
    assert decrypted_str == secret
    
    # Check that decrypt_secret returns a mutable bytearray and can be cleared
    assert isinstance(decrypted_ba, bytearray)
    
    # Clear and verify zeroing out
    clear_bytearray(decrypted_ba)
    for b in decrypted_ba:
        assert b == 0

def test_context_manager(monkeypatch):
    passphrase = "my-secure-passphrase"
    secret = "S...stellar-secret-key-goes-here"
    encrypted = encrypt_secret(secret, passphrase)
    
    monkeypatch.setenv("DEPLOYER_SECRET_KEY_ENCRYPTED_v1", encrypted)
    monkeypatch.setenv("DEPLOYER_DECRYPTION_PASSPHRASE", passphrase)
    monkeypatch.setenv("DEPLOYER_SECRET_KEY_VERSION", "v1")
    
    with get_decrypted_key("v1") as key_ba:
        assert key_ba.decode('utf-8') == secret
        copied_ref = key_ba
        
    # Verify zeroed out outside context
    for b in copied_ref:
        assert b == 0
