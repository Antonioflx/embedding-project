import type { IGenerateConfig } from "./llm-config.interface.js";

export type TJobStatus = "PROCESSING" | "SEND" | "REJECT";

export type TJobStep = "VALIDATING" | "EMBEDDING_PROCESSING" | "DONE";

export interface IAskJobData {
  question: string;
  config?: IGenerateConfig;
}

export interface IAskJobResult {
  answer: string;
}

export interface IJobProgress {
  step: TJobStep;
}

export interface IJobEvent {
  jobId: string;
  status: TJobStatus;
  step: TJobStep;
  answer?: string;
  error?: string;
}

export interface IAskJobResponse {
  jobId: string;
}
