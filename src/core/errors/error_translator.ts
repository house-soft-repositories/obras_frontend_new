import HttpClientException from "@/core/exceptions/http_client_exception";

export abstract class ErrorTranslator {
  protected abstract readonly messages: Record<string, string>;

  protected readonly fallback = "Ocorreu um erro inesperado. Tente novamente.";

  private find(message: string): string | undefined {
    const normalizedMessage = message.trim();
    return (
      this.messages[normalizedMessage] ??
      this.messages[normalizedMessage.toUpperCase()] ??
      this.messages[normalizedMessage.toLowerCase()]
    );
  }

  translate(error: unknown): string {
    if (error instanceof HttpClientException) {
      if (typeof error.data === "object" && error.data !== null) {
        const message = "message" in error.data ? error.data.message : undefined;
        if (typeof message === "string") {
          const translated = this.find(message);
          if (translated) return translated;
        }
      }

      const raw = error.message?.trim();
      if (raw) {
        const translated = this.find(raw);
        if (translated) return translated;
      }
      if (error.statusCode) {
        const translated = this.find(String(error.statusCode));
        if (translated) return translated;
      }
      if (raw) return raw;
      return this.fallback;
    }

    if (error instanceof Error) {
      const raw = error.message?.trim();
      if (raw) {
        const translated = this.find(raw);
        if (translated) return translated;
      }
      if (raw) return raw;
    }

    if (typeof error === "string") {
      const translated = this.find(error);
      if (translated) return translated;
    }

    return this.fallback;
  }

  translateMessage(message: string): string {
    return this.find(message) ?? message;
  }
}
