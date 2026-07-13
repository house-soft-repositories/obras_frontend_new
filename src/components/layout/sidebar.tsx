"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { limparCacheMe, papelPrincipal, type MeResposta } from "@/lib/api/me";
import { iniciais } from "@/lib/ui/obra-labels";
import styles from "./app-shell.module.css";

export interface ItemMenu {
  href: string;
  rotulo: string;
  icone: string;
}

/**
 * Menu de navegacao plano (sem grupos), na ordem da referencia visual
 * "Obras Publicas" (Claude Design), com todas as funcionalidades globais.
 */
export const MENU: ItemMenu[] = [
  { href: "/home", rotulo: "Home", icone: "⌂" },
  { href: "/obras", rotulo: "Obras", icone: "▤" },
  { href: "/obras/nova", rotulo: "Nova obra", icone: "＋" },
  { href: "/dashboard", rotulo: "Dashboard", icone: "◧" },
  { href: "/relatorios/obras", rotulo: "Relatórios", icone: "▦" },
  { href: "/cadastros/orgaos", rotulo: "Órgãos", icone: "◈" },
  { href: "/cadastros/localidades", rotulo: "Localidades", icone: "⌖" },
  { href: "/cadastros/usuarios", rotulo: "Usuários", icone: "⚇" },
  { href: "/cadastros/fontes", rotulo: "Fontes", icone: "＄" },
  { href: "/cadastros/empresas-contratadas", rotulo: "Empresas", icone: "▣" },
  { href: "/admin/tenants", rotulo: "Tenants", icone: "⬚" },
];

/**
 * Item ativo: "Nova obra" apenas na rota exata; "Obras" cobre a listagem e o
 * detalhe (/obras/[id]/*) mas nao /obras/nova; os demais casam por prefixo.
 */
export function ehAtivo(pathname: string, href: string): boolean {
  if (href === "/obras/nova") return pathname === "/obras/nova";
  if (href === "/obras") {
    if (pathname === "/obras/nova") return false;
    return pathname === "/obras" || pathname.startsWith("/obras/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface Props {
  mobileAberto?: boolean;
  aoNavegar?: () => void;
  /** Dados do /auth/me carregados pelo AppShell (null enquanto carrega). */
  me?: MeResposta | null;
}

export function Sidebar({ mobileAberto, aoNavegar, me }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    limparCacheMe();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={`${styles.sidebar} ${mobileAberto ? styles.sidebarAberta : ""}`}
    >
      <div className={styles.brand}>
        <span className={styles.brandLogo}>OP</span>
        <p className={styles.brandTitulo}>Obras Públicas</p>
      </div>

      <ul className={styles.nav}>
        {MENU.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={aoNavegar}
              className={`${styles.link} ${
                ehAtivo(pathname, item.href) ? styles.linkAtivo : ""
              }`}
            >
              <span className={styles.icone} aria-hidden>
                {item.icone}
              </span>
              {item.rotulo}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.rodape}>
        <div className={styles.usuario}>
          <span className={styles.avatar} aria-hidden>
            {me ? iniciais(me.nome) : ""}
          </span>
          <div style={{ minWidth: 0 }}>
            <div className={styles.usuarioNome}>{me ? me.nome : "…"}</div>
            <div className={styles.usuarioPapel}>
              {me ? papelPrincipal(me.perfis) : "…"}
            </div>
          </div>
        </div>
        <button type="button" className={styles.sair} onClick={sair}>
          Sair
        </button>
      </div>
    </aside>
  );
}
