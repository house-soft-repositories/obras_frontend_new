/**
 * Logica PURA dos cartoes de KPI do Dashboard (E7): monta os 4 indicadores a
 * partir do ContagemPorStatus e do numero de orgaos do payload ja carregado.
 * Sem fetch — testavel em vitest node.
 */
import type { ContagemPorStatus } from "./relatorios";

/** Cartao de KPI pronto para renderizacao: dot colorido, valor e subtitulo. */
export interface KpiDashboard {
  label: string;
  valor: number;
  sub: string;
  cor: string;
}

/** Percentual inteiro (Math.round) de parte sobre total; total 0 -> 0. */
function percentual(parte: number, total: number): number {
  return total > 0 ? Math.round((parte / total) * 100) : 0;
}

/**
 * Monta os 4 KPIs do Dashboard na ordem do design: total de obras, em
 * desenvolvimento, concluidas e paralisadas (cores fixas por indicador).
 */
export function montarKpisDashboard(
  contagem: ContagemPorStatus,
  numeroOrgaos: number,
): KpiDashboard[] {
  return [
    {
      label: "Total de obras",
      valor: contagem.total,
      sub: numeroOrgaos === 1 ? "em 1 órgão" : `em ${numeroOrgaos} órgãos`,
      cor: "#2563eb",
    },
    {
      label: "Em desenvolvimento",
      valor: contagem.emDesenvolvimento,
      sub: `${percentual(contagem.emDesenvolvimento, contagem.total)}% da carteira`,
      cor: "#16a34a",
    },
    {
      label: "Concluídas",
      valor: contagem.concluidas,
      sub: `${percentual(contagem.concluidas, contagem.total)}% da carteira`,
      cor: "#0891b2",
    },
    {
      label: "Paralisadas",
      valor: contagem.paralisadas,
      sub: "requerem atenção",
      cor: "#dc2626",
    },
  ];
}
