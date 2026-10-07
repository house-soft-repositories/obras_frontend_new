import type {
  CriarTipologiaInput,
  CriarTipologiaOutput,
} from "@/core/schemas/cadastros/create_tipologia_schema";

export const mockTipologiaCompleto: CriarTipologiaInput = {
  nome: "Edificação",
};

export const mockTipologiaCompletoOutput: CriarTipologiaOutput = {
  nome: "Edificação",
};

export const mockTipologiaMinimo: CriarTipologiaInput = {
  nome: "Pavimentação",
};

export function buildTipologiaMock(
  override: Partial<CriarTipologiaInput> = {},
): CriarTipologiaInput {
  return {
    ...mockTipologiaCompleto,
    ...override,
  };
}
