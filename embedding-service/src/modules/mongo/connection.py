from pymongo import AsyncMongoClient
from pymongo.asynchronous.collection import AsyncCollection

from src.config import settings

_client = AsyncMongoClient(settings.MONGODB_URI)


def get_collection() -> AsyncCollection:
    return _client[settings.MONGODB_DB_NAME][settings.MONGODB_COLLECTION_NAME]
