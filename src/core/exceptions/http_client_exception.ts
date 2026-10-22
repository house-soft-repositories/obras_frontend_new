export const SERVER_UNAVAILABLE_CODE = "SERVER_UNAVAILABLE";
export const SERVER_UNAVAILABLE_MESSAGE =
  "Desculpe o transtorno, mas nosso servidor está fora do ar.";

export function isServerUnavailableError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as {
    statusCode?: unknown;
    message?: unknown;
    data?: unknown;
    digest?: unknown;
  };

  if (candidate.statusCode !== 503) {
    return false;
  }

  const data = candidate.data;
  const dataCode =
    typeof data === "object" &&
    data !== null &&
    "code" in data &&
    typeof data.code === "string"
      ? data.code
      : undefined;
  const dataMessage =
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
      ? data.message
      : undefined;

  return [candidate.message, dataCode, dataMessage, candidate.digest].some(
    (value) =>
      value === SERVER_UNAVAILABLE_CODE || value === SERVER_UNAVAILABLE_MESSAGE,
  );
}

export default class HttpClientException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "HttpClientException";
  }
}
