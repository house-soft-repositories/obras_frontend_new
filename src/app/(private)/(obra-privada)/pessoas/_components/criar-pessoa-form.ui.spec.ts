import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/pessoa/create_pessoa_action", () => ({
  criarPessoaAction: vi.fn(),
}));

import {
  createPessoaSchema,
  type CreatePessoaInput,
} from "@/core/schemas/pessoa/create_pessoa_schema";
import {
  steps,
  fieldsByStep,
} from "./criar-pessoa-modal";
import {
  PESSOA_FORM_ALL_INPUT_KEYS,
  PESSOA_FORM_EXPECTED_FIELDS_BY_STEP,
  PESSOA_FORM_EXPECTED_STEPS,
  PESSOA_FORM_REQUIRED_FIELDS,
} from "./__tests__/pessoa-form.constants";
import {
  buildPessoaFormMock,
  mockPessoaFormCompleto,
  mockPessoaFormCompletoOutput,
  mockPessoaFormMinimo,
} from "./__tests__/pessoa-form.mocks";

describe("pessoa — contrato da UI (wizard)", () => {
  it("tem 3 steps na ordem esperada", () => {
    expect(steps).toEqual([...PESSOA_FORM_EXPECTED_STEPS]);
  });

  it("distribui os campos por step conforme o esperado", () => {
    expect(fieldsByStep).toEqual(
      PESSOA_FORM_EXPECTED_FIELDS_BY_STEP.map((step) => [...step]),
    );
  });

  it("cobre todas as chaves do schema, uma única vez", () => {
    const achatado = fieldsByStep.flat();
    expect([...achatado].sort()).toEqual([...PESSOA_FORM_ALL_INPUT_KEYS].sort());
    expect(new Set(achatado).size).toBe(PESSOA_FORM_ALL_INPUT_KEYS.length);
  });

  it("mantém os campos obrigatórios nos steps que bloqueiam o avanço", () => {
    for (const campo of PESSOA_FORM_REQUIRED_FIELDS) {
      const stepIndex = fieldsByStep.findIndex((step) =>
        (step as string[]).includes(campo),
      );
      expect(stepIndex, `campo obrigatório ${campo} fora do wizard`).toBeGreaterThanOrEqual(0);
    }
    expect(fieldsByStep[0]).toContain("nome");
    expect(fieldsByStep[0]).toContain("documento");
  });
});

describe("pessoa — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo e transforma a saída (limpa strings vazias)", () => {
    const resultado = createPessoaSchema.safeParse(mockPessoaFormCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockPessoaFormCompletoOutput);
    }
  });

  it("aceita o formulário mínimo e omite os opcionais vazios", () => {
    const resultado = createPessoaSchema.safeParse(mockPessoaFormMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        tipo: "FISICA",
        nome: "Maria",
        documento: "98765432100",
      });
      expect(resultado.data.nomeFantasia).toBeUndefined();
      expect(resultado.data.rg).toBeUndefined();
      expect(resultado.data.email).toBeUndefined();
    }
  });
});

describe("pessoa — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CreatePessoaInput) {
    const resultado = createPessoaSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome com menos de 2 caracteres (step Dados)", () => {
    expect(caminhosDeErro(buildPessoaFormMock({ nome: "A" }))).toContain("nome");
  });

  it("barra documento com menos de 11 dígitos (step Dados)", () => {
    expect(caminhosDeErro(buildPessoaFormMock({ documento: "123" }))).toContain(
      "documento",
    );
  });

  it("barra CPF com letras (step Dados)", () => {
    expect(
      caminhosDeErro(buildPessoaFormMock({ documento: "abc" })),
    ).toContain("documento");
  });

  it("barra e-mail inválido (step Contato)", () => {
    expect(
      caminhosDeErro(buildPessoaFormMock({ email: "invalido" })),
    ).toContain("email");
  });

  it("barra UF com mais de 2 caracteres (step Endereço)", () => {
    expect(caminhosDeErro(buildPessoaFormMock({ uf: "CEARA" }))).toContain("uf");
  });
});
