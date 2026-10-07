import type { CreateProfissionalTecnicoInput, CreateProfissionalTecnicoOutput } from "@/core/schemas/profissionais-tecnicos/create_profissional_tecnico_schema";

export const PROFISSIONAL_TECNICO_UUIDS = {
  pessoaId: "550e8400-e29b-41d4-a716-446655440001",
} as const;

export type PessoaOption = { id: string; nome: string };

export const mockPessoaOptions: PessoaOption[] = [
  { id: PROFISSIONAL_TECNICO_UUIDS.pessoaId, nome: "João Silva" },
];

export const mockProfissionalTecnicoCompleto: CreateProfissionalTecnicoInput = {
  pessoaId: PROFISSIONAL_TECNICO_UUIDS.pessoaId,
  conselho: "CREA",
  numeroRegistro: "5069884120",
  ufRegistro: "SP",
  titulo: "Eng. Civil",
  ativo: true,
};

export const mockProfissionalTecnicoCompletoOutput: CreateProfissionalTecnicoOutput = {
  pessoaId: PROFISSIONAL_TECNICO_UUIDS.pessoaId,
  conselho: "CREA",
  numeroRegistro: "5069884120",
  ufRegistro: "SP",
  titulo: "Eng. Civil",
  ativo: true,
};

export const mockProfissionalTecnicoMinimo: CreateProfissionalTecnicoInput = {
  pessoaId: PROFISSIONAL_TECNICO_UUIDS.pessoaId,
  conselho: "CREA",
  numeroRegistro: "5069884120",
  ufRegistro: "",
  titulo: "",
  ativo: false,
};

export function buildProfissionalTecnicoMock(
  override: Partial<CreateProfissionalTecnicoInput> = {},
): CreateProfissionalTecnicoInput {
  return {
    ...mockProfissionalTecnicoCompleto,
    ...override,
  };
}
