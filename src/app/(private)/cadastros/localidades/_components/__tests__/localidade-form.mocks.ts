import type { CriarLocalidadeInput, CriarLocalidadeOutput } from "@/core/schemas/localidade/create_localidade_shema";

export const mockLocalidadeCompleto: CriarLocalidadeInput = {
  nome: "Bairro Centro",
  uf: "SP",
  codigoIbge: "3550308",
  tipo: "BAIRRO",
  municipio: "São Paulo",
  observacoes: "Centro histórico",
};

export const mockLocalidadeCompletoOutput: CriarLocalidadeOutput = {
  nome: "Bairro Centro",
  uf: "SP",
  codigoIbge: "3550308",
  tipo: "BAIRRO",
  municipio: "São Paulo",
  observacoes: "Centro histórico",
};

export const mockLocalidadeMinimo: CriarLocalidadeInput = {
  nome: "Bairro Centro",
  uf: "SP",
  codigoIbge: "",
  tipo: undefined,
  municipio: "",
  observacoes: "",
};

export function buildLocalidadeMock(
  override: Partial<CriarLocalidadeInput> = {},
): CriarLocalidadeInput {
  return {
    ...mockLocalidadeCompleto,
    ...override,
  };
}
