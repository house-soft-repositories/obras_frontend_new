"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./app-shell.module.css";

export interface ItemMenu {
  href: string;
  rotulo: string;
  icone: string;
}

export interface GrupoMenu {
  titulo: string;
  itens: ItemMenu[];
}

/** Menu de navegacao com todas as funcionalidades globais do sistema. */
export const MENU: GrupoMenu[] = [
  {
    titulo: "Geral",
    itens: [
      { href: "/home", rotulo: "Inicio", icone: "⌂" },
      { href: "/obras", rotulo: "Obras", icone: "▤" },
      { href: "/obras/nova", rotulo: "Nova obra", icone: "＋" },
      { href: "/dashboard", rotulo: "Dashboard", icone: "◧" },
      { href: "/relatorios/obras", rotulo: "Relatorios", icone: "▦" },
    ],
  },
  {
    titulo: "Cadastros",
    itens: [
      { href: "/cadastros/orgaos", rotulo: "Orgaos e setores", icone: "◈" },
      { href: "/cadastros/localidades", rotulo: "Localidades", icone: "⌖" },
      { href: "/cadastros/usuarios", rotulo: "Usuarios", icone: "⚇" },
      { href: "/cadastros/fontes", rotulo: "Fontes de recurso", icone: "＄" },
      {
        href: "/cadastros/empresas-contratadas",
        rotulo: "Empresas contratadas",
        icone: "▣",
      },
    ],
  },
  {
    titulo: "Administracao",
    itens: [{ href: "/admin/tenants", rotulo: "Tenants", icone: "⬚" }],
  },
];

function ehAtivo(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === "/home";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface Props {
  mobileAberto?: boolean;
  aoNavegar?: () => void;
}

export function Sidebar({ mobileAberto, aoNavegar }: Props) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  async function sair() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={`${styles.sidebar} ${mobileAberto ? styles.sidebarAberta : ""}`}
    >
      <div className={styles.brand}>
        <span className={styles.brandLogo}>OP</span>
        <p className={styles.brandTitulo}>Obras Publicas</p>
      </div>

      {MENU.map((grupo) => (
        <div key={grupo.titulo} className={styles.grupo}>
          <p className={styles.grupoTitulo}>{grupo.titulo}</p>
          <ul className={styles.nav}>
            {grupo.itens.map((item) => (
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
        </div>
      ))}

      <div>
        <div className={styles.usuario}>
          <span className={styles.avatar} aria-hidden>
            OP
          </span>
          <div style={{ minWidth: 0 }}>
            <div className={styles.usuarioNome}>Usuario</div>
            <div className={styles.usuarioPapel}>Acesso institucional</div>
          </div>
        </div>
        <button type="button" className={styles.sair} onClick={sair}>
          Sair
        </button>
      </div>
    </aside>
  );
}
