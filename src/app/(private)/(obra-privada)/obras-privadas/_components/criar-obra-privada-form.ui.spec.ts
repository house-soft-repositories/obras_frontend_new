import { describe, expect, it, vi } from "vitest";

vi.mock(
  "@/core/actions/obras-privadas/create_obra_privada_action",
  () => ({
    default: vi.fn(),
  }),
);

import {
  criarObraPrivadaFormularioSchema,
  type CriarObraPrivadaFormularioInput,
} from "@/core/schemas/obras-privadas/create_obra_privada_schema";
import {
  ANDAMENTO_VALUES,
  ANDAMENTO_LABELS,
  HABITE_SE_VALUES,
  HABITE_SE_LABELS,
} from "@/core/schemas/obras-privadas/obra_privada_schema";
import {
  steps,
  fieldsByStep,
} from "./criar-obra-privada-modal";
import {
  OBRA_PRIVADA_FORM_ALL_INPUT_KEYS,
  OBRA_PRIVADA_FORM_EXPECTED_FIELDS_BY_STEP,
  OBRA_PRIVADA_FORM_EXPECTED_STEPS,
  OBRA_PRIVADA_FORM_REQUIRED_FIELDS,
  OBRA_PRIVADA_FORM_EXPECTED_ANDAMENTO_LABELS,
  OBRA_PRIVADA_FORM_EXPECTED_HABITE_SE_LABELS,
} from "./__tests__/obra-privada-form.constants";
import {
  buildObraPrivadaFormMock,
  mockObraPrivadaFormCompleto,
  mockObraPrivadaFormCompletoOutput,
  mockObraPrivadaFormMinimo,
  OBRA_PRIVADA_FORM_UUIDS,
} from "./__tests__/obra-privada-form.mocks";

describe("obra privada — contrato da UI (wizard)", () => {
  it("tem 5 steps na ordem esperada", () => {
    expect(steps).toEqual([...OBRA_PRIVADA_FORM_EXPECTED_STEPS]);
  });

  it("distribui os campos por step conforme o esperado", () => {
    expect(fieldsByStep).toEqual(
      OBRA_PRIVADA_FORM_EXPECTED_FIELDS_BY_STEP.map((step) => [...step]),
    );
  });

  it("cobre todas as chaves do schema, uma única vez (revisão sem campos)", () => {
    const achatado = fieldsByStep.flat();
    expect([...achatado].sort()).toEqual(
      [...OBRA_PRIVADA_FORM_ALL_INPUT_KEYS].sort(),
    );
    expect(new Set(achatado).size).toBe(OBRA_PRIVADA_FORM_ALL_INPUT_KEYS.length);
    expect(fieldsByStep[4]).toEqual([]);
  });

  it("mantém os campos obrigatórios nos steps que bloqueiam o avanço", () => {
    for (const campo of OBRA_PRIVADA_FORM_REQUIRED_FIELDS) {
      const stepIndex = fieldsByStep.findIndex((step) =>
        (step as string[]).includes(campo),
      );
      expect(stepIndex, `campo obrigatório ${campo} fora do wizard`).toBeGreaterThanOrEqual(0);
    }
    expect(fieldsByStep[0]).toContain("proprietarioPessoaId");
    expect(fieldsByStep[3]).toContain("descricao");
  });
});

describe("obra privada — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo e transforma a saída (limpa strings vazias)", () => {
    const resultado = criarObraPrivadaFormularioSchema.safeParse(
      mockObraPrivadaFormCompleto,
    );
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockObraPrivadaFormCompletoOutput);
    }
  });

  it("aceita o formulário mínimo e omite os opcionais vazios", () => {
    const resultado = criarObraPrivadaFormularioSchema.safeParse(
      mockObraPrivadaFormMinimo,
    );
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        descricao: "Obra teste",
        proprietarioPessoaId: OBRA_PRIVADA_FORM_UUIDS.proprietarioId,
        logradouro: "Rua Teste",
        uf: "CE",
      });
      expect(resultado.data).not.toHaveProperty("observacoes");
      expect(resultado.data).not.toHaveProperty("andamento");
      expect(resultado.data).not.toHaveProperty("habiteSe");
    }
  });
});

describe("obra privada — enums dos selects", () => {
  it("ANDAMENTO_LABELS cobre todos os valores do schema", () => {
    expect(ANDAMENTO_LABELS).toEqual(OBRA_PRIVADA_FORM_EXPECTED_ANDAMENTO_LABELS);
    for (const valor of ANDAMENTO_VALUES) {
      expect(ANDAMENTO_LABELS[valor]).toBeTruthy();
    }
  });

  it("HABITE_SE_LABELS cobre todos os valores do schema", () => {
    expect(HABITE_SE_LABELS).toEqual(OBRA_PRIVADA_FORM_EXPECTED_HABITE_SE_LABELS);
    for (const valor of HABITE_SE_VALUES) {
      expect(HABITE_SE_LABELS[valor]).toBeTruthy();
    }
  });
});

describe("obra privada — UI barra entradas inválidas", () => {
  function caminhosDeErro(
    input: CriarObraPrivadaFormularioInput,
  ) {
    const resultado = criarObraPrivadaFormularioSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra proprietário sem UUID (step Proprietário)", () => {
    expect(
      caminhosDeErro(buildObraPrivadaFormMock({ proprietarioPessoaId: "" })),
    ).toContain("proprietarioPessoaId");
  });

  it("barra descrição com menos de 3 caracteres (step Obra)", () => {
    expect(
      caminhosDeErro(buildObraPrivadaFormMock({ descricao: "AB" })),
    ).toContain("descricao");
  });

  it("barra logradouro com menos de 3 caracteres (step Obra)", () => {
    expect(
      caminhosDeErro(buildObraPrivadaFormMock({ logradouro: "R" })),
    ).toContain("logradouro");
  });

  it("barra UF com comprimento diferente de 2 (step Obra)", () => {
    expect(caminhosDeErro(buildObraPrivadaFormMock({ uf: "CEARA" }))).toContain(
      "uf",
    );
    expect(caminhosDeErro(buildObraPrivadaFormMock({ uf: "C" }))).toContain("uf");
  });
});
