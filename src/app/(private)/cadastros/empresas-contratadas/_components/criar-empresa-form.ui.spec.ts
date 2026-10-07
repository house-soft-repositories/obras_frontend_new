import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/empresas/create_empresa_action", () => ({
  criarEmpresaAction: vi.fn(),
}));

import {
  criarEmpresaSchema,
  type CriarEmpresaInput,
} from "@/core/schemas/empresas/create_empresa_schema";
import {
  steps,
  fieldsByStep,
} from "./criar-empresa-modal";
import {
  EMPRESA_FORM_ALL_INPUT_KEYS,
  EMPRESA_FORM_EXPECTED_FIELDS_BY_STEP,
  EMPRESA_FORM_EXPECTED_STEPS,
  EMPRESA_FORM_REQUIRED_FIELDS,
} from "./__tests__/empresa-form.constants";
import {
  buildEmpresaFormMock,
  mockEmpresaFormCompleto,
  mockEmpresaFormCompletoOutput,
  mockEmpresaFormMinimo,
} from "./__tests__/empresa-form.mocks";

describe("empresa — contrato da UI (wizard)", () => {
  it("tem 3 steps na ordem esperada", () => {
    expect(steps).toEqual([...EMPRESA_FORM_EXPECTED_STEPS]);
  });

  it("distribui os campos por step conforme o esperado", () => {
    expect(fieldsByStep).toEqual(
      EMPRESA_FORM_EXPECTED_FIELDS_BY_STEP.map((step) => [...step]),
    );
  });

  it("cobre todas as chaves do schema, uma única vez", () => {
    const achatado = fieldsByStep.flat();
    expect([...achatado].sort()).toEqual([...EMPRESA_FORM_ALL_INPUT_KEYS].sort());
    expect(new Set(achatado).size).toBe(EMPRESA_FORM_ALL_INPUT_KEYS.length);
  });

  it("mantém os campos obrigatórios nos steps que bloqueiam o avanço", () => {
    for (const campo of EMPRESA_FORM_REQUIRED_FIELDS) {
      const stepIndex = fieldsByStep.findIndex((step) =>
        (step as string[]).includes(campo),
      );
      expect(stepIndex, `campo obrigatório ${campo} fora do wizard`).toBeGreaterThanOrEqual(0);
    }
    expect(fieldsByStep[0]).toContain("razaoSocial");
    expect(fieldsByStep[0]).toContain("cnpj");
  });
});

describe("empresa — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo e transforma a saída (CNPJ limpo, telefones filtrados)", () => {
    const resultado = criarEmpresaSchema.safeParse(mockEmpresaFormCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockEmpresaFormCompletoOutput);
    }
  });

  it("aceita o formulário mínimo e omite os opcionais vazios", () => {
    const resultado = criarEmpresaSchema.safeParse(mockEmpresaFormMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        razaoSocial: "Empresa Teste",
        cnpj: "11222333000181",
      });
      expect(resultado.data.nomeFantasia).toBeUndefined();
      expect(resultado.data.responsavel).toBeUndefined();
      expect(resultado.data.email).toBeUndefined();
      expect(resultado.data.telefones).toHaveLength(0);
    }
  });
});

describe("empresa — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarEmpresaInput) {
    const resultado = criarEmpresaSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra razão social com menos de 2 caracteres (step Empresa)", () => {
    expect(
      caminhosDeErro(buildEmpresaFormMock({ razaoSocial: "A" })),
    ).toContain("razaoSocial");
  });

  it("barra CNPJ inválido (step Empresa)", () => {
    expect(
      caminhosDeErro(buildEmpresaFormMock({ cnpj: "12345678901234" })),
    ).toContain(
      "cnpj",
    );
  });

  it("barra e-mail inválido (step Contato)", () => {
    expect(
      caminhosDeErro(buildEmpresaFormMock({ email: "invalido" })),
    ).toContain("email");
  });

  it("barra UF com mais de 2 caracteres (step Endereço)", () => {
    expect(
      caminhosDeErro(buildEmpresaFormMock({ uf: "BRASIL" })),
    ).toContain("uf");
  });
});
