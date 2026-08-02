from src.config import settings
from src.modules.mongo.connection import get_collection


async def search_vector_store(embedding: list[float], top_k: int = 3) -> list[str]:
    if not embedding:
        return []

    collection = get_collection()
    cursor = await collection.aggregate(
        [
            {
                "$vectorSearch": {
                    "index": settings.MONGODB_VECTOR_INDEX_NAME,
                    "path": "embedding",
                    "queryVector": embedding,
                    "numCandidates": top_k * 15,
                    "limit": top_k,
                }
            },
            {"$project": {"_id": 0, "text": 1}},
        ]
    )
    return [doc["text"] async for doc in cursor]
