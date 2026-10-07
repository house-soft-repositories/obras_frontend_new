import type { CriarFonteInput, CriarFonteOutput } from "@/core/schemas/fontes/create_fonte_schema";

export const mockFonteCompleto: CriarFonteInput = {
  nome: "Tesouro Municipal",
  codigo: "001",
  tipo: "Tesouro",
  valorPrevisto: "1000000",
  vigencia: "2024-2026",
  descricao: "Fonte principal de recursos",
};

export const mockFonteCompletoOutput: CriarFonteOutput = {
  nome: "Tesouro Municipal",
  codigo: "001",
  tipo: "Tesouro",
  valorPrevisto: "1000000",
  vigencia: "2024-2026",
  descricao: "Fonte principal de recursos",
};

export const mockFonteMinimo: CriarFonteInput = {
  nome: "Tesouro Municipal",
  codigo: "",
  tipo: "",
  valorPrevisto: "",
  vigencia: "",
  descricao: "",
};

export function buildFonteMock(
  override: Partial<CriarFonteInput> = {},
): CriarFonteInput {
  return {
    ...mockFonteCompleto,
    ...override,
  };
}
