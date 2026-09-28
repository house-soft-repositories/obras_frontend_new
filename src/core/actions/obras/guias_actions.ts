"use server";

export {
  criarLocalizacaoAction,
  listLocalizacoesAction,
  removerLocalizacaoAction,
} from "./guias/localizacoes_actions";
export {
  criarOrcamentoAction,
  listOrcamentosAction,
  removerOrcamentoAction,
} from "./guias/orcamentos_actions";
export {
  getTitularidadeAction,
  salvarTitularidadeAction,
} from "./guias/titularidade_actions";
export {
  atualizarLicencaAction,
  criarLicencaAction,
  listLicencasAction,
  removerLicencaAction,
} from "./guias/licencas_actions";
export {
  atualizarRecebimentoAction,
  criarRecebimentoAction,
  listRecebimentosAction,
  removerRecebimentoAction,
} from "./guias/recebimentos_actions";
