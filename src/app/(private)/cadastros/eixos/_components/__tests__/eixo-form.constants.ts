import type { CriarEixoInput } from "@/core/schemas/cadastros/create_eixo_schema";

export const EIXO_FORM_EXPECTED_FIELDS = [
  "nome",
] as const satisfies ReadonlyArray<keyof CriarEixoInput>;

export const EIXO_FORM_REQUIRED_FIELDS = [
  "nome",
] as const satisfies ReadonlyArray<keyof CriarEixoInput>;

export const EIXO_FORM_ALL_INPUT_KEYS: ReadonlyArray<keyof CriarEixoInput> = [
  "nome",
];

export const EIXO_FORM_EXPECTED_LABELS = ["Nome"] as const;
