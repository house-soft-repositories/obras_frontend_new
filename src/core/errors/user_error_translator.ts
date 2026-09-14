import { ErrorTranslator } from "@/core/errors/error_translator";

export class UserErrorTranslator extends ErrorTranslator {
  protected readonly messages: Record<string, string> = {
    USER_CREATE_FORBIDDEN:
      "Você não tem permissão para criar este tipo de usuário.",
    USER_LIST_FORBIDDEN: "Você não tem permissão para listar usuários.",
    USER_EMAIL_ALREADY_EXISTS: "Já existe um usuário com este e-mail.",
    USER_DUPLICATE_EMAIL: "Já existe um usuário com este e-mail.",
    TENANT_CONTEXT_REQUIRED: "Selecione uma tenancy antes de continuar.",
    "400": "Revise os dados informados e tente novamente.",
    "401": "Sua sessão expirou. Faça login novamente.",
    "403": "Você não tem permissão para realizar esta ação.",
    "404": "Registro relacionado não encontrado.",
    "409": "Já existe um usuário com este e-mail.",
    "500": "Erro interno ao salvar usuário. Tente novamente mais tarde.",
  };
}

export const userErrorTranslator = new UserErrorTranslator();
