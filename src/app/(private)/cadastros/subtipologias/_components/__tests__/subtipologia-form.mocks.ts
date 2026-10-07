import type {
  CriarSubtipologiaInput,
  CriarSubtipologiaOutput,
} from "@/core/schemas/cadastros/create_subtipologia_schema";
import type { TipologiaSchema } from "@/core/schemas/cadastros/tipologia_schema";

export const SUBTIPOLOGIA_UUIDS = {
  tipologiaId: "550e8400-e29b-41d4-a716-446655440010",
} as const;

export const mockSubtipologiaOptions: { tipologias: TipologiaSchema[] } = {
  tipologias: [
    {
      id: SUBTIPOLOGIA_UUIDS.tipologiaId,
      tenantId: "550e8400-e29b-41d4-a716-446655440099",
      nome: "Edificação",
      ativo: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
  ],
};

export const mockSubtipologiaCompleto: CriarSubtipologiaInput = {
  tipologiaId: SUBTIPOLOGIA_UUIDS.tipologiaId,
  nome: "Residencial",
};

export const mockSubtipologiaCompletoOutput: CriarSubtipologiaOutput = {
  tipologiaId: SUBTIPOLOGIA_UUIDS.tipologiaId,
  nome: "Residencial",
};

export const mockSubtipologiaMinimo: CriarSubtipologiaInput = {
  tipologiaId: SUBTIPOLOGIA_UUIDS.tipologiaId,
  nome: "Comercial",
};

export function buildSubtipologiaMock(
  override: Partial<CriarSubtipologiaInput> = {},
): CriarSubtipologiaInput {
  return {
    ...mockSubtipologiaCompleto,
    ...override,
  };
}
