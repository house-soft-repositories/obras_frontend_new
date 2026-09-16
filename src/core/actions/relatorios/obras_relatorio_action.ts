
import listObrasAction from "@/core/actions/obras/list_obras_action";
import type { Obra } from "@/core/schemas/obras/obra_schema";

export interface FiltroRelatorioObras {
  q?: string;
  status?: string;
  tipo?: string;
  orgaoId?: string;
}

export interface ContagemPorStatus {
  total: number;
  emAberto: number;
  emDesenvolvimento: number;
  concluidas: number;
  paralisadas: number;
  canceladas: number;
}

export interface ObrasPorOrgaoItem {
  orgaoId: string;
  orgaoNome: string;
  total: number;
}

export interface QuantificadoresObras {
  totalObras: number;
  emDesenvolvimento: number;
  concluidas: number;
  paralisadas: number;
  semStatus: number;
}

export interface ResumoDashboard {
  contagem: ContagemPorStatus;
  obrasPorOrgao: ObrasPorOrgaoItem[];
  fluxoFinanceiro: Array<{ nome: string; valor: number }>;
  fisicoVsFinanceiro: Array<{ nome: string; percentual: number }>;
}

type ObraExtra = Obra & Record<string, unknown>;

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function numero(valor: unknown): number {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function lerOrgao(obra: Obra): { id: string; nome: string } {
  const extra = obra as ObraExtra;
  const aninhado = extra.orgao as { id?: unknown; nome?: unknown } | undefined;
  const id =
    texto(extra.orgaoId) || texto(aninhado?.id) || "sem-orgao";
  const nome =
    texto((extra as Record<string, unknown>).orgaoNome) ||
    texto(aninhado?.nome) ||
    "Sem órgão";
  return { id, nome };
}

export function lerStatus(obra: Obra): string {
  return texto((obra as ObraExtra).status).toUpperCase();
}

function normalizarStatus(status: string): keyof Omit<ContagemPorStatus, "total"> | null {
  if (!status) return null;
  if (status.includes("DESENVOLV")) return "emDesenvolvimento";
  if (status.includes("CONCLU")) return "concluidas";
  if (status.includes("PARALIS")) return "paralisadas";
  if (status.includes("CANCEL")) return "canceladas";
  if (status.includes("ABERTO") || status.includes("CADASTR") || status.includes("NOVA"))
    return "emAberto";
  return null;
}

/**
 * Agrega o dashboard a partir de listObrasAction.
 * TODO: substituir por GET /api/relatorios/dashboard quando o backend
 * expor o endpoint agregado (contrato legado: quantificadores, fluxo,
 * contagemPorStatus, obrasPorOrgao).
 */
export async function obterResumoDashboard(
  filtro: Pick<FiltroRelatorioObras, "orgaoId"> = {},
): Promise<ResumoDashboard> {
  const { data } = await listObrasAction({
    take: 50,
    order: "DESC",
    orgaoId: filtro.orgaoId || undefined,
  });

  const contagem: ContagemPorStatus = {
    total: data.length,
    emAberto: 0,
    emDesenvolvimento: 0,
    concluidas: 0,
    paralisadas: 0,
    canceladas: 0,
  };
  const porOrgao = new Map<string, ObrasPorOrgaoItem>();
  const financeiro = {
    Contratado: 0,
    Medido: 0,
    Empenhado: 0,
    Liquidado: 0,
    Pago: 0,
  };

  for (const obra of data) {
    const slot = normalizarStatus(lerStatus(obra));
    if (slot) contagem[slot] += 1;
    else contagem.emAberto += 1;

    const { id, nome } = lerOrgao(obra);
    const atual = porOrgao.get(id) ?? { orgaoId: id, orgaoNome: nome, total: 0 };
    atual.total += 1;
    if (nome !== "Sem órgão") atual.orgaoNome = nome;
    porOrgao.set(id, atual);

    const extra = obra as ObraExtra;
    financeiro.Contratado += numero(
      extra.valorContratado ?? extra.totalContratado ?? extra.contratado,
    );
    financeiro.Medido += numero(extra.medidoTotal ?? extra.medido);
    financeiro.Empenhado += numero(extra.empenhadoTotal ?? extra.empenhado);
    financeiro.Liquidado += numero(extra.liquidadoTotal ?? extra.liquidado);
    financeiro.Pago += numero(extra.pagoTotal ?? extra.pago);
  }

  const obrasPorOrgao = [...porOrgao.values()].sort((a, b) => b.total - a.total);
  const fluxoFinanceiro = Object.entries(financeiro).map(([nome, valor]) => ({
    nome,
    valor,
  }));
  const base = Math.max(contagem.total, 1);
  const fisicoVsFinanceiro = [
    {
      nome: "Físico",
      percentual: Math.round((contagem.concluidas / base) * 100),
    },
    {
      nome: "Financeiro",
      percentual: Math.round(
        ((contagem.concluidas + contagem.emDesenvolvimento) / base) * 100,
      ),
    },
  ];

  return { contagem, obrasPorOrgao, fluxoFinanceiro, fisicoVsFinanceiro };
}

/**
 * Lista + quantificadores do relatório de obras via listObrasAction.
 * TODO: substituir por GET /api/relatorios/obras + /quantificadores quando
 * o backend expor os endpoints (filtros completos, mapa, calendário e
 * exportação PDF/CSV do legado).
 */
export async function listarObrasRelatorio(filtro: FiltroRelatorioObras = {}): Promise<{
  obras: Obra[];
  quantificadores: QuantificadoresObras;
  total: number;
}> {
  const { data } = await listObrasAction({
    take: 500,
    order: "DESC",
    q: filtro.q || undefined,
    status: filtro.status || undefined,
    tipo: filtro.tipo || undefined,
    orgaoId: filtro.orgaoId || undefined,
  });

  const quantificadores: QuantificadoresObras = {
    totalObras: data.length,
    emDesenvolvimento: 0,
    concluidas: 0,
    paralisadas: 0,
    semStatus: 0,
  };
  for (const obra of data) {
    const slot = normalizarStatus(lerStatus(obra));
    if (slot === "emDesenvolvimento") quantificadores.emDesenvolvimento += 1;
    else if (slot === "concluidas") quantificadores.concluidas += 1;
    else if (slot === "paralisadas") quantificadores.paralisadas += 1;
    else if (slot === null) quantificadores.semStatus += 1;
  }

  return { obras: data, quantificadores, total: data.length };
}
