import { ErrorTranslator } from "@/core/errors/error_translator";

export class ObraPrivadaErrorTranslator extends ErrorTranslator {
  protected readonly messages: Record<string, string> = {
    OBRA_PRIVADA_INVALID_DESCRICAO: "Informe a descrição da obra.",
    OBRA_PRIVADA_INVALID_PROPRIETARIO: "Selecione o proprietário.",
    OBRA_PRIVADA_INVALID_LOGRADOURO: "Informe o logradouro.",
    OBRA_PRIVADA_INVALID_UF: "Informe a UF com 2 letras.",
    OBRA_PRIVADA_INVALID_SITUACAO: "Confira a situação do alvará.",
    OBRA_PRIVADA_CREATE_FAILED:
      "Não foi possível criar a obra privada. Os dados foram preservados.",
    TENANT_CONTEXT_REQUIRED: "Selecione uma tenancy antes de continuar.",
    "400": "Revise os dados informados e tente novamente.",
    "401": "Sua sessão expirou. Faça login novamente.",
    "403": "Você não tem permissão para realizar esta ação.",
    "404": "Registro relacionado não encontrado.",
    "409": "Já existe uma obra privada com estes dados.",
    "422": "Revise os dados informados e tente novamente.",
    "500": "Erro interno ao salvar a obra privada. Tente novamente mais tarde.",
  };
}

export const obraPrivadaErrorTranslator = new ObraPrivadaErrorTranslator();
