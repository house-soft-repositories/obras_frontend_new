import { describe, expect, it } from "vitest";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { obraErrorTranslator } from "./obra_error_translator";

describe("obraErrorTranslator", () => {
  it("traduz erro de aditivo inválido com orientações", () => {
    const message = obraErrorTranslator.translate(
      new HttpClientException("ADITIVO_INVALID_INPUT", 422),
    );

    expect(message).toContain("número");
    expect(message).toContain("data de assinatura");
    expect(message).toContain("tipo de prazo");
  });

  it("traduz liquidação acima do saldo empenhado", () => {
    const message = obraErrorTranslator.translate(
      new HttpClientException("LIQUIDACAO_EXCEDE_EMPENHO", 422),
    );

    expect(message).toContain("supera o saldo disponível do empenho");
    expect(message).toContain("saldo empenhado");
  });
});
