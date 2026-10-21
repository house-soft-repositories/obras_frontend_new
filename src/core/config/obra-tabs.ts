export const OBRA_TABS = [
  { id: "dados", label: "Dados" },
  { id: "cronograma", label: "Cronograma" },
  { id: "contrato", label: "Contrato" },
  { id: "medicoes", label: "Medições" },
  { id: "financeiro", label: "Financeiro" },
  { id: "arquivos", label: "Arquivos" },
] as const;

export type ObraTabId = (typeof OBRA_TABS)[number]["id"];

const TAB_IDS = new Set<ObraTabId>(OBRA_TABS.map(({ id }) => id));

export function parseObraTab(
  value: string | string[] | null | undefined,
): ObraTabId {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && TAB_IDS.has(candidate as ObraTabId)
    ? (candidate as ObraTabId)
    : "dados";
}

export function obraTabHref(obraId: string, tab: ObraTabId): string {
  return `/obras/${encodeURIComponent(obraId)}?tab=${encodeURIComponent(tab)}`;
}
