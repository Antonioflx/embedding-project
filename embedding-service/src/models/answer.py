from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Language = Literal["BR", "US"]


class GenerateConfig(BaseModel):
    # camelCase aliases so this matches Node's IGenerateConfig wire shape
    # (interfaces/llm-config.interface.ts in api-service) exactly.
    model_config = ConfigDict(populate_by_name=True)

    model: str | None = None
    temperature: float | None = None
    max_output_tokens: int | None = Field(default=None, alias="maxOutputTokens")
    top_p: float | None = Field(default=None, alias="topP")
    top_k: int | None = Field(default=None, alias="topK")
    language: Language | None = None


class AnswerRequest(BaseModel):
    question: str
    config: GenerateConfig | None = None


class AnswerResponse(BaseModel):
    answer: str
