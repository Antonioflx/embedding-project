from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PORT: int = 8000
    GEMINI_API_KEY: str
    EMBEDDING_SERVICE_API_KEY: str
    MONGODB_URI: str
    MONGODB_DB_NAME: str = "rag_study"
    MONGODB_COLLECTION_NAME: str = "faq_chunks"
    MONGODB_VECTOR_INDEX_NAME: str = "vector_index"


settings = Settings()
