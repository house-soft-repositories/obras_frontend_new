import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/cadastros/create_subclassificacao_action", () => ({
  criarSubclassificacaoAction: vi.fn(),
}));

import {
  criarSubclassificacaoSchema,
  type CriarSubclassificacaoInput,
} from "@/core/schemas/cadastros/create_subclassificacao_schema";
import {
  SUBCLASSIFICACAO_FORM_ALL_INPUT_KEYS,
  SUBCLASSIFICACAO_FORM_EXPECTED_LABELS,
  SUBCLASSIFICACAO_FORM_REQUIRED_FIELDS,
  SUBCLASSIFICACAO_FORM_EXPECTED_FIELDS,
} from "./__tests__/subclassificacao-form.constants";
import {
  buildSubclassificacaoMock,
  mockSubclassificacaoCompleto,
  mockSubclassificacaoCompletoOutput,
  mockSubclassificacaoMinimo,
  SUBCLASSIFICACAO_UUIDS,
} from "./__tests__/subclassificacao-form.mocks";

describe("subclassificacao — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(SUBCLASSIFICACAO_FORM_EXPECTED_LABELS).toEqual(
      expect.arrayContaining(["Classificação", "Nome"]),
    );
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = SUBCLASSIFICACAO_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(SUBCLASSIFICACAO_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of SUBCLASSIFICACAO_FORM_REQUIRED_FIELDS) {
      expect(SUBCLASSIFICACAO_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("subclassificacao — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo", () => {
    const resultado = criarSubclassificacaoSchema.safeParse(
      mockSubclassificacaoCompleto,
    );
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockSubclassificacaoCompletoOutput);
    }
  });

  it("aceita o formulário mínimo", () => {
    const resultado = criarSubclassificacaoSchema.safeParse(
      mockSubclassificacaoMinimo,
    );
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        classificacaoId: SUBCLASSIFICACAO_UUIDS.classificacaoId,
        nome: "Multifamiliar",
      });
    }
  });
});

describe("subclassificacao — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarSubclassificacaoInput) {
    const resultado = criarSubclassificacaoSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome vazio", () => {
    expect(caminhosDeErro(buildSubclassificacaoMock({ nome: "" }))).toContain(
      "nome",
    );
  });

  it("barra classificacaoId inválido", () => {
    expect(
      caminhosDeErro(
        buildSubclassificacaoMock({ classificacaoId: "not-uuid" }),
      ),
    ).toContain("classificacaoId");
  });
});
