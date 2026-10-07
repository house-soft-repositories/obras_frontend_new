import type {
  CriarEmpresaInput,
  CriarEmpresaOutput,
} from "@/core/schemas/empresas/create_empresa_schema";

const UUIDS = {} as const;

export const EMPRESA_FORM_UUIDS = UUIDS;

export type EmpresaFormOption = { id: string; nome: string };

export const mockEmpresaFormOptions: Record<string, EmpresaFormOption[]> = {};

export const mockEmpresaFormCompleto: CriarEmpresaInput = {
  razaoSocial: "Tech Solutions Ltda",
  cnpj: "11222333000181",
  nomeFantasia: "TechSol",
  responsavel: "Carlos Diretor",
  cargoResponsavel: "Diretor",
  email: "contato@techsol.com",
  telefones: ["(85) 99999-9999", "(85) 88888-8888"],
  cep: "60000-000",
  logradouro: "Av. Principal",
  numero: "456",
  complemento: "Sala 10",
  bairro: "Centro",
  cidade: "Fortaleza",
  uf: "CE",
};

export const mockEmpresaFormCompletoOutput: CriarEmpresaOutput = {
  razaoSocial: "Tech Solutions Ltda",
  cnpj: "11222333000181",
  nomeFantasia: "TechSol",
  responsavel: "Carlos Diretor",
  cargoResponsavel: "Diretor",
  email: "contato@techsol.com",
  telefones: ["(85) 99999-9999", "(85) 88888-8888"],
  cep: "60000-000",
  logradouro: "Av. Principal",
  numero: "456",
  complemento: "Sala 10",
  bairro: "Centro",
  cidade: "Fortaleza",
  uf: "CE",
};

export const mockEmpresaFormMinimo: CriarEmpresaInput = {
  razaoSocial: "Empresa Teste",
  cnpj: "11222333000181",
  nomeFantasia: "",
  responsavel: "",
  cargoResponsavel: "",
  email: "",
  telefones: [""],
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
};

export function buildEmpresaFormMock(
  override: Partial<CriarEmpresaInput> = {},
): CriarEmpresaInput {
  return {
    ...mockEmpresaFormCompleto,
    ...override,
    telefones: override.telefones ?? mockEmpresaFormCompleto.telefones,
  };
}
