import { describe, expect, it } from "vitest";
import {
  cepCompleto,
  limparCep,
  mapearRespostaViaCep,
  mascararCep,
} from "./cep";

describe("mascara e validacao de CEP", () => {
  it("limpa e trunca em 8 digitos", () => {
    expect(limparCep("18270-000")).toBe("18270000");
    expect(limparCep("182700009999")).toBe("18270000");
  });

  it("mascara progressivamente", () => {
    expect(mascararCep("18270")).toBe("18270");
    expect(mascararCep("182700")).toBe("18270-0");
    expect(mascararCep("18270000")).toBe("18270-000");
  });

  it("reconhece CEP completo", () => {
    expect(cepCompleto("18270-000")).toBe(true);
    expect(cepCompleto("18270")).toBe(false);
  });
});

describe("mapearRespostaViaCep", () => {
  it("mapeia os campos do ViaCEP", () => {
    expect(
      mapearRespostaViaCep({
        logradouro: "Rua das Acácias",
        bairro: "Centro",
        localidade: "São Bento",
        uf: "sp",
      }),
    ).toEqual({
      logradouro: "Rua das Acácias",
      bairro: "Centro",
      cidade: "São Bento",
      uf: "SP",
    });
  });

  it("retorna null quando o corpo sinaliza erro (status 200)", () => {
    expect(mapearRespostaViaCep({ erro: true })).toBeNull();
    expect(mapearRespostaViaCep({ erro: "true" })).toBeNull();
  });

  it("campos ausentes ou em branco viram null", () => {
    expect(
      mapearRespostaViaCep({ logradouro: "  ", localidade: "São Bento" }),
    ).toEqual({
      logradouro: null,
      bairro: null,
      cidade: "São Bento",
      uf: null,
    });
  });
});
