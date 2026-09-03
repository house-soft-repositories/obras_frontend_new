export default class HttpClientException extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number,
    public readonly data?: unknown
  ) {
    super(message);
  }
}
