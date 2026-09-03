"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { limparCacheMe, papelPrincipal, type MeResposta } from "@/lib/api/me";
import { iniciais } from "@/lib/ui/obra-labels";
import { ehAtivo, marcaDaRota, menuDaRota } from "@/lib/ui/navegacao";
import styles from "./app-shell.module.css";

/*
 * Toda a logica pura de navegacao (menus, marca e item ativo) vive em
 * `lib/ui/navegacao.ts` para ser testavel no vitest, que roda em ambiente node
 * sem DOM. Aqui fica apenas o componente.
 */

interface Props {
  mobileAberto?: boolean;
  aoNavegar?: () => void;
  /** Dados do /auth/me carregados pelo AppShell (null enquanto carrega). */
  me?: MeResposta | null;
}

export function Sidebar({ mobileAberto, aoNavegar, me }: Props) {
  const pathname = usePathname() ?? "";
  const menu = menuDaRota(pathname);
  const marca = marcaDaRota(pathname);

  async function sair() {
    limparCacheMe();
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <aside
      className={`${styles.sidebar} ${mobileAberto ? styles.sidebarAberta : ""}`}
    >
      <div className={styles.brand}>
        <span className={styles.brandLogo}>OP</span>
        <div style={{ minWidth: 0 }}>
          <p className={styles.brandTitulo}>{marca.titulo}</p>
          {marca.subtitulo ? (
            <p className={styles.brandSub}>{marca.subtitulo}</p>
          ) : null}
        </div>
      </div>

      <ul className={styles.nav}>
        {menu.map((item) => (
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
