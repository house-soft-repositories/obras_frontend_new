import type {
  CriarClassificacaoInput,
  CriarClassificacaoOutput,
} from "@/core/schemas/cadastros/create_classificacao_schema";

export const mockClassificacaoCompleto: CriarClassificacaoInput = {
  nome: "Habitacional",
};

export const mockClassificacaoCompletoOutput: CriarClassificacaoOutput = {
  nome: "Habitacional",
};

export const mockClassificacaoMinimo: CriarClassificacaoInput = {
  nome: "Comercial",
};

export function buildClassificacaoMock(
  override: Partial<CriarClassificacaoInput> = {},
): CriarClassificacaoInput {
  return {
    ...mockClassificacaoCompleto,
    ...override,
  };
}
