import os
import re
import uuid
import secrets
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from stellar_sdk import Keypair

logger = logging.getLogger(__name__)

# JWT configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    logger.warning("⚠️ JWT_SECRET_KEY not set in environment. Generating a temporary key for this session.")
    JWT_SECRET_KEY = secrets.token_hex(32)

JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_HOURS = int(os.getenv("TOKEN_EXPIRY_HOURS", "24"))

# Role definitions
ROLE_CLIENT = "client"
ROLE_ARTIST = "artist"
ROLE_ADMIN = "admin"
ALL_ROLES = [ROLE_CLIENT, ROLE_ARTIST, ROLE_ADMIN]

# Hardcoded default admin address from user selection
DEFAULT_ADMIN = "GA4GHSZWDI2SFG54BVNIVX4XOPVD5BGEVJD54CJQCISUBLDGBXA3JOH5"

security_bearer = HTTPBearer(auto_error=False)

class CurrentUser:
    """Lightweight user representation extracted from JWT token."""
    def __init__(self, wallet_address: str, role: str):
        self.wallet_address = wallet_address
        self.role = role

def is_admin_wallet(wallet_address: str) -> bool:
    """Return True if the given wallet address is authorized as an admin."""
    if wallet_address == DEFAULT_ADMIN:
        return True
    admin_env = os.getenv("ADMIN_WALLET_ADDRESSES", "")
    if admin_env:
        admin_list = [addr.strip() for addr in admin_env.split(",") if addr.strip()]
        if wallet_address in admin_list:
            return True
    return False

def generate_challenge_message(wallet_address: str) -> str:
    """Generate a stateless challenge string containing a timestamp and random nonce."""
    timestamp = datetime.now(timezone.utc).isoformat()
    nonce = secrets.token_hex(8)
    return f"ComiSure Login Challenge: {wallet_address} at {timestamp} (nonce: {nonce})"

def parse_challenge_and_verify(challenge: str, wallet_address: str) -> bool:
    """Parse challenge structure and verify the timestamp validity (within 5 minutes)."""
    pattern = r"^ComiSure Login Challenge: (G[A-Z2-7]{55}) at ([\d\-\:TZ\.\+]+) \(nonce: ([a-f0-9]+)\)$"
    match = re.match(pattern, challenge.strip())
    if not match:
        logger.warning(f"Challenge format invalid: '{challenge}'")
        return False
        
    addr, timestamp_str, nonce = match.groups()
    if addr != wallet_address:
        logger.warning(f"Challenge address mismatch: expected {wallet_address}, got {addr}")
        return False
        
    try:
        # Normalize ISO timestamp with timezone info
        if timestamp_str.endswith('Z'):
            timestamp_str = timestamp_str[:-1] + '+00:00'
        dt = datetime.fromisoformat(timestamp_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
            
        now = datetime.now(timezone.utc)
        diff = (now - dt).total_seconds()
        
        # Tolerate 5-minute skew in either direction
        if abs(diff) > 300:
            logger.warning(f"Challenge expired: timediff is {diff} seconds")
            return False
            
        return True
    except Exception as e:
        logger.error(f"Error parsing challenge timestamp: {e}")
        return False

def verify_stellar_signature(public_key: str, message: str, signature: str) -> bool:
    """Verify that a message was signed by the private key of the given Stellar public key."""
    try:
        kp = Keypair.from_public_key(public_key)
        
        # Try decoding signature as hex, then base64 if hex fails
        try:
            sig_bytes = bytes.fromhex(signature)
        except ValueError:
            import base64
            sig_bytes = base64.b64decode(signature)
            
        kp.verify(message.encode('utf-8'), sig_bytes)
        return True
    except Exception as e:
        logger.warning(f"Stellar signature verification failed: {e}")
        return False

def create_access_token(wallet_address: str, role: str) -> str:
    """Generate a JWT token for the user with an expiration of 24 hours."""
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRY_HOURS)
    payload = {
        "sub": wallet_address,
        "role": role,
        "exp": int(expire.timestamp())
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[CurrentUser]:
    """Decode and validate a JWT access token, returning the CurrentUser object."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        wallet_address = payload.get("sub")
        role = payload.get("role")
        if wallet_address and role:
            return CurrentUser(wallet_address=wallet_address, role=role)
    except jwt.PyJWTError as e:
        logger.debug(f"JWT decode error: {e}")
    return None

class JWTTokenMiddleware(BaseHTTPMiddleware):
    """Middleware to populate request.state.user if a valid JWT is supplied."""
    async def dispatch(self, request: Request, call_next):
        authorization: str = request.headers.get("Authorization")
        request.state.user = None
        
        if authorization and authorization.startswith("Bearer "):
            token = authorization[7:]
            user = decode_access_token(token)
            if user:
                request.state.user = user
                
        response = await call_next(request)
        return response

def get_current_user(request: Request) -> CurrentUser:
    """FastAPI dependency to enforce authentication on routes."""
    user: Optional[CurrentUser] = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication credentials are missing or invalid."
        )
    return user

def require_role(allowed_roles: list[str]):
    """FastAPI dependency factory to enforce specific roles."""
    def dependency(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You do not have the required permissions to perform this action."
            )
        return user
    return dependency

# Shortcuts for common dependencies
require_admin = require_role([ROLE_ADMIN])
require_client_or_admin = require_role([ROLE_CLIENT, ROLE_ADMIN])
require_artist_or_admin = require_role([ROLE_ARTIST, ROLE_ADMIN])
