import { ErrorTranslator } from "@/core/errors/error_translator";

export class CadastroErrorTranslator extends ErrorTranslator {
  protected readonly messages: Record<string, string> = {
    "400": "Revise os dados informados e tente novamente.",
    "401": "Sua sessão expirou. Faça login novamente.",
    "403": "Você não tem permissão para realizar esta ação.",
    "404": "Registro relacionado não encontrado.",
    "409": "Já existe um registro com estes dados.",
    "500": "Erro interno ao salvar. Tente novamente mais tarde.",
    CADASTRO_NOT_FOUND: "Registro não encontrado.",
    CADASTRO_PARENT_NOT_FOUND:
      "Registro pai não encontrado. Verifique o vínculo selecionado.",
    CADASTRO_INVALID_NOME: "Informe um nome com pelo menos 2 caracteres.",
    FONTE_NOT_FOUND: "Fonte não encontrada.",
    FONTE_DUPLICATE_CODE: "Já existe uma fonte cadastrada com este código.",
    FONTE_INVALID_NAME: "Informe um nome válido para a fonte.",
    FONTE_INATIVA: "A fonte selecionada está inativa.",
    LOCALIDADE_NOT_FOUND: "Localidade não encontrada.",
    LOCALIDADE_DELETE_FAILED:
      "Não foi possível excluir esta localidade. Tente novamente.",
    LOCALIDADE_DELETE_FORBIDDEN:
      "Não é possível excluir esta localidade porque ela possui vínculos.",
    LOCALIDADE_HAS_LINKED_ORGAOS:
      "Não é possível excluir esta localidade porque existem órgãos vinculados.",
    LOCALIDADE_HAS_LINKED_USERS:
      "Não é possível excluir esta localidade porque existem usuários vinculados.",
    LOCALIDADE_HAS_LINKED_OBRAS:
      "Não é possível excluir esta localidade porque existem obras vinculadas.",
    ORGAO_NOT_FOUND: "Órgão não encontrado.",
    ORGAO_INVALID_LOCALIDADE:
      "Selecione uma localidade válida para este órgão.",
    ORGAO_DELETE_FAILED:
      "Não foi possível excluir este órgão. Tente novamente.",
    ORGAO_DELETE_FORBIDDEN:
      "Não é possível excluir este órgão porque ele possui vínculos.",
    ORGAO_HAS_LINKED_SETORES:
      "Não é possível excluir este órgão porque existem setores vinculados.",
    ORGAO_HAS_LINKED_USERS:
      "Não é possível excluir este órgão porque existem usuários vinculados.",
    ORGAO_HAS_LINKED_OBRAS:
      "Não é possível excluir este órgão porque existem obras vinculadas.",
    SETOR_NOT_FOUND: "Setor não encontrado para o órgão informado.",
    SETOR_INVALID_ORGAO: "Selecione um órgão válido para este setor.",
    SETOR_DELETE_FAILED:
      "Não foi possível excluir este setor. Tente novamente.",
    SETOR_DELETE_FORBIDDEN:
      "Não é possível excluir este setor porque ele possui vínculos.",
    SETOR_HAS_LINKED_USERS:
      "Não é possível excluir este setor porque existem usuários vinculados.",
    SETOR_HAS_LINKED_OBRAS:
      "Não é possível excluir este setor porque existem obras vinculadas.",
    PESSOA_NOT_FOUND: "Pessoa não encontrada.",
    PROFISSIONAL_TECNICO_INVALID_PESSOA:
      "Selecione uma pessoa cadastrada para criar o profissional técnico.",
    PROFISSIONAL_TECNICO_INVALID_CONSELHO:
      "Selecione um conselho profissional válido.",
    PROFISSIONAL_TECNICO_INVALID_NUMERO_REGISTRO:
      "Informe o número do registro profissional.",
    PROFISSIONAL_TECNICO_DUPLICATE_PESSOA:
      "Esta pessoa já possui perfil de profissional técnico.",
    PROFISSIONAL_TECNICO_NOT_FOUND: "Profissional técnico não encontrado.",
    PROFISSIONAL_TECNICO_INVALID_BUSCA:
      "Digite pelo menos 3 caracteres para buscar profissionais técnicos.",
  };
}

export const cadastroErrorTranslator = new CadastroErrorTranslator();
