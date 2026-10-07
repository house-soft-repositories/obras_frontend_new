import type {
  CriarEixoInput,
  CriarEixoOutput,
} from "@/core/schemas/cadastros/create_eixo_schema";

export const mockEixoCompleto: CriarEixoInput = {
  nome: "Infraestrutura",
};

export const mockEixoCompletoOutput: CriarEixoOutput = {
  nome: "Infraestrutura",
};

export const mockEixoMinimo: CriarEixoInput = {
  nome: "Saúde",
};

export function buildEixoMock(
  override: Partial<CriarEixoInput> = {},
): CriarEixoInput {
  return {
    ...mockEixoCompleto,
    ...override,
  };
}
