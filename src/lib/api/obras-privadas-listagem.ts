/**
 * Estado da listagem de obras privadas sincronizado com a query string, no
 * mesmo padrao de `obras-listagem.ts`: o filtro vive na URL para que o fiscal
 * possa compartilhar e voltar ao mesmo recorte com o botao de historico.
 *
 * Funcoes puras — testadas em vitest node, sem tocar em `useSearchParams`.
 */

export const TAMANHO_PAGINA = 50;

export interface FiltroObrasPrivadas {
  buscaTextual?: string;
  situacaoAlvara?: string;
  andamento?: string;
  habiteSe?: string;
  bairro?: string;
  orgaoId?: string;
  /** Chips rapidos: fatos derivados, nao colunas. */
  autuada?: boolean;
  embargada?: boolean;
  semAlvara?: boolean;
  semVisita90?: boolean;
}

export interface EstadoListagem {
  filtro: FiltroObrasPrivadas;
  pagina: number;
  visao: "lista" | "mapa";
}

/** Le o estado a partir dos parametros da URL. */
export function lerEstadoListagem(
  params: URLSearchParams | Record<string, string | undefined>,
): EstadoListagem {
  const get = (chave: string): string | undefined => {
    const valor =
      params instanceof URLSearchParams ? params.get(chave) : params[chave];
    return valor ?? undefined;
  };
  const ligado = (chave: string) => get(chave) === "1";
  const pagina = Number(get("pagina") ?? "1");

  return {
    filtro: {
      buscaTextual: get("busca") || undefined,
      situacaoAlvara: get("situacaoAlvara") || undefined,
      andamento: get("andamento") || undefined,
      habiteSe: get("habiteSe") || undefined,
      bairro: get("bairro") || undefined,
      orgaoId: get("orgaoId") || undefined,
      autuada: ligado("autuada") || undefined,
      embargada: ligado("embargada") || undefined,
      semAlvara: ligado("semAlvara") || undefined,
      semVisita90: ligado("semVisita90") || undefined,
    },
    pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
    visao: get("visao") === "mapa" ? "mapa" : "lista",
  };
}

/** Serializa o estado de volta para a query string da URL. */
export function montarQueryUrl(estado: EstadoListagem): string {
  const p = new URLSearchParams();
  const f = estado.filtro;
  if (f.buscaTextual) p.set("busca", f.buscaTextual);
  if (f.situacaoAlvara) p.set("situacaoAlvara", f.situacaoAlvara);
  if (f.andamento) p.set("andamento", f.andamento);
  if (f.habiteSe) p.set("habiteSe", f.habiteSe);
  if (f.bairro) p.set("bairro", f.bairro);
  if (f.orgaoId) p.set("orgaoId", f.orgaoId);
  if (f.autuada) p.set("autuada", "1");
  if (f.embargada) p.set("embargada", "1");
  if (f.semAlvara) p.set("semAlvara", "1");
  if (f.semVisita90) p.set("semVisita90", "1");
  if (estado.visao === "mapa") p.set("visao", "mapa");
  if (estado.pagina > 1) p.set("pagina", String(estado.pagina));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/**
 * Traduz o estado da tela para os parametros da API. O chip "Sem alvará" vira
 * o filtro `situacaoAlvara`, e nao um booleano proprio: no backend ele e um
 * valor do enum, nao um fato derivado como autuada/embargada.
 */
export function montarFiltroApi(
  estado: EstadoListagem,
): Record<string, string | number | boolean | undefined> {
  const f = estado.filtro;
  return {
    busca: f.buscaTextual,
    // O chip explicito vence o select quando os dois apontam para alvara.
    situacaoAlvara: f.semAlvara ? "SEM_ALVARA" : f.situacaoAlvara,
    andamento: f.andamento,
    habiteSe: f.habiteSe,
    bairro: f.bairro,
    orgaoId: f.orgaoId,
    autuada: f.autuada,
    embargada: f.embargada,
    semVisitaHaDias: f.semVisita90 ? 90 : undefined,
    page: estado.pagina,
    limit: TAMANHO_PAGINA,
  };
}

/** Alterna um chip rapido, sempre voltando para a primeira pagina. */
export function alternarChip(
  estado: EstadoListagem,
  chip: keyof Pick<
    FiltroObrasPrivadas,
    "autuada" | "embargada" | "semAlvara" | "semVisita90"
  >,
): EstadoListagem {
  return {
    ...estado,
    pagina: 1,
    filtro: { ...estado.filtro, [chip]: !estado.filtro[chip] || undefined },
  };
}

/** Aplica um filtro de select, voltando para a primeira pagina. */
export function aplicarFiltro(
  estado: EstadoListagem,
  campo: keyof FiltroObrasPrivadas,
  valor: string | undefined,
): EstadoListagem {
  return {
    ...estado,
    pagina: 1,
    filtro: { ...estado.filtro, [campo]: valor || undefined },
  };
}

export function totalPaginas(total: number, tamanho = TAMANHO_PAGINA): number {
  return Math.max(1, Math.ceil(total / tamanho));
}

/**
 * Paginas visiveis no rodape: primeira, ultima e a janela ao redor da atual,
 * sem repetir. Mesma politica da listagem de obras publicas.
 */
export function paginasVisiveis(atual: number, total: number): number[] {
  const paginas = new Set<number>([1, total]);
  for (let p = atual - 1; p <= atual + 1; p += 1) {
    if (p >= 1 && p <= total) paginas.add(p);
  }
  return [...paginas].sort((a, b) => a - b);
}

/** "Exibindo 1–50 de 318". */
export function resumoPaginacao(
  pagina: number,
  total: number,
  tamanho = TAMANHO_PAGINA,
): string {
  if (total === 0) return "Nenhum registro";
  const inicio = (pagina - 1) * tamanho + 1;
  const fim = Math.min(pagina * tamanho, total);
  return `Exibindo ${inicio}–${fim} de ${total}`;
}

/** Quantos filtros estao ativos, para o rotulo "Limpar filtros (3)". */
export function contarFiltrosAtivos(filtro: FiltroObrasPrivadas): number {
  return Object.values(filtro).filter(
    (v) => v !== undefined && v !== "" && v !== false,
  ).length;
}
