import type { CriarFonteInput } from "@/core/schemas/fontes/create_fonte_schema";

export const FONTE_FORM_EXPECTED_FIELDS = [
  "nome",
  "codigo",
  "tipo",
  "valorPrevisto",
  "vigencia",
  "descricao",
] as const satisfies ReadonlyArray<keyof CriarFonteInput>;

export const FONTE_FORM_REQUIRED_FIELDS = [
  "nome",
] as const satisfies ReadonlyArray<keyof CriarFonteInput>;

export const FONTE_FORM_ALL_INPUT_KEYS: ReadonlyArray<keyof CriarFonteInput> = [
  "nome",
  "codigo",
  "tipo",
  "valorPrevisto",
  "vigencia",
  "descricao",
];

export const FONTE_FORM_EXPECTED_LABELS = [
  "Nome",
  "Código",
  "Tipo",
  "Valor previsto",
  "Vigência",
  "Descrição",
] as const;
