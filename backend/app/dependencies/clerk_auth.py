import time
import jwt
import httpx
from fastapi import Header, HTTPException
from jwt.algorithms import RSAAlgorithm
from ..config import settings

# Simple in-memory JWKS cache: {"keys": [...], "fetched_at": float}
_jwks_cache: dict = {}
_JWKS_TTL = 3600  # 1 hour


async def _get_jwks() -> list:
    now = time.monotonic()
    if _jwks_cache.get("keys") and now - _jwks_cache.get("fetched_at", 0) < _JWKS_TTL:
        return _jwks_cache["keys"]

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            settings.clerk_jwks_url,
            headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
        )
        resp.raise_for_status()
        data = resp.json()

    _jwks_cache["keys"] = data["keys"]
    _jwks_cache["fetched_at"] = now
    return data["keys"]


async def get_clerk_user_id(authorization: str = Header(...)) -> str:
    """FastAPI dependency that verifies a Clerk Bearer JWT and returns the clerk user ID (sub claim)."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.removeprefix("Bearer ")

    try:
        header = jwt.get_unverified_header(token)
    except jwt.exceptions.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")

    kid = header.get("kid")
    keys = await _get_jwks()
    key_data = next((k for k in keys if k.get("kid") == kid), None)

    if key_data is None:
        raise HTTPException(status_code=401, detail="Unknown signing key")

    try:
        public_key = RSAAlgorithm.from_jwk(key_data)
        payload = jwt.decode(token, public_key, algorithms=["RS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Token missing sub claim")

    return clerk_user_id
