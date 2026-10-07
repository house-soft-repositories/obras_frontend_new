import type {
  CriarSubclassificacaoInput,
  CriarSubclassificacaoOutput,
} from "@/core/schemas/cadastros/create_subclassificacao_schema";
import type { ClassificacaoSchema } from "@/core/schemas/cadastros/classificacao_schema";

export const SUBCLASSIFICACAO_UUIDS = {
  classificacaoId: "550e8400-e29b-41d4-a716-446655440011",
} as const;

export const mockSubclassificacaoOptions: {
  classificacoes: ClassificacaoSchema[];
} = {
  classificacoes: [
    {
      id: SUBCLASSIFICACAO_UUIDS.classificacaoId,
      tenantId: "550e8400-e29b-41d4-a716-446655440099",
      nome: "Habitacional",
      ativo: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
  ],
};

export const mockSubclassificacaoCompleto: CriarSubclassificacaoInput = {
  classificacaoId: SUBCLASSIFICACAO_UUIDS.classificacaoId,
  nome: "Unifamiliar",
};

export const mockSubclassificacaoCompletoOutput: CriarSubclassificacaoOutput = {
  classificacaoId: SUBCLASSIFICACAO_UUIDS.classificacaoId,
  nome: "Unifamiliar",
};

export const mockSubclassificacaoMinimo: CriarSubclassificacaoInput = {
  classificacaoId: SUBCLASSIFICACAO_UUIDS.classificacaoId,
  nome: "Multifamiliar",
};

export function buildSubclassificacaoMock(
  override: Partial<CriarSubclassificacaoInput> = {},
): CriarSubclassificacaoInput {
  return {
    ...mockSubclassificacaoCompleto,
    ...override,
  };
}
