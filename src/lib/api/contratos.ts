/**
 * Cliente e regras de UI do ContratosContext (E4-05/E4-06). Os tipos de request
 * vem do contrato OpenAPI gerado (types.gen.ts via `pnpm gen:api`). As regras de
 * dominio refletidas no front (RN-CON-03/04/06/07/08/11/12) ficam em funcoes
 * PURAS, testaveis sem renderizar componentes.
 */
import { ErroApi } from "./obras";
import type { components } from "./types.gen";

export { ErroApi };

// --- Tipos de request gerados do contrato OpenAPI ---
export type CriarEmpresaContratadaPayload =
  components["schemas"]["CriarEmpresaContratadaDto"];
export type AtualizarEmpresaContratadaPayload =
  components["schemas"]["AtualizarEmpresaContratadaDto"];
export type CriarContratoPayload = components["schemas"]["CriarContratoDto"];
export type AtualizarContratoPayload =
  components["schemas"]["AtualizarContratoDto"];
export type ContratoFontePayload = components["schemas"]["ContratoFonteDto"];
export type CriarAditivoPayload = components["schemas"]["CriarAditivoDto"];
export type AtualizarAditivoPayload =
  components["schemas"]["AtualizarAditivoDto"];
export type CriarParalisacaoPayload =
  components["schemas"]["CriarParalisacaoDto"];
export type RegistrarReinicioPayload =
  components["schemas"]["RegistrarReinicioDto"];

// --- Enums (espelham os enums do backend expostos no OpenAPI) ---
export type TipoPrazoExecucao = "DIAS" | "DATA";
export type TipoAditivo =
  | "PRAZO"
  | "VALOR"
  | "PRAZO_E_VALOR"
  | "FONTE"
  | "OUTROS";

export const TIPOS_PRAZO_EXECUCAO: TipoPrazoExecucao[] = ["DIAS", "DATA"];
export const TIPOS_ADITIVO: { chave: TipoAditivo; titulo: string }[] = [
  { chave: "PRAZO", titulo: "Prazo" },
  { chave: "VALOR", titulo: "Valor" },
  { chave: "PRAZO_E_VALOR", titulo: "Prazo e valor" },
  { chave: "FONTE", titulo: "Fonte" },
  { chave: "OUTROS", titulo: "Outros" },
];

// --- Entidades retornadas pela API (tipadas a mao: o backend nao anotou os
//     schemas de resposta no OpenAPI). ---
export interface EmpresaContratada {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  responsavel: string | null;
  cargoResponsavel: string | null;
  email: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  telefones: string[];
}

export interface ContratoFonte {
  id: string;
  fonteId: string;
  valor: string;
}

/**
 * Fonte como exibida nas guias da obra: nome para os selects e o codigo
 * orcamentario opcional (RN-FIN-12) para a lista de fontes do contrato.
 */
export interface FonteResumo {
  id: string;
  nome: string;
  codigo?: string | null;
}

export interface Contrato {
  id: string;
  obraId: string;
  empresaContratadaId: string;
  numero: string;
  objeto: string | null;
  dataAssinatura: string | null;
  fimVigencia: string | null;
  dataOs: string;
  tipoPrazoExecucao: TipoPrazoExecucao;
  prazoExecucaoDias: number | null;
  prazoExecucaoData: string | null;
  fontes: ContratoFonte[];
  valorContratadoInicial: string;
}

export interface AditivoFonte {
  id: string;
  fonteId: string;
  valor: string;
}

export interface Aditivo {
  id: string;
  contratoId: string;
  numero: string;
  tipo: TipoAditivo;
  dataAssinatura: string | null;
  tipoPrazoExecucao: TipoPrazoExecucao | null;
  prazoExecucaoDias: number | null;
  prazoExecucaoData: string | null;
  vigenciaAditivada: string | null;
  vigenciaDias: number | null;
  observacoes: string | null;
  fontes: AditivoFonte[];
}

/** Resposta de POST/PATCH de aditivo: o aditivo + alerta nao bloqueante. */
export interface AditivoCriado {
  aditivo: Aditivo;
  alerta: string | null;
}

export interface Paralisacao {
  id: string;
  contratoId: string;
  dataParalisacao: string;
  motivo: string;
  termoParalisacaoArquivoId: string;
  dataReinicio: string | null;
  diasParados: number | null;
  termoRetomadaArquivoId: string | null;
}

/** Resultado de GET /contratos/:id/prazo-final (RN-CON-01). */
export interface PrazoFinalExecucao {
  diasBase: number;
  diasParalisacoes: number;
  diasAditivos: number;
  totalDias: number;
  prazoFinal: string;
}

/** Resultado de GET /contratos/:id/valores (RN-CON-13). */
export interface ValoresContrato {
  contratadoInicial: string;
  aditivado: string;
  total: string;
}

// =====================================================================
// REGRAS PURAS (testaveis sem render) — cobrem os "Pronto quando".
// =====================================================================

/** Perfis de RBAC (E1) que importam para esconder acoes de escrita. */
export type PerfilUsuario =
  | "SUPER_ADMIN"
  | "ADMIN_TENANT"
  | "GESTOR_ORGAO"
  | "RESPONSAVEL_OBRA"
  | "CONSULTA";

/**
 * RBAC do front: esconder acoes de escrita para o perfil CONSULTA (somente
 * leitura). Os demais perfis podem escrever; o backend ainda valida o escopo
 * (orgao/obra) e responde 403 quando indevido.
 */
export function podeEscrever(perfil: PerfilUsuario | string | null): boolean {
  return perfil !== "CONSULTA";
}

/** Par fonte+valor como vem dos inputs (ambos string). */
export interface ParFonteValor {
  fonteId: string;
  valor: string;
}

/**
 * RN-CON-04 / RN-CON-13: soma dos valores de N pares fonte+valor. Ignora
 * valores em branco ou nao numericos. Devolve string com 2 casas.
 */
export function somarFontes(pares: ParFonteValor[]): string {
  const total = pares.reduce((acc, p) => {
    const n = Number(p.valor);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
  return total.toFixed(2);
}

/** Mantem apenas os pares com fonte selecionada e valor preenchido. */
export function fontesValidas(pares: ParFonteValor[]): ParFonteValor[] {
  return pares.filter((p) => p.fonteId && p.valor !== "");
}

/** Campos brutos do formulario de Contrato (todos string, vindos dos inputs). */
export interface FormularioContrato {
  empresaContratadaId: string;
  numero: string;
  objeto?: string;
  dataAssinatura?: string;
  fimVigencia?: string;
  dataOs: string;
  tipoPrazoExecucao: TipoPrazoExecucao;
  prazoExecucaoDias?: string;
  prazoExecucaoData?: string;
  fontes: ParFonteValor[];
}

/**
 * Valida o formulario de Contrato (RN-CON-03/04). Devolve a lista de erros; o
 * formulario so pode enviar quando vazia.
 */
export function validarContrato(form: FormularioContrato): string[] {
  const erros: string[] = [];
  if (!form.empresaContratadaId) erros.push("Selecione a empresa contratada");
  if (!form.numero.trim()) erros.push("Informe o numero do contrato");
  if (!form.dataOs) erros.push("Informe a data da O.S.");
  // RN-CON-03: a alternancia DIAS/DATA exige o campo correspondente.
  if (form.tipoPrazoExecucao === "DIAS") {
    if (!form.prazoExecucaoDias) {
      erros.push("Informe o prazo de execucao em dias");
    } else if (Number(form.prazoExecucaoDias) <= 0) {
      erros.push("O prazo de execucao em dias deve ser maior que zero");
    }
  }
  if (form.tipoPrazoExecucao === "DATA" && !form.prazoExecucaoData) {
    erros.push("Informe a data do prazo de execucao");
  }
  // RN-CON-04: ao menos uma fonte com valor.
  const fontes = fontesValidas(form.fontes);
  if (fontes.length === 0) {
    erros.push("Adicione ao menos uma fonte de recurso com valor");
  } else if (fontes.some((f) => Number(f.valor) <= 0)) {
    erros.push("O valor de cada fonte de recurso deve ser maior que zero");
  }
  return erros;
}

/** Monta o payload de criacao do Contrato a partir do formulario. */
export function construirPayloadContrato(
  obraId: string,
  form: FormularioContrato,
): CriarContratoPayload {
  const payload: CriarContratoPayload = {
    obraId,
    empresaContratadaId: form.empresaContratadaId,
    numero: form.numero.trim(),
    dataOs: form.dataOs,
    tipoPrazoExecucao: form.tipoPrazoExecucao,
    fontes: fontesValidas(form.fontes).map((f) => ({
      fonteId: f.fonteId,
      valor: Number(f.valor).toFixed(2),
    })),
  };
  if (form.objeto?.trim()) payload.objeto = form.objeto.trim();
  if (form.dataAssinatura) payload.dataAssinatura = form.dataAssinatura;
  if (form.fimVigencia) payload.fimVigencia = form.fimVigencia;
  if (form.tipoPrazoExecucao === "DIAS" && form.prazoExecucaoDias) {
    payload.prazoExecucaoDias = Number(form.prazoExecucaoDias);
  }
  if (form.tipoPrazoExecucao === "DATA" && form.prazoExecucaoData) {
    payload.prazoExecucaoData = form.prazoExecucaoData;
  }
  return payload;
}

// --- Regras de exibicao do formulario de Aditivo por TipoAditivo (RN-CON-06/07) ---

/** Aditivos que carregam prazo de execucao aditivado: PRAZO e PRAZO_E_VALOR. */
export function aditivoMostraPrazo(tipo: TipoAditivo): boolean {
  return tipo === "PRAZO" || tipo === "PRAZO_E_VALOR";
}

/** Aditivos que carregam pares fonte+valor: VALOR, PRAZO_E_VALOR e FONTE. */
export function aditivoMostraFontes(tipo: TipoAditivo): boolean {
  return tipo === "VALOR" || tipo === "PRAZO_E_VALOR" || tipo === "FONTE";
}

/** Aditivos que carregam vigencia aditivada (dias/data): exceto OUTROS. */
export function aditivoMostraVigencia(tipo: TipoAditivo): boolean {
  return tipo !== "OUTROS";
}

/** OUTROS exibe apenas numero/data/observacoes (sem prazo, vigencia ou fontes). */
export function aditivoSomenteBasico(tipo: TipoAditivo): boolean {
  return tipo === "OUTROS";
}

/** Campos brutos do formulario de Aditivo (todos string, vindos dos inputs). */
export interface FormularioAditivo {
  numero: string;
  tipo: TipoAditivo;
  dataAssinatura?: string;
  tipoPrazoExecucao?: TipoPrazoExecucao;
  prazoExecucaoDias?: string;
  prazoExecucaoData?: string;
  vigenciaDias?: string;
  vigenciaAditivada?: string;
  observacoes?: string;
  fontes: ParFonteValor[];
}

/** Valida o formulario de Aditivo conforme o tipo selecionado. */
export function validarAditivo(form: FormularioAditivo): string[] {
  const erros: string[] = [];
  if (!form.numero.trim()) erros.push("Informe o numero do aditivo");
  if (aditivoMostraPrazo(form.tipo)) {
    if (form.tipoPrazoExecucao === "DIAS") {
      if (!form.prazoExecucaoDias) {
        erros.push("Informe o prazo aditivado em dias");
      } else if (Number(form.prazoExecucaoDias) <= 0) {
        erros.push("O prazo aditivado em dias deve ser maior que zero");
      }
    }
    if (form.tipoPrazoExecucao === "DATA" && !form.prazoExecucaoData) {
      erros.push("Informe a data do prazo aditivado");
    }
  }
  if (aditivoMostraVigencia(form.tipo) && form.vigenciaDias) {
    if (Number(form.vigenciaDias) <= 0) {
      erros.push("Os dias de vigencia devem ser maiores que zero");
    }
  }
  if (aditivoMostraFontes(form.tipo) && fontesValidas(form.fontes).length === 0) {
    erros.push("Adicione ao menos uma fonte com valor");
  }
  if (aditivoSomenteBasico(form.tipo) && !form.observacoes?.trim()) {
    erros.push("Informe as observacoes");
  }
  return erros;
}

/** Monta o payload de criacao do Aditivo, enviando apenas os campos do tipo. */
export function construirPayloadAditivo(
  form: FormularioAditivo,
): CriarAditivoPayload {
  const payload: CriarAditivoPayload = {
    numero: form.numero.trim(),
    tipo: form.tipo,
  };
  if (form.dataAssinatura) payload.dataAssinatura = form.dataAssinatura;
  if (form.observacoes?.trim()) payload.observacoes = form.observacoes.trim();

  if (aditivoMostraPrazo(form.tipo) && form.tipoPrazoExecucao) {
    payload.tipoPrazoExecucao = form.tipoPrazoExecucao;
    if (form.tipoPrazoExecucao === "DIAS" && form.prazoExecucaoDias) {
      payload.prazoExecucaoDias = Number(form.prazoExecucaoDias);
    }
    if (form.tipoPrazoExecucao === "DATA" && form.prazoExecucaoData) {
      payload.prazoExecucaoData = form.prazoExecucaoData;
    }
  }
  if (aditivoMostraVigencia(form.tipo)) {
    if (form.vigenciaDias) payload.vigenciaDias = Number(form.vigenciaDias);
    if (form.vigenciaAditivada) payload.vigenciaAditivada = form.vigenciaAditivada;
  }
  if (aditivoMostraFontes(form.tipo)) {
    payload.fontes = fontesValidas(form.fontes).map((f) => ({
      fonteId: f.fonteId,
      valor: Number(f.valor).toFixed(2),
    }));
  }
  return payload;
}

// --- Regras do formulario de Paralisacao/Reinicio (RN-CON-11/12) ---

export interface FormularioParalisacao {
  dataParalisacao: string;
  motivo: string;
  termoParalisacaoArquivoId: string;
}

/** RN-CON-11: paralisacao exige data, motivo e termo (arquivo). */
export function validarParalisacao(form: FormularioParalisacao): string[] {
  const erros: string[] = [];
  if (!form.dataParalisacao) erros.push("Informe a data da paralisacao");
  if (!form.motivo.trim()) erros.push("Informe o motivo");
  if (!form.termoParalisacaoArquivoId.trim()) {
    erros.push("Anexe o termo de paralisacao");
  }
  return erros;
}

export interface FormularioReinicio {
  dataReinicio: string;
  diasParados: string;
  termoRetomadaArquivoId: string;
}

/**
 * RN-CON-12: o reinicio informa data_reinicio OU dias_parados (um deles deriva o
 * outro no backend). Preencher um deles desabilita o outro no formulario.
 */
export function campoReinicioDesabilitado(
  form: Pick<FormularioReinicio, "dataReinicio" | "diasParados">,
): { dataReinicio: boolean; diasParados: boolean } {
  return {
    dataReinicio: form.diasParados.trim() !== "",
    diasParados: form.dataReinicio.trim() !== "",
  };
}

/** Valida o formulario de Reinicio (RN-CON-12). */
export function validarReinicio(form: FormularioReinicio): string[] {
  const erros: string[] = [];
  if (!form.termoRetomadaArquivoId.trim()) {
    erros.push("Anexe o termo de retomada");
  }
  const temData = form.dataReinicio.trim() !== "";
  const temDias = form.diasParados.trim() !== "";
  if (!temData && !temDias) {
    erros.push("Informe a data de reinicio ou os dias parados");
  }
  if (temData && temDias) {
    erros.push("Informe apenas a data de reinicio OU os dias parados");
  }
  if (temDias && Number(form.diasParados) <= 0) {
    erros.push("Os dias parados devem ser maiores que zero");
  }
  return erros;
}

/** Valida os campos obrigatorios da Empresa Contratada: razao social e CNPJ. */
export function validarEmpresa(form: {
  razaoSocial: string;
  cnpj: string;
}): string[] {
  const erros: string[] = [];
  if (!form.razaoSocial.trim()) erros.push("Informe a razao social da empresa");
  const digitos = form.cnpj.replace(/\D/g, "");
  if (!digitos) {
    erros.push("Informe o CNPJ");
  } else if (digitos.length !== 14) {
    erros.push("O CNPJ deve ter 14 digitos");
  }
  return erros;
}

// =====================================================================
// Chamadas ao backend via proxy autenticado (/api/proxy).
// =====================================================================

async function proxy<T>(caminho: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`/api/proxy/${caminho}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!r.ok) {
    const corpo = await r.json().catch(() => ({}));
    throw new ErroApi(r.status, corpo);
  }
  return (r.status === 204 ? undefined : await r.json()) as T;
}

// --- EmpresaContratada ---
export function listarEmpresas() {
  return proxy<EmpresaContratada[]>("empresas-contratadas");
}
export function criarEmpresa(payload: CriarEmpresaContratadaPayload) {
  return proxy<EmpresaContratada>("empresas-contratadas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function atualizarEmpresa(
  id: string,
  payload: AtualizarEmpresaContratadaPayload,
) {
  return proxy<EmpresaContratada>(`empresas-contratadas/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
export function excluirEmpresa(id: string) {
  return proxy<void>(`empresas-contratadas/${id}`, { method: "DELETE" });
}

// --- Contrato ---
export function criarContrato(payload: CriarContratoPayload) {
  return proxy<Contrato>("contratos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function atualizarContrato(id: string, payload: AtualizarContratoPayload) {
  return proxy<Contrato>(`contratos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
export function excluirContrato(id: string) {
  return proxy<void>(`contratos/${id}`, { method: "DELETE" });
}
export function obterPrazoFinal(id: string) {
  return proxy<PrazoFinalExecucao>(`contratos/${id}/prazo-final`);
}
export function obterValores(id: string) {
  return proxy<ValoresContrato>(`contratos/${id}/valores`);
}

// --- Aditivos ---
export function listarAditivos(contratoId: string) {
  return proxy<Aditivo[]>(`contratos/${contratoId}/aditivos`);
}
export function criarAditivo(contratoId: string, payload: CriarAditivoPayload) {
  return proxy<AditivoCriado>(`contratos/${contratoId}/aditivos`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function atualizarAditivo(
  contratoId: string,
  id: string,
  payload: AtualizarAditivoPayload,
) {
  return proxy<AditivoCriado>(`contratos/${contratoId}/aditivos/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
export function excluirAditivo(contratoId: string, id: string) {
  return proxy<void>(`contratos/${contratoId}/aditivos/${id}`, {
    method: "DELETE",
  });
}

// --- Paralisacoes ---
export function listarParalisacoes(contratoId: string) {
  return proxy<Paralisacao[]>(`contratos/${contratoId}/paralisacoes`);
}
export function criarParalisacao(
  contratoId: string,
  payload: CriarParalisacaoPayload,
) {
  return proxy<Paralisacao>(`contratos/${contratoId}/paralisacoes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function registrarReinicio(
  contratoId: string,
  id: string,
  payload: RegistrarReinicioPayload,
) {
  return proxy<Paralisacao>(
    `contratos/${contratoId}/paralisacoes/${id}/reinicio`,
    { method: "PATCH", body: JSON.stringify(payload) },
  );
}
export function excluirParalisacao(contratoId: string, id: string) {
  return proxy<void>(`contratos/${contratoId}/paralisacoes/${id}`, {
    method: "DELETE",
  });
}
