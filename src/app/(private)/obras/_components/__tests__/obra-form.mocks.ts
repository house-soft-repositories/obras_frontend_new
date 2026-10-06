import type {
  CriarObraFormularioInput,
  CriarObraOutput,
} from "@/core/schemas/obras/create_obra_schema";

/**
 * Mocks do formulário de obra pública.
 * Todos tipados pelos schemas (`CriarObraFormularioInput` / `CriarObraOutput`)
 * para representar fielmente as interfaces da UI.
 */

const UUIDS = {
  responsavelUsuarioId: "550e8400-e29b-41d4-a716-446655440001",
  orgaoId: "550e8400-e29b-41d4-a716-446655440002",
  setorId: "550e8400-e29b-41d4-a716-446655440003",
  localidadeId: "550e8400-e29b-41d4-a716-446655440004",
  eixoId: "550e8400-e29b-41d4-a716-446655440005",
  classificacaoId: "550e8400-e29b-41d4-a716-446655440006",
  subclassificacaoId: "550e8400-e29b-41d4-a716-446655440007",
  tipologiaId: "550e8400-e29b-41d4-a716-446655440008",
  subtipologiaId: "550e8400-e29b-41d4-a716-446655440009",
  fonteA: "550e8400-e29b-41d4-a716-446655440010",
  fonteB: "550e8400-e29b-41d4-a716-446655440011",
} as const;

export const OBRA_FORM_UUIDS = UUIDS;

export type ObraFormOption = { id: string; nome: string };

/** Opções dos <select> da UI (Responsável, Órgão, Fontes, ...). */
export const mockObraFormOptions: Record<string, ObraFormOption[]> = {
  usuarios: [{ id: UUIDS.responsavelUsuarioId, nome: "Maria Responsável" }],
  orgaos: [{ id: UUIDS.orgaoId, nome: "Secretaria de Obras" }],
  setores: [{ id: UUIDS.setorId, nome: "Setor Norte" }],
  localidades: [{ id: UUIDS.localidadeId, nome: "Bairro Centro" }],
  fontes: [
    { id: UUIDS.fonteA, nome: "Tesouro Municipal" },
    { id: UUIDS.fonteB, nome: "Convênio Federal" },
  ],
  eixos: [{ id: UUIDS.eixoId, nome: "Infraestrutura" }],
  classificacoes: [{ id: UUIDS.classificacaoId, nome: "Edificações" }],
  tipologias: [{ id: UUIDS.tipologiaId, nome: "Escolar" }],
};

/** Cenário feliz: todos os campos preenchidos (passa em todos os steps). */
export const mockObraFormCompleto: CriarObraFormularioInput = {
  nome: "Reforma da Escola Municipal",
  tipo: "OBRA",
  descricao: "Reforma completa com acessibilidade.",
  responsavelUsuarioId: UUIDS.responsavelUsuarioId,
  orgaoId: UUIDS.orgaoId,
  setorId: UUIDS.setorId,
  localidadeId: UUIDS.localidadeId,
  eixoId: UUIDS.eixoId,
  classificacaoId: UUIDS.classificacaoId,
  subclassificacaoId: UUIDS.subclassificacaoId,
  tipologiaId: UUIDS.tipologiaId,
  subtipologiaId: UUIDS.subtipologiaId,
  seguirAutomatico: true,
  tipoFinanciamento: "COM_OGU",
  modoDuracao: "DEFINIDO_PELO_USUARIO",
  dataInicio: "01/02/2026",
  dataPrazo: "30/11/2026",
  acaoConveniada: "FEDERAL",
  prioritaria: true,
  unidadeMedida: "m²",
  quantidade: "1200",
  programaPpa: "Educação de qualidade",
  secretario: "João Secretário",
  dataPactuada: "15/01/2026",
  orcamentos: [
    { fonteId: UUIDS.fonteA, valorCentavos: 15000000 },
    { fonteId: UUIDS.fonteB, valorCentavos: 5000000 },
  ],
};

/** Cenário mínimo: só o obrigatório (todos os steps opcionais vazios). */
export const mockObraFormMinimo: CriarObraFormularioInput = {
  nome: "Praça Central",
  tipo: "SERVICOS",
  descricao: "",
  responsavelUsuarioId: UUIDS.responsavelUsuarioId,
  orgaoId: UUIDS.orgaoId,
  setorId: "",
  localidadeId: "",
  eixoId: "",
  classificacaoId: "",
  subclassificacaoId: "",
  tipologiaId: "",
  subtipologiaId: "",
  seguirAutomatico: false,
  tipoFinanciamento: "SEM_OGU",
  modoDuracao: "DEFINIDO_PELO_USUARIO",
  dataInicio: "",
  dataPrazo: "",
  acaoConveniada: "NAO",
  prioritaria: false,
  unidadeMedida: "",
  quantidade: "",
  programaPpa: "",
  secretario: "",
  dataPactuada: "",
  orcamentos: [{ fonteId: UUIDS.fonteA, valorCentavos: 250000 }],
};

/** Payload transformado esperado do cenário feliz (saída do schema). */
export const mockObraFormCompletoOutput: CriarObraOutput = {
  nome: "Reforma da Escola Municipal",
  tipo: "OBRA",
  responsavelUsuarioId: UUIDS.responsavelUsuarioId,
  orgaoId: UUIDS.orgaoId,
  setorId: UUIDS.setorId,
  localidadeId: UUIDS.localidadeId,
  eixoId: UUIDS.eixoId,
  classificacaoId: UUIDS.classificacaoId,
  subclassificacaoId: UUIDS.subclassificacaoId,
  tipologiaId: UUIDS.tipologiaId,
  subtipologiaId: UUIDS.subtipologiaId,
  descricao: "Reforma completa com acessibilidade.",
  tipoFinanciamento: "COM_OGU",
  modoDuracao: "DEFINIDO_PELO_USUARIO",
  acaoConveniada: "FEDERAL",
  prioritaria: true,
  dataInicio: "2026-02-01",
  dataPrazo: "2026-11-30",
  dataPactuada: "2026-01-15",
  unidadeMedida: "m²",
  quantidade: "1200",
  programaPpa: "Educação de qualidade",
  secretario: "João Secretário",
  seguirAutomatico: true,
  orcamentos: [
    { fonteId: UUIDS.fonteA, valor: "150000.00" },
    { fonteId: UUIDS.fonteB, valor: "50000.00" },
  ],
};

export function buildObraFormMock(
  override: Partial<CriarObraFormularioInput> = {},
): CriarObraFormularioInput {
  return {
    ...mockObraFormCompleto,
    ...override,
    orcamentos: override.orcamentos ?? mockObraFormCompleto.orcamentos,
  };
}
