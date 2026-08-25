/**
 * Apresentacao da aba Contrato conforme a referencia Claude Design: chips de
 * tipo de aditivo, resumo de prazo/valor por aditivo e situacao da paralisacao.
 * Funcoes PURAS (sem React), testaveis em vitest node.
 */
import type { TipoAditivo } from "@/lib/api/contratos";
import { formatarData } from "./datas";

export interface ChipRotulo {
  titulo: string;
  /** Classe utilitaria de chip declarada em globals.css. */
  classe: string;
}

const CHIPS_ADITIVO: Record<TipoAditivo, ChipRotulo> = {
  PRAZO: { titulo: "Prazo", classe: "chip-azul" },
  VALOR: { titulo: "Valor", classe: "chip-verde" },
  PRAZO_E_VALOR: { titulo: "Prazo + valor", classe: "chip-roxo" },
  FONTE: { titulo: "Fonte", classe: "chip-ambar" },
  OUTROS: { titulo: "Outros", classe: "chip-cinza" },
};

/** Chip do tipo de aditivo (RN-CON-06). */
export function chipTipoAditivo(tipo: TipoAditivo | string): ChipRotulo {
  return (
    CHIPS_ADITIVO[tipo as TipoAditivo] ?? { titulo: tipo, classe: "chip-cinza" }
  );
}

/**
 * Prazo de execucao aditivado como texto: "+ 90 dias" quando informado em
 * dias, a data quando informado como data, travessao quando o tipo nao mexe
 * no prazo (RN-CON-06/07).
 */
export function prazoAditivo(aditivo: {
  prazoExecucaoDias: number | null;
  prazoExecucaoData: string | null;
}): string {
  if (aditivo.prazoExecucaoDias !== null) {
    return `+ ${aditivo.prazoExecucaoDias} dias`;
  }
  if (aditivo.prazoExecucaoData) return formatarData(aditivo.prazoExecucaoData);
  return "—";
}

/**
 * Situacao da paralisacao: em aberto enquanto nao houver reinicio registrado
 * (RN-CON-12/14).
 */
export function situacaoParalisacao(paralisacao: {
  dataReinicio: string | null;
  diasParados: number | null;
}): ChipRotulo & { aberta: boolean } {
  const aberta = !paralisacao.dataReinicio && paralisacao.diasParados === null;
  return aberta
    ? { aberta: true, titulo: "Em aberto", classe: "chip-vermelho" }
    : { aberta: false, titulo: "Reiniciada", classe: "chip-verde" };
}

/** Dias parados da paralisacao como texto ("30 dias parados"). */
export function diasParadosTexto(diasParados: number | null): string {
  return diasParados === null ? "—" : `${diasParados} dias parados`;
}

/**
 * Decomposicao do prazo final exibida no card de destaque (RN-CON-01):
 * marco zero + prazo do contrato + paralisacoes + aditivos de execucao.
 */
export function partesPrazoFinal(
  dataOs: string,
  prazo: { diasBase: number; diasParalisacoes: number; diasAditivos: number },
): { chave: string; valor: string }[] {
  return [
    { chave: "Data da O.S. (marco zero)", valor: formatarData(dataOs) },
    { chave: "Prazo de execução", valor: `${prazo.diasBase} dias` },
    { chave: "Paralisações", valor: `+ ${prazo.diasParalisacoes} dias` },
    { chave: "Aditivos de prazo", valor: `+ ${prazo.diasAditivos} dias` },
  ];
}
