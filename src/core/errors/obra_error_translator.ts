import { ErrorTranslator } from "@/core/errors/error_translator";

export class ObraErrorTranslator extends ErrorTranslator {
  protected readonly messages: Record<string, string> = {
    OBRA_INVALID_NOME: "Confira o nome.",
    OBRA_INVALID_TIPO: "Confira o tipo.",
    OBRA_INVALID_RESPONSAVEL: "Confira o responsável.",
    OBRA_INVALID_ORGAO: "Confira o órgão.",
    OBRA_INVALID_SUBCLASSIFICACAO: "Confira a subclassificação.",
    OBRA_INVALID_ORCAMENTO: "Confira os orçamentos.",
    OBRA_FONTE_INATIVA: "Escolha uma fonte ativa.",
    FONTE_NOT_FOUND: "Fonte não encontrada.",
    FONTE_INATIVA: "Escolha uma fonte ativa.",
    LIQUIDACAO_EXCEDE_EMPENHO:
      "A soma das liquidações não pode exceder o empenho.",
    PAGAMENTO_EXCEDE_LIQUIDACAO:
      "A soma dos pagamentos não pode exceder a liquidação.",
    PAGAMENTO_SEM_MEDICAO: "Vincule uma medição para registrar este pagamento.",
    OBRA_DUPLICATE_CODIGO:
      "Não foi possível gerar o código da obra. Tente novamente.",
    OBRA_CREATE_FAILED:
      "Não foi possível criar a obra. Os dados foram preservados.",
    TENANT_CONTEXT_REQUIRED: "Selecione uma tenancy antes de continuar.",
    "400": "Revise os dados informados e tente novamente.",
    "401": "Sua sessão expirou. Faça login novamente.",
    "403": "Você não tem permissão para realizar esta ação.",
    "404": "Registro relacionado não encontrado.",
    "409": "Já existe uma obra com estes dados.",
    "422": "Revise os dados informados e tente novamente.",
    "500": "Erro interno ao salvar obra. Tente novamente mais tarde.",
  };
}

export const obraErrorTranslator = new ObraErrorTranslator();
