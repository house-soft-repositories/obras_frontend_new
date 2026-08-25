/**
 * Apresentacao da aba Medicoes conforme a referencia Claude Design: chip do
 * tipo de boletim e resumo do valor medido. Funcoes PURAS, testaveis em vitest.
 */
import type { TipoMedicao } from "@/lib/api/medicoes";
import type { ChipRotulo } from "./contrato-aba";

const CHIPS_MEDICAO: Record<TipoMedicao, ChipRotulo> = {
  NORMAL: { titulo: "Normal", classe: "chip-azul" },
  RETIFICACAO: { titulo: "Retificação", classe: "chip-ambar" },
  EXTRA: { titulo: "Extra", classe: "chip-roxo" },
  REAJUSTAMENTO: { titulo: "Reajustamento", classe: "chip-cinza" },
};

/** Chip do tipo do boletim de medicao (RN-CRO-20). */
export function chipTipoMedicao(tipo: TipoMedicao | string): ChipRotulo {
  return (
    CHIPS_MEDICAO[tipo as TipoMedicao] ?? { titulo: tipo, classe: "chip-cinza" }
  );
}

/**
 * Subtitulo do card "Valor medido total": percentual sobre o total contratado
 * (quando conhecido) e contagem de boletins. Sem o percentual, mostra so a
 * contagem — o card nunca fica sem numero.
 */
export function resumoMedido(
  quantidade: number,
  percentual: number | null,
): string {
  const boletins = `${quantidade} ${quantidade === 1 ? "boletim" : "boletins"}`;
  if (percentual === null) return boletins;
  const pct = percentual.toLocaleString("pt-BR", {
    maximumFractionDigits: 1,
  });
  return `${pct}% do total contratado · ${boletins}`;
}
