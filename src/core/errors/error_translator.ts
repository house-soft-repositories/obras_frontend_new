import HttpClientException from "@/core/exceptions/http_client_exception";

export abstract class ErrorTranslator {
  protected abstract readonly map: Map<string, string>;

  protected readonly fallback = "Ocorreu um erro inesperado. Tente novamente.";

  translate(error: unknown): string {
    if (error instanceof HttpClientException) {
      const raw = error.message?.trim();
      if (raw && this.map.has(raw)) return this.map.get(raw)!;
      if (raw && this.map.has(raw.toUpperCase())) return this.map.get(raw.toUpperCase())!;
      if (error.statusCode && this.map.has(String(error.statusCode))) {
        return this.map.get(String(error.statusCode))!;
      }
      if (raw) return raw;
      return this.fallback;
    }

    if (error instanceof Error) {
      const raw = error.message?.trim();
      if (raw && this.map.has(raw)) return this.map.get(raw)!;
      if (raw) return raw;
    }

    if (typeof error === "string" && this.map.has(error)) return this.map.get(error)!;

    return this.fallback;
  }

  translateCode(code: string): string {
    return this.map.get(code) ?? code;
  }
}
