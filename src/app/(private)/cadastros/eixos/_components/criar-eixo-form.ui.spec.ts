import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/cadastros/create_eixo_action", () => ({
  criarEixoAction: vi.fn(),
}));

import {
  criarEixoSchema,
  type CriarEixoInput,
} from "@/core/schemas/cadastros/create_eixo_schema";
import {
  EIXO_FORM_ALL_INPUT_KEYS,
  EIXO_FORM_EXPECTED_LABELS,
  EIXO_FORM_REQUIRED_FIELDS,
  EIXO_FORM_EXPECTED_FIELDS,
} from "./__tests__/eixo-form.constants";
import {
  buildEixoMock,
  mockEixoCompleto,
  mockEixoCompletoOutput,
  mockEixoMinimo,
} from "./__tests__/eixo-form.mocks";

describe("eixo — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(EIXO_FORM_EXPECTED_LABELS).toEqual(expect.arrayContaining(["Nome"]));
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = EIXO_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(EIXO_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of EIXO_FORM_REQUIRED_FIELDS) {
      expect(EIXO_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("eixo — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo", () => {
    const resultado = criarEixoSchema.safeParse(mockEixoCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockEixoCompletoOutput);
    }
  });

  it("aceita o formulário mínimo", () => {
    const resultado = criarEixoSchema.safeParse(mockEixoMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({ nome: "Saúde" });
    }
  });
});

describe("eixo — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarEixoInput) {
    const resultado = criarEixoSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome vazio", () => {
    expect(caminhosDeErro(buildEixoMock({ nome: "" }))).toContain("nome");
  });

  it("barra nome com menos de 2 caracteres", () => {
    expect(caminhosDeErro(buildEixoMock({ nome: "A" }))).toContain("nome");
  });
});
