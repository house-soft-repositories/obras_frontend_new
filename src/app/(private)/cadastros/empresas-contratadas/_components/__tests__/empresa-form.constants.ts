import type {
  CriarEmpresaInput,
  CriarEmpresaOutput,
} from "@/core/schemas/empresas/create_empresa_schema";

export const EMPRESA_FORM_EXPECTED_STEPS = [
  "Empresa",
  "Contato",
  "Endereço",
] as const;

export const EMPRESA_FORM_EXPECTED_FIELDS_BY_STEP: ReadonlyArray<
  ReadonlyArray<keyof CriarEmpresaInput>
> = [
  ["razaoSocial", "cnpj", "nomeFantasia"],
  ["responsavel", "cargoResponsavel", "email", "telefones"],
  ["cep", "uf", "logradouro", "numero", "complemento", "bairro", "cidade"],
];

export const EMPRESA_FORM_REQUIRED_FIELDS = [
  "razaoSocial",
  "cnpj",
  "nomeFantasia",
] as const satisfies ReadonlyArray<keyof CriarEmpresaInput>;

export const EMPRESA_FORM_ALL_INPUT_KEYS: ReadonlyArray<keyof CriarEmpresaInput> = [
  "razaoSocial",
  "cnpj",
  "nomeFantasia",
  "responsavel",
  "cargoResponsavel",
  "email",
  "telefones",
  "cep",
  "logradouro",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "uf",
];
