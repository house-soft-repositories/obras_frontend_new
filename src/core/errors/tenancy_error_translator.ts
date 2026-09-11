import { ErrorTranslator } from "./error_translator";

export const TENANCY_INVALID_NAME_MESSAGE =
  "Informe um nome válido para a organização (mínimo 2 caracteres).";
export const TENANCY_INVALID_SLUG_MESSAGE =
  "Slug inválido. Use apenas letras minúsculas, números e hífens.";
export const TENANCY_INVALID_CNPJ_MESSAGE =
  "CNPJ inválido. Informe exatamente 14 dígitos.";
export const TENANCY_INVALID_SCHEMA_MESSAGE =
  "Erro interno ao provisionar o schema do tenant.";
export const TENANCY_PROVISION_FAILED_MESSAGE =
  "Falha ao provisionar o tenant. Tente novamente.";
export const TENANCY_CREATE_FAILED_MESSAGE =
  "Não foi possível criar o tenant. Tente novamente.";
export const TENANCY_CREATE_FORBIDDEN_MESSAGE =
  "Apenas usuários SUPERADMIN podem criar tenants.";
export const TENANCY_LIST_FORBIDDEN_MESSAGE =
  "Você não tem permissão para listar tenants.";
export const TENANCY_DUPLICATE_SLUG_MESSAGE =
  "Este slug já está em uso. Escolha outro slug.";
export const TENANCY_DUPLICATE_CNPJ_MESSAGE = "Este CNPJ já está em uso.";
export const BAD_REQUEST_MESSAGE =
  "Revise os dados informados e tente novamente.";
export const FORBIDDEN_MESSAGE =
  "Apenas usuários SUPERADMIN podem criar tenants.";
export const CONFLICT_MESSAGE = "Este slug já está em uso. Escolha outro slug.";
export const INTERNAL_ERROR_MESSAGE =
  "Erro interno ao criar o tenant. Tente novamente mais tarde.";
export const TENANCY_CREATE_DUPLICATE_MESSAGE =
  "Já existe um tenant com este slug ou CNPJ. Escolha outro slug ou CNPJ.";

export class TenancyErrorTranslator extends ErrorTranslator {
  protected readonly messages: Record<string, string> = {
    TENANCY_INVALID_NAME: TENANCY_INVALID_NAME_MESSAGE,
    TENANCY_INVALID_SLUG: TENANCY_INVALID_SLUG_MESSAGE,
    TENANCY_INVALID_CNPJ: TENANCY_INVALID_CNPJ_MESSAGE,
    TENANCY_INVALID_SCHEMA: TENANCY_INVALID_SCHEMA_MESSAGE,
    TENANCY_PROVISION_FAILED: TENANCY_PROVISION_FAILED_MESSAGE,
    TENANCY_CREATE_FAILED: TENANCY_CREATE_FAILED_MESSAGE,
    TENANCY_CREATE_FORBIDDEN: TENANCY_CREATE_FORBIDDEN_MESSAGE,
    TENANCY_LIST_FORBIDDEN: TENANCY_LIST_FORBIDDEN_MESSAGE,
    TENANCY_DUPLICATE_SLUG: TENANCY_DUPLICATE_SLUG_MESSAGE,
    TENANCY_DUPLICATE_CNPJ: TENANCY_DUPLICATE_CNPJ_MESSAGE,
    TENANCY_CREATE_DUPLICATE: TENANCY_CREATE_DUPLICATE_MESSAGE,
    "400": BAD_REQUEST_MESSAGE,
    "403": FORBIDDEN_MESSAGE,
    "409": CONFLICT_MESSAGE,
    "500": INTERNAL_ERROR_MESSAGE,
  };
}

export const tenancyErrorTranslator = new TenancyErrorTranslator();
