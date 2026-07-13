/**
 * Logica pura do detalhe unificado da obra (RF-14): definicao das abas do
 * layout /obras/[id] e derivacao da aba ativa a partir do pathname. As URLs
 * das rotas filhas existentes nao mudam. Testavel em vitest node.
 */

export type ChaveAbaDetalhe =
  | "dados"
  | "cronograma"
  | "contrato"
  | "medicoes"
  | "financeiro"
  | "arquivos";

export interface AbaDetalhe {
  chave: ChaveAbaDetalhe;
  titulo: string;
  href: string;
}

const DEFINICAO_ABAS: {
  chave: ChaveAbaDetalhe;
  titulo: string;
  segmento: string;
}[] = [
  { chave: "dados", titulo: "Dados", segmento: "editar" },
  { chave: "cronograma", titulo: "Cronograma", segmento: "cronograma" },
  { chave: "contrato", titulo: "Contrato", segmento: "contrato" },
  { chave: "medicoes", titulo: "Medições", segmento: "medicoes" },
  { chave: "financeiro", titulo: "Financeiro", segmento: "financeiro" },
  { chave: "arquivos", titulo: "Arquivos", segmento: "arquivos" },
];

/** Abas do detalhe da obra com os hrefs das rotas filhas existentes. */
export function abasDetalheObra(obraId: string): AbaDetalhe[] {
  return DEFINICAO_ABAS.map(({ chave, titulo, segmento }) => ({
    chave,
    titulo,
    href: `/obras/${obraId}/${segmento}`,
  }));
}

/**
 * Aba ativa a partir do pathname atual: o segmento apos /obras/{id} decide a
 * aba ("editar" -> Dados). Cronograma tambem cobre as sub-rotas
 * /cronograma/gantt e /cronograma/calendario. Fora do detalhe retorna null.
 */
export function abaAtivaDoPathname(pathname: string): ChaveAbaDetalhe | null {
  const partes = pathname.split("?")[0].split("/").filter(Boolean);
  const idxObras = partes.indexOf("obras");
  if (idxObras < 0) return null;
  const segmento = partes[idxObras + 2];
  switch (segmento) {
    case "editar":
      return "dados";
    case "cronograma":
      return "cronograma";
    case "contrato":
      return "contrato";
    case "medicoes":
      return "medicoes";
    case "financeiro":
      return "financeiro";
    case "arquivos":
      return "arquivos";
    default:
      return null;
  }
}
