import type { CriarSetorInput } from "@/core/schemas/setores/create_setor_schema";

export const SETOR_FORM_EXPECTED_FIELDS = [
  "orgaoId",
  "nome",
  "ativo",
] as const satisfies ReadonlyArray<keyof CriarSetorInput>;

export const SETOR_FORM_REQUIRED_FIELDS = [
  "orgaoId",
  "nome",
] as const satisfies ReadonlyArray<keyof CriarSetorInput>;

export const SETOR_FORM_ALL_INPUT_KEYS: ReadonlyArray<keyof CriarSetorInput> = [
  "orgaoId",
  "nome",
  "ativo",
];

export const SETOR_FORM_EXPECTED_LABELS = [
  "Órgão",
  "Nome",
  "Ativo",
] as const;
