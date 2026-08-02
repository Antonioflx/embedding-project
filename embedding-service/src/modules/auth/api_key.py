from fastapi import Depends
from fastapi.security import APIKeyHeader

from src.config import settings
from src.modules.errors.http_error import HTTPError

_api_key_header = APIKeyHeader(name="X-API-KEY", auto_error=False)


def require_api_key(api_key: str | None = Depends(_api_key_header)) -> None:
    if api_key != settings.EMBEDDING_SERVICE_API_KEY:
        raise HTTPError.unauthorized("Invalid or missing X-API-KEY.")
