/**
 * Cliente e regras de UI do FinanceiroContext (E6-05). Tipos de request do
 * contrato OpenAPI (types.gen.ts); regras de dominio (RN-FIN-04/10, encadeamento
 * empenho->liquidacao->pagamento) em funcoes PURAS testaveis sem render.
 */
import { ErroApi } from "./obras";
import type { components } from "./types.gen";

export { ErroApi };

// --- Tipos de request gerados do contrato OpenAPI ---
export type CriarEmpenhoPayload = components["schemas"]["CriarEmpenhoDto"];
export type AtualizarEmpenhoPayload =
  components["schemas"]["AtualizarEmpenhoDto"];
export type CriarLiquidacaoPayload =
  components["schemas"]["CriarLiquidacaoDto"];
export type CriarPagamentoPayload = components["schemas"]["CriarPagamentoDto"];

// --- Enum (espelha TipoEmpenho do backend) ---
export type TipoEmpenho = "ORDINARIO" | "ESTIMATIVO" | "GLOBAL";
export const TIPOS_EMPENHO: { chave: TipoEmpenho; titulo: string }[] = [
  { chave: "ORDINARIO", titulo: "Ordinario" },
  { chave: "ESTIMATIVO", titulo: "Estimativo" },
  { chave: "GLOBAL", titulo: "Global" },
];

// --- Entidades retornadas pela API (tipadas a mao) ---
export interface Empenho {
  id: string;
  obraId: string;
  fonteId: string;
  tipo: TipoEmpenho;
  numero: string;
  dataEmpenho: string;
  valor: string;
  observacoes: string | null;
}

export interface Liquidacao {
  id: string;
  empenhoId: string;
  fonteId: string;
  numero: string;
  dataLiquidacao: string;
  valor: string;
  observacoes: string | null;
}

export interface Pagamento {
  id: string;
  empenhoId: string;
  liquidacaoId: string;
  fonteId: string;
  numeroOrdemBancaria: string;
  dataOrdemBancaria: string;
  valor: string;
  observacoes: string | null;
  alerta?: string;
}

export interface IndicadorFinanceiro {
  valor: string;
  percentual: number;
}

export interface VisaoFisicoFinanceira {
  obraId: string;
  contratadoInicial: IndicadorFinanceiro;
  aditivadoTotal: IndicadorFinanceiro;
  totalContratado: IndicadorFinanceiro;
  medidoTotal: IndicadorFinanceiro;
  empenhadoTotal: IndicadorFinanceiro;
  liquidadoTotal: IndicadorFinanceiro;
  pagoTotal: IndicadorFinanceiro;
}

/** Indicadores na ordem do manual 10.7 (Contratado -> ... -> Pago). */
export function indicadoresVisao(
  v: VisaoFisicoFinanceira,
): { chave: string; titulo: string; indicador: IndicadorFinanceiro }[] {
  return [
    { chave: "contratadoInicial", titulo: "Contratado Inicial", indicador: v.contratadoInicial },
    { chave: "aditivadoTotal", titulo: "Aditivado", indicador: v.aditivadoTotal },
    { chave: "totalContratado", titulo: "Total Contratado", indicador: v.totalContratado },
    { chave: "medidoTotal", titulo: "Medido", indicador: v.medidoTotal },
    { chave: "empenhadoTotal", titulo: "Empenhado", indicador: v.empenhadoTotal },
    { chave: "liquidadoTotal", titulo: "Liquidado", indicador: v.liquidadoTotal },
    { chave: "pagoTotal", titulo: "Pago", indicador: v.pagoTotal },
  ];
}

/** Liquidacoes de um empenho (select encadeado do formulario de Pagamento). */
export function filtrarLiquidacoesPorEmpenho(
  liquidacoes: Liquidacao[],
  empenhoId: string,
): Liquidacao[] {
  return liquidacoes.filter((l) => l.empenhoId === empenhoId);
}

function valorPositivo(valor: string): boolean {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0;
}

// --- Validacoes de formulario (puras) ---
export interface FormularioEmpenho {
  fonteId: string;
  tipo: TipoEmpenho | "";
  numero: string;
  dataEmpenho: string;
  valor: string;
  observacoes?: string;
}

export function validarEmpenho(form: FormularioEmpenho): string[] {
  const erros: string[] = [];
  if (!form.tipo) erros.push("Selecione o tipo de empenho"); // RN-FIN-04
  if (!form.fonteId) erros.push("Selecione a fonte");
  if (!form.numero.trim()) erros.push("Informe o numero do empenho");
  if (!form.dataEmpenho) erros.push("Informe a data do empenho");
  if (!valorPositivo(form.valor)) erros.push("Informe um valor positivo"); // RN-FIN-10
  return erros;
}

export interface FormularioLiquidacao {
  empenhoId: string;
  fonteId: string;
  numero: string;
  dataLiquidacao: string;
  valor: string;
  observacoes?: string;
}

export function validarLiquidacao(form: FormularioLiquidacao): string[] {
  const erros: string[] = [];
  if (!form.empenhoId) erros.push("Selecione o empenho"); // RN-FIN-02
  if (!form.fonteId) erros.push("Selecione a fonte");
  if (!form.numero.trim()) erros.push("Informe o numero da liquidacao");
  if (!form.dataLiquidacao) erros.push("Informe a data da liquidacao");
  if (!valorPositivo(form.valor)) erros.push("Informe um valor positivo");
  return erros;
}

export interface FormularioPagamento {
  empenhoId: string;
  liquidacaoId: string;
  fonteId: string;
  numeroOrdemBancaria: string;
  dataOrdemBancaria: string;
  valor: string;
  observacoes?: string;
}

export function validarPagamento(form: FormularioPagamento): string[] {
  const erros: string[] = [];
  if (!form.empenhoId) erros.push("Selecione o empenho"); // RN-FIN-03
  if (!form.liquidacaoId) erros.push("Selecione a liquidacao");
  if (!form.fonteId) erros.push("Selecione a fonte");
  if (!form.numeroOrdemBancaria.trim()) erros.push("Informe o numero da O.B.");
  if (!form.dataOrdemBancaria) erros.push("Informe a data da O.B.");
  if (!valorPositivo(form.valor)) erros.push("Informe um valor positivo");
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

const base = (obraId: string) => `obras/${obraId}`;

export function listarEmpenhos(obraId: string) {
  return proxy<Empenho[]>(`${base(obraId)}/empenhos`);
}
export function criarEmpenho(obraId: string, payload: CriarEmpenhoPayload) {
  return proxy<Empenho>(`${base(obraId)}/empenhos`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function excluirEmpenho(obraId: string, id: string) {
  return proxy<void>(`${base(obraId)}/empenhos/${id}`, { method: "DELETE" });
}

export function listarLiquidacoes(obraId: string) {
  return proxy<Liquidacao[]>(`${base(obraId)}/liquidacoes`);
}
export function criarLiquidacao(obraId: string, payload: CriarLiquidacaoPayload) {
  return proxy<Liquidacao>(`${base(obraId)}/liquidacoes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function excluirLiquidacao(obraId: string, id: string) {
  return proxy<void>(`${base(obraId)}/liquidacoes/${id}`, { method: "DELETE" });
}

export function listarPagamentos(obraId: string) {
  return proxy<Pagamento[]>(`${base(obraId)}/pagamentos`);
}
export function criarPagamento(obraId: string, payload: CriarPagamentoPayload) {
  return proxy<Pagamento>(`${base(obraId)}/pagamentos`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export function excluirPagamento(obraId: string, id: string) {
  return proxy<void>(`${base(obraId)}/pagamentos/${id}`, { method: "DELETE" });
}

export function obterVisaoFisicoFinanceira(obraId: string) {
  return proxy<VisaoFisicoFinanceira>(`${base(obraId)}/visao-fisico-financeira`);
}
