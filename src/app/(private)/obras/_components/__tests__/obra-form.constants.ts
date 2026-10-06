import type { CriarObraFormularioInput } from "@/core/schemas/obras/create_obra_schema";

/**
 * Contrato esperado da UI do formulário de obra pública
 * (espelho de `criar-obra-modal.tsx`).
 *
 * Estes constants representam as interfaces dos schemas:
 * se a UI mudar (step, campo, label), o spec quebra de propósito.
 */

export const OBRA_FORM_EXPECTED_STEPS = [
  "Identificação",
  "Organização",
  "Classificação",
  "Detalhes",
  "Orçamentos",
  "Revisão",
] as const;

export const OBRA_FORM_EXPECTED_FIELDS_BY_STEP: ReadonlyArray<
  ReadonlyArray<keyof CriarObraFormularioInput>
> = [
  ["nome", "tipo", "descricao"],
  [
    "responsavelUsuarioId",
    "orgaoId",
    "setorId",
    "localidadeId",
    "seguirAutomatico",
  ],
  [
    "eixoId",
    "classificacaoId",
    "subclassificacaoId",
    "tipologiaId",
    "subtipologiaId",
  ],
  [
    "tipoFinanciamento",
    "modoDuracao",
    "dataInicio",
    "dataPrazo",
    "acaoConveniada",
    "prioritaria",
    "unidadeMedida",
    "quantidade",
    "programaPpa",
    "secretario",
    "dataPactuada",
  ],
  ["orcamentos"],
  [],
];

/** Campos que bloqueiam o avanço do wizard (validação por step). */
export const OBRA_FORM_REQUIRED_FIELDS = [
  "nome",
  "responsavelUsuarioId",
  "orgaoId",
  "orcamentos",
] as const satisfies ReadonlyArray<keyof CriarObraFormularioInput>;

/** Todas as chaves do schema de entrada do formulário. */
export const OBRA_FORM_ALL_INPUT_KEYS: ReadonlyArray<
  keyof CriarObraFormularioInput
> = [
  "nome",
  "tipo",
  "descricao",
  "responsavelUsuarioId",
  "orgaoId",
  "setorId",
  "localidadeId",
  "eixoId",
  "classificacaoId",
  "subclassificacaoId",
  "tipologiaId",
  "subtipologiaId",
  "seguirAutomatico",
  "tipoFinanciamento",
  "modoDuracao",
  "dataInicio",
  "dataPrazo",
  "acaoConveniada",
  "prioritaria",
  "unidadeMedida",
  "quantidade",
  "programaPpa",
  "secretario",
  "dataPactuada",
  "orcamentos",
];

export const OBRA_FORM_EXPECTED_TIPO_FINANCIAMENTO_LABELS = {
  COM_OGU: "Com OGU",
  SEM_OGU: "Sem OGU",
  INVESTIMENTO_PRIVADO: "Investimento privado",
} as const;

export const OBRA_FORM_EXPECTED_MODO_DURACAO_LABELS = {
  DEFINIDO_PELO_USUARIO: "Definido pelo usuário",
  ESTAGIO_ATUAL: "Estágio atual",
  TOTAL_ATIVIDADES: "Total de atividades",
  EXECUCAO_CONTRATO: "Execução do contrato",
} as const;

export const OBRA_FORM_EXPECTED_ACAO_CONVENIADA_LABELS = {
  NAO: "Não",
  FEDERAL: "Federal",
  ESTADUAL: "Estadual",
} as const;

export const OBRA_FORM_EXPECTED_TIPO_OBRA_LABELS = {
  AQUISICAO: "Aquisição",
  INVESTIMENTO_PRIVADO: "Investimento privado",
  OBRA: "Obra",
  PROGRAMA_PROJETO: "Programa / projeto",
  SERVICOS: "Serviços",
} as const;

/** Rótulos da tela de Revisão (step 5) — garante que a UI exibe tudo. */
export const OBRA_FORM_EXPECTED_REVIEW_LABELS = [
  "Nome",
  "Tipo",
  "Descrição",
  "Responsável",
  "Órgão",
  "Orçamentos",
  "Financiamento",
  "Modo de duração",
  "Data início",
  "Data prazo",
  "Ação conveniada",
  "Prioritária",
  "Unidade de medida",
  "Quantidade",
  "Programa PPA",
  "Secretário(a)",
  "Data pactuada",
  "Tags",
] as const;
