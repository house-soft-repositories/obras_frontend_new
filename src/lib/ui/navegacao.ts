/**
 * Logica pura de navegacao da sidebar. Vive aqui, e nao no componente, porque
 * o vitest do projeto roda em ambiente node (sem DOM) — importar o
 * `sidebar.tsx` traria `next/link` junto e quebraria o teste.
 */

export interface ItemMenu {
  href: string;
  rotulo: string;
  icone: string;
}

/** Menu do lado publico (obras da propria prefeitura). */
export const MENU: ItemMenu[] = [
  { href: "/home", rotulo: "Home", icone: "⌂" },
  { href: "/obras", rotulo: "Obras", icone: "▤" },
  { href: "/obras/nova", rotulo: "Nova obra", icone: "＋" },
  { href: "/dashboard", rotulo: "Dashboard", icone: "◧" },
  { href: "/relatorios/obras", rotulo: "Relatórios", icone: "▦" },
  { href: "/obras-privadas", rotulo: "Obras privadas", icone: "🏗" },
  { href: "/cadastros/orgaos", rotulo: "Órgãos", icone: "◈" },
  { href: "/cadastros/localidades", rotulo: "Localidades", icone: "⌖" },
  { href: "/cadastros/usuarios", rotulo: "Usuários", icone: "⚇" },
  { href: "/cadastros/fontes", rotulo: "Fontes", icone: "＄" },
  { href: "/cadastros/empresas-contratadas", rotulo: "Empresas", icone: "▣" },
  { href: "/admin/tenants", rotulo: "Tenants", icone: "⬚" },
];

/**
 * Menu do modulo Obras Privadas (referencia Claude Design). Dentro do modulo a
 * sidebar e SUBSTITUIDA, nao acrescida: as duas areas tem fluxos distintos e um
 * menu unico com ~18 itens tornaria as duas dificeis de navegar. O ultimo item
 * devolve o usuario ao lado publico — sem ele nao haveria saida visivel.
 */
export const MENU_PRIVADAS: ItemMenu[] = [
  { href: "/obras-privadas", rotulo: "Obras privadas", icone: "▤" },
  { href: "/obras-privadas/nova", rotulo: "Nova obra privada", icone: "＋" },
  { href: "/obras-privadas/mapa", rotulo: "Mapa da cidade", icone: "⌖" },
  {
    href: "/obras-privadas/fiscalizacoes",
    rotulo: "Fiscalizações",
    icone: "🔎",
  },
  {
    href: "/obras-privadas/licenciamento",
    rotulo: "Alvarás e habite-se",
    icone: "◈",
  },
  { href: "/obras-privadas/autos", rotulo: "Autos e notificações", icone: "⚑" },
  { href: "/cadastros/pessoas", rotulo: "Pessoas", icone: "⚇" },
  { href: "/obras", rotulo: "‹ Obras públicas", icone: "↩" },
];

/** Subrotas do modulo privado que tem item PROPRIO no menu. */
const SUBROTAS_PRIVADAS_FIXAS = [
  "/obras-privadas/nova",
  "/obras-privadas/mapa",
  "/obras-privadas/fiscalizacoes",
  "/obras-privadas/licenciamento",
  "/obras-privadas/autos",
];

/**
 * A rota pertence ao modulo de obras privadas. Governa tres coisas de uma vez:
 * qual menu exibir, a marca da sidebar e o acento teal (`data-modulo`).
 *
 * `/cadastros/pessoas` entra porque o cadastro de proprietarios so existe para
 * servir a este modulo, mesmo morando sob /cadastros.
 */
export function ehRotaPrivada(pathname: string): boolean {
  return (
    pathname === "/obras-privadas" ||
    pathname.startsWith("/obras-privadas/") ||
    pathname === "/cadastros/pessoas" ||
    pathname.startsWith("/cadastros/pessoas/")
  );
}

/** Menu correspondente a rota atual. */
export function menuDaRota(pathname: string): ItemMenu[] {
  return ehRotaPrivada(pathname) ? MENU_PRIVADAS : MENU;
}

/** Marca exibida no topo da sidebar. */
export function marcaDaRota(pathname: string): {
  titulo: string;
  subtitulo: string | null;
} {
  return ehRotaPrivada(pathname)
    ? { titulo: "Obras Privadas", subtitulo: "Fiscalização de terceiros" }
    : { titulo: "Obras Públicas", subtitulo: null };
}

/**
 * Item ativo do menu.
 *
 * As rotas de criacao valem apenas na correspondencia exata; as listagens
 * cobrem seus detalhes por prefixo. No menu privado, `/obras` e o link de
 * VOLTA e nunca deve acender enquanto se navega no privado — sem essa excecao,
 * os dois itens ficariam ativos ao mesmo tempo.
 */
export function ehAtivo(pathname: string, href: string): boolean {
  if (href === "/obras/nova") return pathname === "/obras/nova";
  if (href === "/obras-privadas/nova") {
    return pathname === "/obras-privadas/nova";
  }
  if (href === "/obras-privadas") {
    if (pathname === "/obras-privadas") return true;
    if (
      SUBROTAS_PRIVADAS_FIXAS.some(
        (f) => pathname === f || pathname.startsWith(`${f}/`),
      )
    ) {
      return false;
    }
    // Sobra o detalhe da obra (/obras-privadas/<uuid>/...).
    return pathname.startsWith("/obras-privadas/");
  }
  if (href === "/obras") {
    if (ehRotaPrivada(pathname)) return false;
    if (pathname === "/obras/nova") return false;
    return pathname === "/obras" || pathname.startsWith("/obras/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
