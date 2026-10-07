import type { CriarTipologiaInput } from "@/core/schemas/cadastros/create_tipologia_schema";

export const TIPOLOGIA_FORM_EXPECTED_FIELDS = [
  "nome",
] as const satisfies ReadonlyArray<keyof CriarTipologiaInput>;

export const TIPOLOGIA_FORM_REQUIRED_FIELDS = [
  "nome",
] as const satisfies ReadonlyArray<keyof CriarTipologiaInput>;

export const TIPOLOGIA_FORM_ALL_INPUT_KEYS: ReadonlyArray<
  keyof CriarTipologiaInput
> = ["nome"];

export const TIPOLOGIA_FORM_EXPECTED_LABELS = ["Nome"] as const;
