from fastapi import FastAPI

from src.modules.errors.app_error import AppError
from src.modules.errors.error_handler import (
    app_error_handler,
    unhandled_exception_handler,
)
from src.routes.answer import router as answer_router

app = FastAPI()

app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

app.include_router(answer_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
