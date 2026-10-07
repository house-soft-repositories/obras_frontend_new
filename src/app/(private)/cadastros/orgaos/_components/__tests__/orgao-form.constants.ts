import type { CriarOrgaoInput } from "@/core/schemas/orgaos/create_orgao_schema";

export const ORGAO_FORM_EXPECTED_FIELDS = [
  "localidadeId",
  "nome",
  "sigla",
  "tipo",
  "responsavel",
  "email",
  "telefone",
  "ativo",
] as const satisfies ReadonlyArray<keyof CriarOrgaoInput>;

export const ORGAO_FORM_REQUIRED_FIELDS = [
  "localidadeId",
  "nome",
] as const satisfies ReadonlyArray<keyof CriarOrgaoInput>;

export const ORGAO_FORM_ALL_INPUT_KEYS: ReadonlyArray<keyof CriarOrgaoInput> = [
  "localidadeId",
  "nome",
  "sigla",
  "tipo",
  "responsavel",
  "email",
  "telefone",
  "ativo",
];

export const ORGAO_FORM_EXPECTED_LABELS = [
  "Localidade",
  "Nome",
  "Sigla",
  "Tipo",
  "Responsável",
  "E-mail",
  "Telefone",
  "Ativo",
] as const;
