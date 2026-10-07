import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/profissionais-tecnicos/create_profissional_tecnico_action", () => ({
  criarProfissionalTecnicoAction: vi.fn(),
}));

import { criarProfissionalTecnicoAction } from "@/core/actions/profissionais-tecnicos/create_profissional_tecnico_action";
import {
  createProfissionalTecnicoSchema,
  type CreateProfissionalTecnicoInput,
} from "@/core/schemas/profissionais-tecnicos/create_profissional_tecnico_schema";
import {
  PROFISSIONAL_TECNICO_FORM_ALL_INPUT_KEYS,
  PROFISSIONAL_TECNICO_FORM_EXPECTED_LABELS,
  PROFISSIONAL_TECNICO_FORM_REQUIRED_FIELDS,
  PROFISSIONAL_TECNICO_FORM_EXPECTED_FIELDS,
} from "./__tests__/profissional-tecnico-form.constants";
import {
  buildProfissionalTecnicoMock,
  mockProfissionalTecnicoCompleto,
  mockProfissionalTecnicoCompletoOutput,
  mockProfissionalTecnicoMinimo,
  PROFISSIONAL_TECNICO_UUIDS,
} from "./__tests__/profissional-tecnico-form.mocks";
import { CriarProfissionalTecnicoModal } from "./criar-profissional-tecnico-modal";

describe("profissional-tecnico — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(PROFISSIONAL_TECNICO_FORM_EXPECTED_LABELS).toEqual(
      expect.arrayContaining(["Pessoa", "Conselho", "UF do registro", "Número do registro", "Título profissional", "Ativo"]),
    );
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = PROFISSIONAL_TECNICO_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(PROFISSIONAL_TECNICO_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of PROFISSIONAL_TECNICO_FORM_REQUIRED_FIELDS) {
      expect(PROFISSIONAL_TECNICO_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("profissional-tecnico — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo e transforma a saída", () => {
    const resultado = createProfissionalTecnicoSchema.safeParse(mockProfissionalTecnicoCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockProfissionalTecnicoCompletoOutput);
    }
  });

  it("aceita o formulário mínimo com campos opcionais vazios", () => {
    const resultado = createProfissionalTecnicoSchema.safeParse(mockProfissionalTecnicoMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        pessoaId: PROFISSIONAL_TECNICO_UUIDS.pessoaId,
        conselho: "CREA",
        numeroRegistro: "5069884120",
      });
      expect(resultado.data.ufRegistro).toBeUndefined();
      expect(resultado.data.titulo).toBeUndefined();
    }
  });
});

describe("profissional-tecnico — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CreateProfissionalTecnicoInput) {
    const resultado = createProfissionalTecnicoSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra pessoaId sem UUID", () => {
    expect(caminhosDeErro(buildProfissionalTecnicoMock({ pessoaId: "" }))).toContain(
      "pessoaId",
    );
  });

  it("barra numeroRegistro vazio", () => {
    expect(caminhosDeErro(buildProfissionalTecnicoMock({ numeroRegistro: "" }))).toContain(
      "numeroRegistro",
    );
  });

  it("barra ufRegistro com tamanho inválido", () => {
    expect(caminhosDeErro(buildProfissionalTecnicoMock({ ufRegistro: "SPP" }))).toContain(
      "ufRegistro",
    );
  });
});
