import type {
  IGenerateConfig,
  TLanguage,
} from "@interface/llm-config.interface.js";
import { HttpError } from "@modules/errors/http.error.js";
import { StringUtils } from "@/utils/string.utils.js";

const VALID_LANGUAGES: readonly TLanguage[] = ["BR", "US"];

export class AskRequestDto {
  private static readonly MAX_QUESTION_LENGTH = 2000;

  readonly question: string;
  readonly config?: IGenerateConfig;

  private constructor(question: string, config?: IGenerateConfig) {
    this.question = question;
    this.config = config;
  }

  static from(
    body: Partial<Pick<AskRequestDto, "question" | "config">>,
  ): AskRequestDto {
    if (!StringUtils.isNotEmpty(body.question)) {
      throw HttpError.BadRequestError(
        "The 'question' field is required and must be a non-empty string.",
      );
    }

    if (
      !StringUtils.isWithinLength(
        body.question,
        AskRequestDto.MAX_QUESTION_LENGTH,
      )
    ) {
      throw HttpError.BadRequestError(
        `The 'question' field must be at most ${AskRequestDto.MAX_QUESTION_LENGTH} characters.`,
      );
    }

    if (
      body.config?.language !== undefined &&
      !VALID_LANGUAGES.includes(body.config.language)
    ) {
      throw HttpError.BadRequestError(
        `The 'config.language' field must be one of: ${VALID_LANGUAGES.join(", ")}.`,
      );
    }

    return new AskRequestDto(body.question, body.config);
  }
}
