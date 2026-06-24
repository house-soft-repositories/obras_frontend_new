"use client";

import { useState } from "react";
import styles from "./app-shell.module.css";
import { Sidebar } from "./sidebar";

/**
 * App-shell das rotas autenticadas: sidebar fixa (drawer no mobile) + topbar +
 * area de conteudo. Baseado na referencia "Obras Publicas" (Claude Design).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);

  return (
    <div className={styles.shell}>
      <Sidebar mobileAberto={drawer} aoNavegar={() => setDrawer(false)} />

      {drawer ? (
        <div
          className={styles.overlayAtivo}
          onClick={() => setDrawer(false)}
          aria-hidden
        />
      ) : null}

      <div className={styles.main}>
        <div className={styles.topbar}>
          <button
            type="button"
            className={styles.hamburguer}
            aria-label="Abrir menu"
            onClick={() => setDrawer(true)}
          >
            ☰
          </button>
          <span className={styles.topbarTitulo}>Painel de obras</span>
          <div className={styles.busca}>
            <span aria-hidden>🔍</span>
            <input
              className={styles.buscaInput}
              placeholder="Buscar obra, codigo…"
              aria-label="Buscar"
            />
          </div>
          <span className={styles.topbarAvatar} aria-hidden>
            OP
          </span>
        </div>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
