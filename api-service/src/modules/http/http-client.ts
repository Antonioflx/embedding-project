import type { IHttpClientOptions } from "@interface/http-client.interface.js";

export class HttpClient {
  private static readonly DEFAULT_TIMEOUT_MS = 10_000;

  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly timeoutMs: number;

  constructor(options: IHttpClientOptions) {
    this.baseUrl = options.baseUrl;
    this.headers = options.headers ?? {};
    this.timeoutMs = options.timeoutMs ?? HttpClient.DEFAULT_TIMEOUT_MS;
  }

  get<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>("GET", path);
  }

  post<TResponse>(path: string, body?: unknown): Promise<TResponse> {
    return this.request<TResponse>("POST", path, body);
  }

  private async request<TResponse>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<TResponse> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`Request to ${path} responded with ${response.status}`);
    }

    return (await response.json()) as TResponse;
  }
}
