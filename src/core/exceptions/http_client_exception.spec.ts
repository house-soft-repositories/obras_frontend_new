import { describe, expect, it } from "vitest";
import HttpClientException, {
  isServerUnavailableError,
  SERVER_UNAVAILABLE_CODE,
  SERVER_UNAVAILABLE_MESSAGE,
} from "@/core/exceptions/http_client_exception";

describe("HttpClientException — servidor indisponível", () => {
  it("identifica a exceção normalizada pelo HttpClient", () => {
    const error = new HttpClientException(SERVER_UNAVAILABLE_CODE, 503, {
      code: SERVER_UNAVAILABLE_CODE,
      message: SERVER_UNAVAILABLE_MESSAGE,
    });

    expect(isServerUnavailableError(error)).toBe(true);
  });

  it("identifica o erro serializado que chega ao boundary global", () => {
    const error = {
      message: SERVER_UNAVAILABLE_CODE,
      statusCode: 503,
      data: {
        code: SERVER_UNAVAILABLE_CODE,
        message: SERVER_UNAVAILABLE_MESSAGE,
      },
    };

    expect(isServerUnavailableError(error)).toBe(true);
  });

  it("não classifica um 503 comum como servidor indisponível", () => {
    const error = new HttpClientException("SERVICE_BUSY", 503);

    expect(isServerUnavailableError(error)).toBe(false);
  });

  it("não confunde tenant obrigatório com servidor indisponível", () => {
    const error = new HttpClientException("TENANT_CONTEXT_REQUIRED", 401);

    expect(isServerUnavailableError(error)).toBe(false);
  });
});
