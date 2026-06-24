import type { ItemListaObras } from "@/lib/api/relatorios";

/**
 * Agrupa obras pelo dia do mes do prazo de conclusao do estagio atual
 * (RN-REL-13, modo calendario). Funcao PURA. `ano`/`mes` 1-based; retorna
 * Map<dia(1-31), obras> apenas para as obras cujo prazo cai no mes informado.
 */
export function agruparPorDia(
  obras: ItemListaObras[],
  ano: number,
  mes: number,
): Map<number, ItemListaObras[]> {
  const out = new Map<number, ItemListaObras[]>();
  for (const o of obras) {
    const prazo = o.prazoConclusaoEstagio;
    if (!prazo) continue;
    const [a, m, d] = prazo.slice(0, 10).split("-").map(Number);
    if (a !== ano || m !== mes) continue;
    if (!out.has(d)) out.set(d, []);
    out.get(d)!.push(o);
  }
  return out;
}

/** Numero de dias no mes (1-based). */
export function diasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate();
}
