export type TLanguage = "BR" | "US";

export interface IGenerateConfig {
  model?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  language?: TLanguage;
}
