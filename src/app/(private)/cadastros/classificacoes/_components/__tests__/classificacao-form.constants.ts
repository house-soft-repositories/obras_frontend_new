import type { CriarClassificacaoInput } from "@/core/schemas/cadastros/create_classificacao_schema";

export const CLASSIFICACAO_FORM_EXPECTED_FIELDS = [
  "nome",
] as const satisfies ReadonlyArray<keyof CriarClassificacaoInput>;

export const CLASSIFICACAO_FORM_REQUIRED_FIELDS = [
  "nome",
] as const satisfies ReadonlyArray<keyof CriarClassificacaoInput>;

export const CLASSIFICACAO_FORM_ALL_INPUT_KEYS: ReadonlyArray<
  keyof CriarClassificacaoInput
> = ["nome"];

export const CLASSIFICACAO_FORM_EXPECTED_LABELS = ["Nome"] as const;
