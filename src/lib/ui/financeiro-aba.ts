/**
 * Apresentacao da aba Financeiro conforme a referencia Claude Design: chip do
 * tipo de empenho e os tres cards de totais (empenhado/liquidado/pago) que
 * acompanham as barras da visao fisico-financeira. Funcoes PURAS.
 */
import {
  formatarMoedaBRL,
  type TipoEmpenho,
  type VisaoFisicoFinanceira,
} from "@/lib/api/financeiro";
import type { ChipRotulo } from "./contrato-aba";

const CHIPS_EMPENHO: Record<TipoEmpenho, ChipRotulo> = {
  ORDINARIO: { titulo: "Ordinário", classe: "chip-azul" },
  ESTIMATIVO: { titulo: "Estimativo", classe: "chip-ambar" },
  GLOBAL: { titulo: "Global", classe: "chip-roxo" },
};

/** Chip do tipo de empenho (RN-FIN-04). */
export function chipTipoEmpenho(tipo: TipoEmpenho | string): ChipRotulo {
  return (
    CHIPS_EMPENHO[tipo as TipoEmpenho] ?? { titulo: tipo, classe: "chip-cinza" }
  );
}

export interface CartaoTotal {
  chave: string;
  rotulo: string;
  valorFormatado: string;
  /** Percentual sobre o total contratado, ja formatado ("64%"). */
  percentualTexto: string;
}

/**
 * Cards de totais da execucao orcamentaria (RN-FIN-08), na ordem do manual
 * 10.7: empenhado -> liquidado -> pago, sempre com o percentual sobre o total
 * contratado.
 */
export function cartoesTotais(v: VisaoFisicoFinanceira): CartaoTotal[] {
  return [
    { chave: "empenhado", rotulo: "Empenhado total", ind: v.empenhadoTotal },
    { chave: "liquidado", rotulo: "Liquidado total", ind: v.liquidadoTotal },
    { chave: "pago", rotulo: "Pago total", ind: v.pagoTotal },
  ].map(({ chave, rotulo, ind }) => ({
    chave,
    rotulo,
    valorFormatado: formatarMoedaBRL(ind.valor),
    percentualTexto: `${ind.percentual.toLocaleString("pt-BR", {
      maximumFractionDigits: 1,
    })}%`,
  }));
}
