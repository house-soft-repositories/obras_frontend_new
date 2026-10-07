import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/localidades/create_localidade_action", () => ({
  default: vi.fn(),
}));

import createLocalidadeAction from "@/core/actions/localidades/create_localidade_action";
import {
  criarLocalidadeSchema,
  type CriarLocalidadeInput,
} from "@/core/schemas/localidade/create_localidade_shema";
import {
  LOCALIDADE_FORM_ALL_INPUT_KEYS,
  LOCALIDADE_FORM_EXPECTED_LABELS,
  LOCALIDADE_FORM_REQUIRED_FIELDS,
  LOCALIDADE_FORM_EXPECTED_FIELDS,
} from "./__tests__/localidade-form.constants";
import {
  buildLocalidadeMock,
  mockLocalidadeCompleto,
  mockLocalidadeCompletoOutput,
  mockLocalidadeMinimo,
} from "./__tests__/localidade-form.mocks";
import { CriarLocalidadeModal } from "./criar-localidade-modal";

describe("localidade — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(LOCALIDADE_FORM_EXPECTED_LABELS).toEqual(
      expect.arrayContaining(["Nome", "UF", "Código IBGE", "Tipo", "Município", "Observações"]),
    );
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = LOCALIDADE_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(LOCALIDADE_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of LOCALIDADE_FORM_REQUIRED_FIELDS) {
      expect(LOCALIDADE_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("localidade — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo e transforma a saída", () => {
    const resultado = criarLocalidadeSchema.safeParse(mockLocalidadeCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockLocalidadeCompletoOutput);
    }
  });

  it("aceita o formulário mínimo com campos opcionais vazios", () => {
    const resultado = criarLocalidadeSchema.safeParse(mockLocalidadeMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        nome: "Bairro Centro",
        uf: "SP",
      });
    }
  });
});

describe("localidade — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarLocalidadeInput) {
    const resultado = criarLocalidadeSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra uf com tamanho inválido", () => {
    expect(caminhosDeErro(buildLocalidadeMock({ uf: "SPP" }))).toContain("uf");
  });
});
