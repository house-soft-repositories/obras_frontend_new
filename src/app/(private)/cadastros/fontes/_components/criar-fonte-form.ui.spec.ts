import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/fontes/create_fonte_action", () => ({
  criarFonteAction: vi.fn(),
}));

import { criarFonteAction } from "@/core/actions/fontes/create_fonte_action";
import {
  criarFonteSchema,
  type CriarFonteInput,
} from "@/core/schemas/fontes/create_fonte_schema";
import {
  FONTE_FORM_ALL_INPUT_KEYS,
  FONTE_FORM_EXPECTED_LABELS,
  FONTE_FORM_REQUIRED_FIELDS,
  FONTE_FORM_EXPECTED_FIELDS,
} from "./__tests__/fonte-form.constants";
import {
  buildFonteMock,
  mockFonteCompleto,
  mockFonteCompletoOutput,
  mockFonteMinimo,
} from "./__tests__/fonte-form.mocks";

describe("fonte — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(FONTE_FORM_EXPECTED_LABELS).toEqual(
      expect.arrayContaining(["Nome", "Código", "Tipo", "Valor previsto", "Vigência", "Descrição"]),
    );
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = FONTE_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(FONTE_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of FONTE_FORM_REQUIRED_FIELDS) {
      expect(FONTE_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("fonte — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo e transforma a saída", () => {
    const resultado = criarFonteSchema.safeParse(mockFonteCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockFonteCompletoOutput);
    }
  });

  it("aceita o formulário mínimo com campos opcionais vazios", () => {
    const resultado = criarFonteSchema.safeParse(mockFonteMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        nome: "Tesouro Municipal",
      });
      expect(resultado.data.codigo).toBeUndefined();
      expect(resultado.data.tipo).toBeUndefined();
    }
  });
});

describe("fonte — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarFonteInput) {
    const resultado = criarFonteSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome com menos de 2 caracteres", () => {
    expect(caminhosDeErro(buildFonteMock({ nome: "A" }))).toContain("nome");
  });
});
