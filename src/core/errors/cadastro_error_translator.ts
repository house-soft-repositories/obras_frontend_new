import { ErrorTranslator } from "@/core/errors/error_translator";

export class CadastroErrorTranslator extends ErrorTranslator {
  protected readonly messages: Record<string, string> = {
    "400": "Revise os dados informados e tente novamente.",
    "401": "Sua sessão expirou. Faça login novamente.",
    "403": "Você não tem permissão para realizar esta ação.",
    "404": "Registro relacionado não encontrado.",
    "409": "Já existe um registro com estes dados.",
    "500": "Erro interno ao salvar. Tente novamente mais tarde.",
  };
}

export const cadastroErrorTranslator = new CadastroErrorTranslator();
