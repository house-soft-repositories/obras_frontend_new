import type { CriarSubtipologiaInput } from "@/core/schemas/cadastros/create_subtipologia_schema";

export const SUBTIPOLOGIA_FORM_EXPECTED_FIELDS = [
  "tipologiaId",
  "nome",
] as const satisfies ReadonlyArray<keyof CriarSubtipologiaInput>;

export const SUBTIPOLOGIA_FORM_REQUIRED_FIELDS = [
  "tipologiaId",
  "nome",
] as const satisfies ReadonlyArray<keyof CriarSubtipologiaInput>;

export const SUBTIPOLOGIA_FORM_ALL_INPUT_KEYS: ReadonlyArray<
  keyof CriarSubtipologiaInput
> = ["tipologiaId", "nome"];

export const SUBTIPOLOGIA_FORM_EXPECTED_LABELS = ["Tipologia", "Nome"] as const;
