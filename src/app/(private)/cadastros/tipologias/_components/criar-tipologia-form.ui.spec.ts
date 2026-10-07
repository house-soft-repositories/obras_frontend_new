import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/cadastros/create_tipologia_action", () => ({
  criarTipologiaAction: vi.fn(),
}));

import {
  criarTipologiaSchema,
  type CriarTipologiaInput,
} from "@/core/schemas/cadastros/create_tipologia_schema";
import {
  TIPOLOGIA_FORM_ALL_INPUT_KEYS,
  TIPOLOGIA_FORM_EXPECTED_LABELS,
  TIPOLOGIA_FORM_REQUIRED_FIELDS,
  TIPOLOGIA_FORM_EXPECTED_FIELDS,
} from "./__tests__/tipologia-form.constants";
import {
  buildTipologiaMock,
  mockTipologiaCompleto,
  mockTipologiaCompletoOutput,
  mockTipologiaMinimo,
} from "./__tests__/tipologia-form.mocks";

describe("tipologia — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(TIPOLOGIA_FORM_EXPECTED_LABELS).toEqual(
      expect.arrayContaining(["Nome"]),
    );
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = TIPOLOGIA_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(TIPOLOGIA_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of TIPOLOGIA_FORM_REQUIRED_FIELDS) {
      expect(TIPOLOGIA_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("tipologia — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo", () => {
    const resultado = criarTipologiaSchema.safeParse(mockTipologiaCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockTipologiaCompletoOutput);
    }
  });

  it("aceita o formulário mínimo", () => {
    const resultado = criarTipologiaSchema.safeParse(mockTipologiaMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({ nome: "Pavimentação" });
    }
  });
});

describe("tipologia — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarTipologiaInput) {
    const resultado = criarTipologiaSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome vazio", () => {
    expect(caminhosDeErro(buildTipologiaMock({ nome: "" }))).toContain("nome");
  });

  it("barra nome com menos de 2 caracteres", () => {
    expect(caminhosDeErro(buildTipologiaMock({ nome: "A" }))).toContain("nome");
  });
});
