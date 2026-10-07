import type { CriarOrgaoInput, CriarOrgaoOutput } from "@/core/schemas/orgaos/create_orgao_schema";

export const ORGAO_UUIDS = {
  localidadeId: "550e8400-e29b-41d4-a716-446655440001",
} as const;

export type OrgaoFormOption = { id: string; nome: string };

export const mockOrgaoOptions: Record<string, OrgaoFormOption[]> = {
  localidades: [
    { id: ORGAO_UUIDS.localidadeId, nome: "São Paulo - SP" },
  ],
};

export const mockOrgaoCompleto: CriarOrgaoInput = {
  localidadeId: ORGAO_UUIDS.localidadeId,
  nome: "Secretaria de Obras",
  sigla: "SO",
  tipo: "SECRETARIA",
  responsavel: "João Silva",
  email: "joao@prefeitura.sp.gov.br",
  telefone: "(11) 1234-5678",
  ativo: true,
};

export const mockOrgaoCompletoOutput: CriarOrgaoOutput = {
  localidadeId: ORGAO_UUIDS.localidadeId,
  nome: "Secretaria de Obras",
  sigla: "SO",
  tipo: "SECRETARIA",
  responsavel: "João Silva",
  email: "joao@prefeitura.sp.gov.br",
  telefone: "(11) 1234-5678",
  ativo: true,
};

export const mockOrgaoMinimo: CriarOrgaoInput = {
  localidadeId: ORGAO_UUIDS.localidadeId,
  nome: "Secretaria de Obras",
  sigla: "",
  tipo: undefined,
  responsavel: "",
  email: "",
  telefone: "",
  ativo: false,
};

export function buildOrgaoMock(
  override: Partial<CriarOrgaoInput> = {},
): CriarOrgaoInput {
  return {
    ...mockOrgaoCompleto,
    ...override,
  };
}
