import type { IGenerateConfig } from "./llm-config.interface.js";

export interface IEmbeddingService {
  ask(question: string, config?: IGenerateConfig): Promise<string>;
}
