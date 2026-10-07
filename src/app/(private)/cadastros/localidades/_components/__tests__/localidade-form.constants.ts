import type { CriarLocalidadeInput } from "@/core/schemas/localidade/create_localidade_shema";

export const LOCALIDADE_FORM_EXPECTED_FIELDS = [
  "nome",
  "uf",
  "codigoIbge",
  "tipo",
  "municipio",
  "observacoes",
] as const satisfies ReadonlyArray<keyof CriarLocalidadeInput>;

export const LOCALIDADE_FORM_REQUIRED_FIELDS = [
  "nome",
  "uf",
] as const satisfies ReadonlyArray<keyof CriarLocalidadeInput>;

export const LOCALIDADE_FORM_ALL_INPUT_KEYS: ReadonlyArray<keyof CriarLocalidadeInput> = [
  "nome",
  "uf",
  "codigoIbge",
  "tipo",
  "municipio",
  "observacoes",
];

export const LOCALIDADE_FORM_EXPECTED_LABELS = [
  "Nome",
  "UF",
  "Código IBGE",
  "Tipo",
  "Município",
  "Observações",
] as const;
