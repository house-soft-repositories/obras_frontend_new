import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/setores/create_setor_action", () => ({
  criarSetorAction: vi.fn(),
}));

import {
  criarSetorSchema,
  type CriarSetorInput,
} from "@/core/schemas/setores/create_setor_schema";
import {
  SETOR_FORM_ALL_INPUT_KEYS,
  SETOR_FORM_EXPECTED_LABELS,
  SETOR_FORM_REQUIRED_FIELDS,
  SETOR_FORM_EXPECTED_FIELDS,
} from "./__tests__/setor-form.constants";
import {
  buildSetorMock,
  mockSetorCompleto,
  mockSetorCompletoOutput,
  mockSetorMinimo,
  SETOR_UUIDS,
} from "./__tests__/setor-form.mocks";

describe("setor — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(SETOR_FORM_EXPECTED_LABELS).toEqual(
      expect.arrayContaining(["Órgão", "Nome", "Ativo"]),
    );
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = SETOR_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(SETOR_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of SETOR_FORM_REQUIRED_FIELDS) {
      expect(SETOR_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("setor — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo", () => {
    const resultado = criarSetorSchema.safeParse(mockSetorCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockSetorCompletoOutput);
    }
  });

  it("aceita o formulário mínimo", () => {
    const resultado = criarSetorSchema.safeParse(mockSetorMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        nome: "Setor Norte",
        orgaoId: SETOR_UUIDS.orgaoId,
      });
    }
  });
});

describe("setor — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarSetorInput) {
    const resultado = criarSetorSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome vazio", () => {
    expect(caminhosDeErro(buildSetorMock({ nome: "" }))).toContain("nome");
  });

  it("barra orgaoId inválido", () => {
    expect(caminhosDeErro(buildSetorMock({ orgaoId: "not-uuid" }))).toContain(
      "orgaoId",
    );
  });
});
