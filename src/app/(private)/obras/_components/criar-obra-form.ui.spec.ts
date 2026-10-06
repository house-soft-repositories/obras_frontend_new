import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/obras/create_obra_action", () => ({
  default: vi.fn(),
}));
vi.mock("@/core/actions/obras/tags_actions", () => ({
  aplicarTagsAction: vi.fn(),
}));
vi.mock(
  "@/core/actions/cadastros/list_subclassificacoes_pagination_action",
  () => ({ default: vi.fn() }),
);
vi.mock(
  "@/core/actions/cadastros/list_subtipologias_pagination_action",
  () => ({ default: vi.fn() }),
);
import {
  criarObraFormularioSchema,
  type CriarObraFormularioInput,
} from "@/core/schemas/obras/create_obra_schema";
import {
  TIPO_OBRA_LABELS,
  tipoObraSchema,
} from "@/core/schemas/obras/tipo_obra";
import {
  ACAO_CONVENIADA_LABELS,
  MODO_DURACAO_LABELS,
  TIPO_FINANCIAMENTO_LABELS,
  fieldsByStep,
  initialValues,
  steps,
} from "./criar-obra-modal";
import {
  OBRA_FORM_ALL_INPUT_KEYS,
  OBRA_FORM_EXPECTED_ACAO_CONVENIADA_LABELS,
  OBRA_FORM_EXPECTED_FIELDS_BY_STEP,
  OBRA_FORM_EXPECTED_MODO_DURACAO_LABELS,
  OBRA_FORM_EXPECTED_REVIEW_LABELS,
  OBRA_FORM_EXPECTED_STEPS,
  OBRA_FORM_EXPECTED_TIPO_FINANCIAMENTO_LABELS,
  OBRA_FORM_EXPECTED_TIPO_OBRA_LABELS,
  OBRA_FORM_REQUIRED_FIELDS,
} from "./__tests__/obra-form.constants";
import {
  buildObraFormMock,
  mockObraFormCompleto,
  mockObraFormCompletoOutput,
  mockObraFormMinimo,
  mockObraFormOptions,
} from "./__tests__/obra-form.mocks";

describe("obra pública — contrato da UI (wizard)", () => {
  it("tem 6 steps na ordem esperada", () => {
    expect(steps).toEqual([...OBRA_FORM_EXPECTED_STEPS]);
  });

  it("distribui os campos por step conforme o esperado", () => {
    expect(fieldsByStep).toEqual(
      OBRA_FORM_EXPECTED_FIELDS_BY_STEP.map((step) => [...step]),
    );
  });

  it("cobre todas as chaves do schema, uma única vez (revisão sem campos)", () => {
    const achatado = fieldsByStep.flat();
    expect([...achatado].sort()).toEqual([...OBRA_FORM_ALL_INPUT_KEYS].sort());
    expect(new Set(achatado).size).toBe(OBRA_FORM_ALL_INPUT_KEYS.length);
    expect(fieldsByStep[5]).toEqual([]);
  });

  it("mantém os campos obrigatórios nos steps que bloqueiam o avanço", () => {
    for (const campo of OBRA_FORM_REQUIRED_FIELDS) {
      const stepIndex = fieldsByStep.findIndex((step) =>
        (step as string[]).includes(campo),
      );
      expect(stepIndex, `campo obrigatório ${campo} fora do wizard`).toBeGreaterThanOrEqual(0);
    }
    expect(fieldsByStep[0]).toContain("nome");
    expect(fieldsByStep[1]).toEqual(
      expect.arrayContaining(["responsavelUsuarioId", "orgaoId"]),
    );
    expect(fieldsByStep[4]).toContain("orcamentos");
  });

  it("inicia com valores vazios e um orçamento (sem quebrar o schema base)", () => {
    expect(Object.keys(initialValues).sort()).toEqual(
      [...OBRA_FORM_ALL_INPUT_KEYS].sort(),
    );
    expect(initialValues.orcamentos).toHaveLength(1);
    expect(initialValues.tipo).toBe("OBRA");
  });

  it("exibe labels para todos os valores dos enums", () => {
    expect(TIPO_FINANCIAMENTO_LABELS).toEqual(
      OBRA_FORM_EXPECTED_TIPO_FINANCIAMENTO_LABELS,
    );
    expect(MODO_DURACAO_LABELS).toEqual(
      OBRA_FORM_EXPECTED_MODO_DURACAO_LABELS,
    );
    expect(ACAO_CONVENIADA_LABELS).toEqual(
      OBRA_FORM_EXPECTED_ACAO_CONVENIADA_LABELS,
    );
    expect(TIPO_OBRA_LABELS).toEqual(OBRA_FORM_EXPECTED_TIPO_OBRA_LABELS);
    for (const valor of tipoObraSchema.options) {
      expect(TIPO_OBRA_LABELS[valor]).toBeTruthy();
    }
  });

  it("cobre os campos principais na tela de revisão", () => {
    expect(new Set(OBRA_FORM_EXPECTED_REVIEW_LABELS).size).toBe(
      OBRA_FORM_EXPECTED_REVIEW_LABELS.length,
    );
    for (const rotulo of [
      "Nome",
      "Tipo",
      "Responsável",
      "Órgão",
      "Orçamentos",
      "Financiamento",
    ]) {
      expect(OBRA_FORM_EXPECTED_REVIEW_LABELS).toContain(rotulo);
    }
  });

  it("alimenta os selects com opções { id, nome } válidas", () => {
    for (const [chave, opcoes] of Object.entries(mockObraFormOptions)) {
      expect(opcoes.length, chave).toBeGreaterThan(0);
      for (const opcao of opcoes) {
        expect(opcao.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        );
        expect(opcao.nome.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("obra pública — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo e transforma a saída (centavos → reais, datas BR → ISO)", () => {
    const resultado = criarObraFormularioSchema.safeParse(mockObraFormCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockObraFormCompletoOutput);
    }
  });

  it("aceita o formulário mínimo e omite os opcionais vazios", () => {
    const resultado = criarObraFormularioSchema.safeParse(mockObraFormMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        nome: "Praça Central",
        tipo: "SERVICOS",
        orcamentos: [{ valor: "2500.00" }],
      });
      expect(resultado.data).not.toHaveProperty("setorId");
      expect(resultado.data).not.toHaveProperty("dataInicio");
      expect(resultado.data).not.toHaveProperty("descricao");
    }
  });
});

describe("obra pública — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CriarObraFormularioInput) {
    const resultado = criarObraFormularioSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome com menos de 2 caracteres (step Identificação)", () => {
    expect(caminhosDeErro(buildObraFormMock({ nome: "A" }))).toContain("nome");
  });

  it("barra responsável/órgão sem UUID (step Organização)", () => {
    expect(
      caminhosDeErro(
        buildObraFormMock({ responsavelUsuarioId: "", orgaoId: "" }),
      ),
    ).toEqual(
      expect.arrayContaining(["responsavelUsuarioId", "orgaoId"]),
    );
  });

  it("barra subclassificação quando o tipo não é OBRA (step Classificação)", () => {
    const caminhos = caminhosDeErro(
      buildObraFormMock({
        tipo: "SERVICOS",
        subclassificacaoId: "550e8400-e29b-41d4-a716-446655440007",
      }),
    );
    expect(caminhos).toContain("subclassificacaoId");
  });

  it("barra data e quantidade inválidas (step Detalhes)", () => {
    expect(
      caminhosDeErro(
        buildObraFormMock({ dataInicio: "31/02/2026", quantidade: "abc" }),
      ),
    ).toEqual(expect.arrayContaining(["dataInicio", "quantidade"]));
  });

  it("barra orçamento vazio ou sem fonte (step Orçamentos)", () => {
    expect(caminhosDeErro(buildObraFormMock({ orcamentos: [] }))).toContain(
      "orcamentos",
    );
    expect(
      caminhosDeErro(buildObraFormMock({ orcamentos: [] })).length,
    ).toBeGreaterThan(0);
    const semFonte = criarObraFormularioSchema.safeParse(
      buildObraFormMock({ orcamentos: [{ fonteId: "", valorCentavos: 100 }] }),
    );
    expect(semFonte.success).toBe(false);
  });
});
