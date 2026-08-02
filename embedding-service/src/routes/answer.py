from fastapi import APIRouter, Depends

from src.modules.auth.api_key import require_api_key
from src.modules.embedding.client import embed
from src.modules.generation.client import build_prompt, generate
from src.modules.retrieval.vector_store import search_vector_store
from src.models.answer import AnswerRequest, AnswerResponse

router = APIRouter()


@router.post(
    "/answer",
    response_model=AnswerResponse,
    dependencies=[Depends(require_api_key)],
)
async def answer(request: AnswerRequest) -> AnswerResponse:
    question_embedding = await embed(request.question)
    chunks = await search_vector_store(question_embedding)
    prompt = build_prompt(request.question, chunks)
    answer_text = await generate(prompt, request.config)
    return AnswerResponse(answer=answer_text)
