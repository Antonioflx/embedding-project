from google import genai
from google.genai import types

from src.config import settings

# gemini-embedding-001 defaults to 3072 dimensions — output_dimensionality
# forces 768 to match the Atlas Vector Search Index's numDimensions
# (see context/MONGO_VECTOR_STORE.md).
EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768

_client = genai.Client(api_key=settings.GEMINI_API_KEY)


async def embed(text: str) -> list[float]:
    response = await _client.aio.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=EMBEDDING_DIMENSIONS),
    )
    if not response.embeddings:
        return []
    return response.embeddings[0].values or []
