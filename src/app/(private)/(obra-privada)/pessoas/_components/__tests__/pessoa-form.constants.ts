import type { CreatePessoaInput, CreatePessoaOutput } from "@/core/schemas/pessoa/create_pessoa_schema";

export const PESSOA_FORM_EXPECTED_STEPS = [
  "Dados",
  "Contato",
  "Endereço",
] as const;

export const PESSOA_FORM_EXPECTED_FIELDS_BY_STEP: ReadonlyArray<
  ReadonlyArray<keyof CreatePessoaInput>
> = [
  ["tipo", "nome", "documento", "nomeFantasia", "rg", "orgaoExpedidor"],
  ["email", "telefone"],
  ["cep", "uf", "logradouro", "numero", "complemento", "bairro", "cidade"],
];

export const PESSOA_FORM_REQUIRED_FIELDS = [
  "tipo",
  "nome",
  "documento",
] as const satisfies ReadonlyArray<keyof CreatePessoaInput>;

export const PESSOA_FORM_ALL_INPUT_KEYS: ReadonlyArray<keyof CreatePessoaInput> = [
  "tipo",
  "nome",
  "documento",
  "nomeFantasia",
  "rg",
  "orgaoExpedidor",
  "email",
  "telefone",
  "cep",
  "logradouro",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "uf",
];
