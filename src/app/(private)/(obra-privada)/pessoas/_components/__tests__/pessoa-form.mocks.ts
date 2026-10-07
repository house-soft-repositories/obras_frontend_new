import type {
  CreatePessoaInput,
  CreatePessoaOutput,
} from "@/core/schemas/pessoa/create_pessoa_schema";

const UUIDS = {
  tipoFisica: "FISICA",
  tipoJuridica: "JURIDICA",
} as const;

export const PESSOA_FORM_UUIDS = UUIDS;

export type PessoaFormOption = { id: string; nome: string };

export const mockPessoaFormOptions: Record<string, PessoaFormOption[]> = {};

export const mockPessoaFormCompleto: CreatePessoaInput = {
  tipo: "FISICA",
  nome: "João da Silva",
  documento: "12345678901",
  nomeFantasia: "",
  rg: "1234567",
  orgaoExpedidor: "SSP/CE",
  email: "joao@exemplo.com",
  telefone: "(85) 99999-9999",
  cep: "60000000",
  logradouro: "Rua das Flores",
  numero: "123",
  complemento: "Apto 1",
  bairro: "Centro",
  cidade: "Fortaleza",
  uf: "CE",
};

export const mockPessoaFormCompletoOutput: CreatePessoaOutput = {
  tipo: "FISICA",
  nome: "João da Silva",
  documento: "12345678901",
  nomeFantasia: undefined,
  rg: "1234567",
  orgaoExpedidor: "SSP/CE",
  email: "joao@exemplo.com",
  telefone: "(85) 99999-9999",
  cep: "60000000",
  logradouro: "Rua das Flores",
  numero: "123",
  complemento: "Apto 1",
  bairro: "Centro",
  cidade: "Fortaleza",
  uf: "CE",
};

export const mockPessoaFormMinimo: CreatePessoaInput = {
  tipo: "FISICA",
  nome: "Maria",
  documento: "98765432100",
  nomeFantasia: "",
  rg: "",
  orgaoExpedidor: "",
  email: "",
  telefone: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

export function buildPessoaFormMock(
  override: Partial<CreatePessoaInput> = {},
): CreatePessoaInput {
  return {
    ...mockPessoaFormCompleto,
    ...override,
  };
}
