/**
 * Formatacao de datas para exibicao (pt-BR). Funcoes PURAS, sem `Date`, para
 * nao deslocar datas puras (YYYY-MM-DD) por fuso horario.
 */

/** Data ISO (YYYY-MM-DD) em pt-BR; ausencia vira travessao. */
export function formatarData(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

/** Data-hora ISO em pt-BR ("02/03/2025 09:40"). */
export function formatarDataHora(iso: string | null | undefined): string {
  if (!iso) return "—";
  const dia = formatarData(iso);
  const hora = iso.slice(11, 16);
  return hora ? `${dia} ${hora}` : dia;
}
