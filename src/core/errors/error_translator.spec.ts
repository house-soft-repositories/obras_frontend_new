import { describe, expect, it } from "vitest";
import { obraErrorTranslator } from "./obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";

describe("ErrorTranslator", () => {
  it("traduz código retornado no corpo sem perder o fallback dos demais erros", () => {
    expect(
      obraErrorTranslator.translate(
        new HttpClientException("Unprocessable Entity", 422, {
          code: "MEDICAO_ORCAMENTO_EXCEDIDO",
          message: "MEDICAO_ORCAMENTO_EXCEDIDO",
        }),
      ),
    ).toBe(
      "O valor da medição excede o saldo restante do orçamento. Informe um valor igual ou inferior ao saldo disponível.",
    );

    expect(
      obraErrorTranslator.translate(
        new HttpClientException("Erro legado", 400, {
          message: "OBRA_INVALID_NOME",
        }),
      ),
    ).toBe("Confira o nome.");
  });
});
