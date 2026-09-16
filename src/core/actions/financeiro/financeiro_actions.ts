"use server";

// TODO(backend): o backend novo ainda não expõe endpoints financeiro
// (empenhos/liquidações/pagamentos e visão físico-financeira existiam apenas
// no legado). Esta action é um placeholder que retorna estado vazio para a
// aba Financeiro exibir empty-state em pt-BR até o endpoint existir.

export type FinanceiroResumo = {
  empenhadoCentavos: number;
  liquidadoCentavos: number;
  pagoCentavos: number;
};

export async function getFinanceiroResumoAction(
  _obraId: string,
): Promise<FinanceiroResumo> {
  return { empenhadoCentavos: 0, liquidadoCentavos: 0, pagoCentavos: 0 };
}
