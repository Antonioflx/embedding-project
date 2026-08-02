from google import genai
from google.genai import errors, types
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

from src.config import settings
from src.models.answer import GenerateConfig, Language

# Same model/defaults validated when this pipeline was first built directly
# in Node (client.models.list() against gemini-flash-latest): temperature=1,
# top_p=0.95, top_k=64, max_output_tokens=65536 (the model's own
# outputTokenLimit, so nothing gets capped that wasn't before).
GENERATION_MODEL = "gemini-flash-latest"
DEFAULT_CONFIG = {
    "model": GENERATION_MODEL,
    "temperature": 1,
    "max_output_tokens": 65_536,
    "top_p": 0.95,
    "top_k": 64,
}

LANGUAGE_NAMES: dict[Language, str] = {
    "BR": "Portuguese (Brazil)",
    "US": "English (United States)",
}

_client = genai.Client(api_key=settings.GEMINI_API_KEY)


def _is_retryable(exception: BaseException) -> bool:
    # ServerError covers Gemini's 5xx responses (e.g. 503 "high demand").
    # ClientError with code 429 covers rate/quota limits (RESOURCE_EXHAUSTED).
    # Both are documented as usually transient.
    if isinstance(exception, errors.ServerError):
        return True
    return isinstance(exception, errors.ClientError) and exception.code == 429


def _resolve_system_instruction(language: Language | None) -> str | None:
    if language is None:
        return None
    language_name = LANGUAGE_NAMES[language]
    return (
        f"Always respond in {language_name}, regardless of the language "
        "used in the question or in the retrieved context."
    )


def _format_chunks(chunks: list[str]) -> str:
    return "\n".join(f"[{i + 1}] {chunk}" for i, chunk in enumerate(chunks))


def build_prompt(question: str, chunks: list[str]) -> str:
    if not chunks:
        return question
    context = _format_chunks(chunks)
    return (
        "Answer the question using only the context below. "
        "If the answer isn't in the context, say you don't know.\n\n"
        f"Context:\n{context}\n\nQuestion: {question}"
    )


@retry(
    retry=retry_if_exception(_is_retryable),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    reraise=True,
)
async def _generate_content(
    model: str, prompt: str, config: types.GenerateContentConfig
):
    return await _client.aio.models.generate_content(
        model=model,
        contents=prompt,
        config=config,
    )


async def generate(prompt: str, config: GenerateConfig | None = None) -> str:
    overrides = config.model_dump(exclude_none=True) if config else {}
    resolved = {**DEFAULT_CONFIG, **overrides}

    response = await _generate_content(
        model=resolved["model"],
        prompt=prompt,
        config=types.GenerateContentConfig(
            temperature=resolved["temperature"],
            max_output_tokens=resolved["max_output_tokens"],
            top_p=resolved["top_p"],
            top_k=resolved["top_k"],
            system_instruction=_resolve_system_instruction(resolved.get("language")),
        ),
    )
    return response.text or ""
