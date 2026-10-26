import { afterEach, describe, expect, it, vi } from "vitest";
import lookupCnpjAction from "./lookup_cnpj_action";

afterEach(() => vi.restoreAllMocks());

describe("lookupCnpjAction", () => {
  it("rejects a CNPJ with the wrong number of digits", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const result = await lookupCnpjAction({ cnpj: "123" });

    expect(result).toEqual({
      success: false,
      data: null,
      error: "Informe um CNPJ válido.",
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("maps BrasilAPI data to the company form", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          razao_social: "Empresa Teste Ltda",
          nome_fantasia: "Empresa Teste",
          email: "contato@empresa.test",
          ddd_telefone_1: "85 99999-9999",
          ddd_telefone_2: "85 3333-4444",
          cep: "60000-000",
          logradouro: "Rua Principal",
          numero: "100",
          complemento: "Sala 2",
          bairro: "Centro",
          municipio: "Fortaleza",
          uf: "ce",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await lookupCnpjAction({ cnpj: "11222333000181" });

    expect(result).toEqual({
      success: true,
      error: null,
      data: {
        razaoSocial: "Empresa Teste Ltda",
        nomeFantasia: "Empresa Teste",
        email: "contato@empresa.test",
        telefones: ["85999999999", "8533334444"],
        cep: "60000000",
        logradouro: "Rua Principal",
        numero: "100",
        complemento: "Sala 2",
        bairro: "Centro",
        cidade: "Fortaleza",
        uf: "CE",
      },
    });
  });
});
