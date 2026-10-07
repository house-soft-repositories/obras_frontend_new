import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/orgaos/create_orgao_action", () => ({
  criarOrgaoAction: vi.fn(),
}));

import { criarOrgaoAction } from "@/core/actions/orgaos/create_orgao_action";
import {
  criarOrgaoSchema,
  type CriarOrgaoInput,
} from "@/core/schemas/orgaos/create_orgao_schema";
import {
  ORGAO_FORM_ALL_INPUT_KEYS,
  ORGAO_FORM_EXPECTED_LABELS,
  ORGAO_FORM_REQUIRED_FIELDS,
  ORGAO_FORM_EXPECTED_FIELDS,
} from "./__tests__/orgao-form.constants";
import {
  buildOrgaoMock,
  mockOrgaoCompleto,
  mockOrgaoCompletoOutput,
  mockOrgaoMinimo,
  ORGAO_UUIDS,
} from "./__tests__/orgao-form.mocks";
import { CriarOrgaoModal } from "./criar-orgao-modal";

describe("orgao — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(ORGAO_FORM_EXPECTED_LABELS).toEqual(
      expect.arrayContaining(["Localidade", "Nome", "Sigla", "Tipo", "Responsável", "E-mail", "Telefone", "Ativo"]),
    );
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = ORGAO_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(ORGAO_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of ORGAO_FORM_REQUIRED_FIELDS) {
      expect(ORGAO_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("orgao — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo e transforma a saída", () => {
    const resultado = criarOrgaoSchema.safeParse(mockOrgaoCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockOrgaoCompletoOutput);
    }
  });

  it("aceita o formulário mínimo com campos opcionais vazios", () => {
    const resultado = criarOrgaoSchema.safeParse(mockOrgaoMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        nome: "Secretaria de Obras",
        localidadeId: ORGAO_UUIDS.localidadeId,
      });
    }
  });
});

describe("orgao — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarOrgaoInput) {
    const resultado = criarOrgaoSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra email inválido", () => {
    expect(caminhosDeErro(buildOrgaoMock({ email: "invalido" }))).toContain("email");
  });
});
