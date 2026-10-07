import type { CriarSubclassificacaoInput } from "@/core/schemas/cadastros/create_subclassificacao_schema";

export const SUBCLASSIFICACAO_FORM_EXPECTED_FIELDS = [
  "classificacaoId",
  "nome",
] as const satisfies ReadonlyArray<keyof CriarSubclassificacaoInput>;

export const SUBCLASSIFICACAO_FORM_REQUIRED_FIELDS = [
  "classificacaoId",
  "nome",
] as const satisfies ReadonlyArray<keyof CriarSubclassificacaoInput>;

export const SUBCLASSIFICACAO_FORM_ALL_INPUT_KEYS: ReadonlyArray<
  keyof CriarSubclassificacaoInput
> = ["classificacaoId", "nome"];

export const SUBCLASSIFICACAO_FORM_EXPECTED_LABELS = [
  "Classificação",
  "Nome",
] as const;
