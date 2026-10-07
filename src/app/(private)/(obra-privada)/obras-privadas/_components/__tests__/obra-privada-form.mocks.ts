import type {
  CriarObraPrivadaFormularioInput,
  CriarObraPrivadaOutput,
} from "@/core/schemas/obras-privadas/create_obra_privada_schema";

const UUIDS = {
  proprietarioId: "550e8400-e29b-41d4-a716-446655440200",
  localidadeId: "550e8400-e29b-41d4-a716-446655440201",
  orgaoId: "550e8400-e29b-41d4-a716-446655440202",
} as const;

export const OBRA_PRIVADA_FORM_UUIDS = UUIDS;

export type ObraPrivadaFormOption = { id: string; nome: string };

export const mockObraPrivadaFormOptions: Record<string, ObraPrivadaFormOption[]> = {
  proprietarios: [{ id: UUIDS.proprietarioId, nome: "João Proprietário" }],
  orgaos: [{ id: UUIDS.orgaoId, nome: "Secretaria de Obras" }],
  localidades: [{ id: UUIDS.localidadeId, nome: "Fortaleza - CE" }],
};

export const mockObraPrivadaFormCompleto: CriarObraPrivadaFormularioInput = {
  descricao: "Reforma completa da residência",
  observacoes: "Inclui acessibilidade",
  proprietarioPessoaId: UUIDS.proprietarioId,
  orgaoId: UUIDS.orgaoId,
  localidadeId: UUIDS.localidadeId,
  inscricaoImobiliaria: "12345-67",
  matriculaRgi: "RGI-001",
  cartorio: "Cartório Central",
  cep: "60000-000",
  logradouro: "Rua das Palmeiras",
  numero: "100",
  complemento: "",
  bairro: "Meireles",
  uf: "CE",
  latitude: "-3.7319",
  longitude: "-38.5267",
  geoOrigem: "",
  andamento: "EM_ANDAMENTO",
  habiteSe: "SOLICITADO",
  dataInicio: "2026-03-01",
  dataPrevistaConclusao: "2026-09-01",
};

export const mockObraPrivadaFormCompletoOutput: CriarObraPrivadaOutput = {
  descricao: "Reforma completa da residência",
  observacoes: "Inclui acessibilidade",
  proprietarioPessoaId: UUIDS.proprietarioId,
  orgaoId: UUIDS.orgaoId,
  localidadeId: UUIDS.localidadeId,
  inscricaoImobiliaria: "12345-67",
  matriculaRgi: "RGI-001",
  cartorio: "Cartório Central",
  cep: "60000-000",
  logradouro: "Rua das Palmeiras",
  numero: "100",
  bairro: "Meireles",
  uf: "CE",
  latitude: "-3.7319",
  longitude: "-38.5267",
  andamento: "EM_ANDAMENTO",
  habiteSe: "SOLICITADO",
  dataInicio: "2026-03-01",
  dataPrevistaConclusao: "2026-09-01",
};

export const mockObraPrivadaFormMinimo: CriarObraPrivadaFormularioInput = {
  descricao: "Obra teste",
  observacoes: "",
  proprietarioPessoaId: UUIDS.proprietarioId,
  orgaoId: "",
  localidadeId: "",
  inscricaoImobiliaria: "",
  matriculaRgi: "",
  cartorio: "",
  cep: "",
  logradouro: "Rua Teste",
  numero: "",
  complemento: "",
  bairro: "",
  uf: "CE",
  latitude: "",
  longitude: "",
  geoOrigem: "",
  andamento: "",
  habiteSe: "",
  dataInicio: "",
  dataPrevistaConclusao: "",
};

export function buildObraPrivadaFormMock(
  override: Partial<CriarObraPrivadaFormularioInput> = {},
): CriarObraPrivadaFormularioInput {
  return {
    ...mockObraPrivadaFormCompleto,
    ...override,
  };
}
