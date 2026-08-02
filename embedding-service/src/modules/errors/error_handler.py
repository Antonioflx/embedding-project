from fastapi import Request
from fastapi.responses import JSONResponse

from src.modules.errors.app_error import AppError
from src.modules.logger.logger import logger


async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    logger.error(exc.message)
    exposed = (
        exc.message
        if exc.is_operational or exc.status_code < 500
        else "Internal server error."
    )
    return JSONResponse(status_code=exc.status_code, content={"message": exposed})


async def unhandled_exception_handler(
    _request: Request, exc: Exception
) -> JSONResponse:
    logger.error(str(exc))
    return JSONResponse(
        status_code=500, content={"message": "Internal server error."}
    )
