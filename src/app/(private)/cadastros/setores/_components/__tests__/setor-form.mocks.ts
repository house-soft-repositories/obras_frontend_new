import type { CriarSetorInput, CriarSetorOutput } from "@/core/schemas/setores/create_setor_schema";

export const SETOR_UUIDS = {
  orgaoId: "550e8400-e29b-41d4-a716-446655440001",
  setorId: "550e8400-e29b-41d4-a716-446655440002",
} as const;

export type SetorFormOption = { id: string; nome: string };

export const mockSetorOptions: Record<string, SetorFormOption[]> = {
  orgaos: [{ id: SETOR_UUIDS.orgaoId, nome: "Secretaria de Obras" }],
};

export const mockSetorCompleto: CriarSetorInput = {
  orgaoId: SETOR_UUIDS.orgaoId,
  nome: "Setor Norte",
  ativo: true,
};

export const mockSetorCompletoOutput: CriarSetorOutput = {
  orgaoId: SETOR_UUIDS.orgaoId,
  nome: "Setor Norte",
  ativo: true,
};

export const mockSetorMinimo: CriarSetorInput = {
  orgaoId: SETOR_UUIDS.orgaoId,
  nome: "Setor Norte",
  ativo: false,
};

export function buildSetorMock(
  override: Partial<CriarSetorInput> = {},
): CriarSetorInput {
  return {
    ...mockSetorCompleto,
    ...override,
  };
}
