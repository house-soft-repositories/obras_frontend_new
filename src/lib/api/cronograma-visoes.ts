/**
 * Funcoes puras das visoes de acompanhamento do cronograma (E3-08 / RN-CRO-22,
 * RN-CRO-17): Gantt (barras por data), calendario mensal (prazos por dia) e
 * historico Meta x Realizado por estagio. Testaveis sem renderizar.
 */
import type { Acompanhamento, Estagio } from "./cronograma";

function diaUTC(data: string): number {
  const [a, m, d] = data.split("-").map(Number);
  return Date.UTC(a, m - 1, d) / 86_400_000;
}

export interface BarraGantt {
  id: string;
  descricao: string;
  left: number; // % do inicio
  width: number; // % da largura
  concluido: boolean;
  ehSubatividade: boolean;
}

/**
 * Calcula a posicao/largura percentual de cada estagio com datas dentro do
 * intervalo [inicio, fim] da obra. Estagios sem datas sao omitidos. Quando o
 * intervalo e degenerado (inicio == fim), todas as barras ficam em 0..100.
 */
export function calcularBarrasGantt(
  estagios: Estagio[],
  intervalo: { inicio: string | null; fim: string | null },
): BarraGantt[] {
  if (!intervalo.inicio || !intervalo.fim) return [];
  const ini = diaUTC(intervalo.inicio);
  const fim = diaUTC(intervalo.fim);
  const total = fim - ini;
  return estagios
    .filter((e) => e.dataInicio && e.dataPrazo)
    .map((e) => {
      const eIni = diaUTC(e.dataInicio as string);
      const eFim = diaUTC(e.dataPrazo as string);
      const left = total > 0 ? ((eIni - ini) / total) * 100 : 0;
      const width = total > 0 ? ((eFim - eIni) / total) * 100 : 100;
      return {
        id: e.id,
        descricao: e.descricao,
        left: Math.max(0, Math.min(100, left)),
        width: Math.max(1, Math.min(100, width)),
        concluido: e.concluido,
        ehSubatividade: e.estagioPaiId != null,
      };
    });
}

/** Semanas (domingo a sabado) do mes; dias fora do mes ficam null. */
export function matrizCalendario(ano: number, mes: number): (number | null)[][] {
  const primeiro = new Date(Date.UTC(ano, mes - 1, 1));
  const diaSemanaInicio = primeiro.getUTCDay(); // 0 = domingo
  const diasNoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  const semanas: (number | null)[][] = [];
  let semana: (number | null)[] = new Array(diaSemanaInicio).fill(null);
  for (let dia = 1; dia <= diasNoMes; dia++) {
    semana.push(dia);
    if (semana.length === 7) {
      semanas.push(semana);
      semana = [];
    }
  }
  if (semana.length > 0) {
    while (semana.length < 7) semana.push(null);
    semanas.push(semana);
  }
  return semanas;
}

/** Mapa dia-do-mes -> estagios cujo data_prazo cai naquele dia (RN-CRO-22). */
export function agruparPrazosPorDia(
  estagios: Estagio[],
  ano: number,
  mes: number,
): Map<number, Estagio[]> {
  const mapa = new Map<number, Estagio[]>();
  const prefixo = `${ano.toString().padStart(4, "0")}-${mes
    .toString()
    .padStart(2, "0")}-`;
  for (const e of estagios) {
    if (!e.dataPrazo || !e.dataPrazo.startsWith(prefixo)) continue;
    const dia = Number(e.dataPrazo.slice(8, 10));
    const lista = mapa.get(dia) ?? [];
    lista.push(e);
    mapa.set(dia, lista);
  }
  return mapa;
}

export interface PontoHistorico {
  data: string;
  meta: number | null;
  realizado: number | null;
}

/** Serie Meta x Realizado ordenada por data_referencia (RN-CRO-17). */
export function serieHistorico(
  acompanhamentos: Acompanhamento[],
): PontoHistorico[] {
  return [...acompanhamentos]
    .sort((a, b) => a.dataReferencia.localeCompare(b.dataReferencia))
    .map((a) => ({
      data: a.dataReferencia,
      meta: a.valorMeta != null ? Number(a.valorMeta) : null,
      realizado: a.valorRealizado != null ? Number(a.valorRealizado) : null,
    }));
}

/** Rotulo do eixo conforme o tipo de valor do estagio (RN-CRO-17). */
export function unidadeEixo(tipoValor: string | null): string {
  if (tipoValor === "PERCENTUAL") return "%";
  if (tipoValor === "FINANCEIRO") return "R$";
  if (tipoValor === "NUMERICO") return "un";
  return "";
}
