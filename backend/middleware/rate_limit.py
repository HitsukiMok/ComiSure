import os
import time
import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
import redis

logger = logging.getLogger(__name__)

def get_user_key(request: Request) -> str:
    """
    Generate rate limiting key:
    If user is authenticated, use their wallet address.
    Otherwise, fall back to remote IP address.
    """
    user = getattr(request.state, "user", None)
    if user and hasattr(user, "wallet_address"):
        return f"user:{user.wallet_address}"
    return f"ip:{get_remote_address(request)}"

# Resolve rate limit storage backend
redis_url = os.getenv("REDIS_URL")
storage_uri = "memory://"

if redis_url:
    try:
        # Validate Redis connection with 2-second timeout
        r = redis.Redis.from_url(redis_url, socket_connect_timeout=2)
        r.ping()
        storage_uri = redis_url
        logger.info("⚡ Successfully connected to Redis for rate limiting storage.")
    except Exception as e:
        logger.warning(
            f"⚠️ Redis URL is configured ({redis_url}) but connection failed: {e}. "
            "Falling back to in-memory rate limiting storage."
        )
        storage_uri = "memory://"
else:
    logger.info("ℹ️ No REDIS_URL configured. Using in-memory rate limiting storage.")

# Initialize the slowapi Limiter
limiter = Limiter(
    key_func=get_user_key,
    storage_uri=storage_uri,
    headers_enabled=False
)

async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Custom exception handler for rate limits returning 429 and Retry-After header."""
    reset_time = getattr(exc, "reset_time", None)
    retry_after = int(reset_time - time.time()) if reset_time else 60
    # Ensure retry_after is at least 1 second
    retry_after = max(retry_after, 1)
    
    return JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded. Try again in {retry_after} seconds."},
        headers={"Retry-After": str(retry_after)}
    )
