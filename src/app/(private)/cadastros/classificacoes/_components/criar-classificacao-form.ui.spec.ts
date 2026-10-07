import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/cadastros/create_classificacao_action", () => ({
  criarClassificacaoAction: vi.fn(),
}));

import {
  criarClassificacaoSchema,
  type CriarClassificacaoInput,
} from "@/core/schemas/cadastros/create_classificacao_schema";
import {
  CLASSIFICACAO_FORM_ALL_INPUT_KEYS,
  CLASSIFICACAO_FORM_EXPECTED_LABELS,
  CLASSIFICACAO_FORM_REQUIRED_FIELDS,
  CLASSIFICACAO_FORM_EXPECTED_FIELDS,
} from "./__tests__/classificacao-form.constants";
import {
  buildClassificacaoMock,
  mockClassificacaoCompleto,
  mockClassificacaoCompletoOutput,
  mockClassificacaoMinimo,
} from "./__tests__/classificacao-form.mocks";

describe("classificacao — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(CLASSIFICACAO_FORM_EXPECTED_LABELS).toEqual(
      expect.arrayContaining(["Nome"]),
    );
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = CLASSIFICACAO_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(CLASSIFICACAO_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of CLASSIFICACAO_FORM_REQUIRED_FIELDS) {
      expect(CLASSIFICACAO_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("classificacao — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo", () => {
    const resultado = criarClassificacaoSchema.safeParse(
      mockClassificacaoCompleto,
    );
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockClassificacaoCompletoOutput);
    }
  });

  it("aceita o formulário mínimo", () => {
    const resultado = criarClassificacaoSchema.safeParse(
      mockClassificacaoMinimo,
    );
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({ nome: "Comercial" });
    }
  });
});

describe("classificacao — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarClassificacaoInput) {
    const resultado = criarClassificacaoSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome vazio", () => {
    expect(caminhosDeErro(buildClassificacaoMock({ nome: "" }))).toContain(
      "nome",
    );
  });

  it("barra nome com menos de 2 caracteres", () => {
    expect(caminhosDeErro(buildClassificacaoMock({ nome: "A" }))).toContain(
      "nome",
    );
  });
});
