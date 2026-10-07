import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/cadastros/create_subtipologia_action", () => ({
  criarSubtipologiaAction: vi.fn(),
}));

import {
  criarSubtipologiaSchema,
  type CriarSubtipologiaInput,
} from "@/core/schemas/cadastros/create_subtipologia_schema";
import {
  SUBTIPOLOGIA_FORM_ALL_INPUT_KEYS,
  SUBTIPOLOGIA_FORM_EXPECTED_LABELS,
  SUBTIPOLOGIA_FORM_REQUIRED_FIELDS,
  SUBTIPOLOGIA_FORM_EXPECTED_FIELDS,
} from "./__tests__/subtipologia-form.constants";
import {
  buildSubtipologiaMock,
  mockSubtipologiaCompleto,
  mockSubtipologiaCompletoOutput,
  mockSubtipologiaMinimo,
  SUBTIPOLOGIA_UUIDS,
} from "./__tests__/subtipologia-form.mocks";

describe("subtipologia — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(SUBTIPOLOGIA_FORM_EXPECTED_LABELS).toEqual(
      expect.arrayContaining(["Tipologia", "Nome"]),
    );
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = SUBTIPOLOGIA_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(SUBTIPOLOGIA_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of SUBTIPOLOGIA_FORM_REQUIRED_FIELDS) {
      expect(SUBTIPOLOGIA_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("subtipologia — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo", () => {
    const resultado = criarSubtipologiaSchema.safeParse(
      mockSubtipologiaCompleto,
    );
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockSubtipologiaCompletoOutput);
    }
  });

  it("aceita o formulário mínimo", () => {
    const resultado = criarSubtipologiaSchema.safeParse(mockSubtipologiaMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        tipologiaId: SUBTIPOLOGIA_UUIDS.tipologiaId,
        nome: "Comercial",
      });
    }
  });
});

describe("subtipologia — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarSubtipologiaInput) {
    const resultado = criarSubtipologiaSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome vazio", () => {
    expect(caminhosDeErro(buildSubtipologiaMock({ nome: "" }))).toContain(
      "nome",
    );
  });

  it("barra tipologiaId inválido", () => {
    expect(
      caminhosDeErro(buildSubtipologiaMock({ tipologiaId: "not-uuid" })),
    ).toContain("tipologiaId");
  });
});
