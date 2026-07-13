"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { buscarMe, type MeResposta } from "@/lib/api/me";
import { iniciais } from "@/lib/ui/obra-labels";
import styles from "./app-shell.module.css";
import { Sidebar } from "./sidebar";

/**
 * Contexto leve com o /auth/me carregado uma unica vez pelo AppShell.
 * null enquanto carrega (ou sem sessao valida).
 */
const MeContext = createContext<MeResposta | null>(null);

/** Dados do usuario autenticado para paginas dentro do AppShell. */
export function useMe(): MeResposta | null {
  return useContext(MeContext);
}

/**
 * App-shell das rotas autenticadas: sidebar fixa (drawer no mobile) + topbar +
 * area de conteudo. Baseado na referencia "Obras Publicas" (Claude Design).
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  const [me, setMe] = useState<MeResposta | null>(null);

  useEffect(() => {
    let ativo = true;
    buscarMe()
      .then((resposta) => {
        if (ativo) setMe(resposta);
      })
      .catch(() => {
        // Sem sessao valida: o middleware/login cuidam do redirecionamento.
      });
    return () => {
      ativo = false;
    };
  }, []);

  const nomeTenant = me ? (me.tenant?.nome ?? "Plataforma") : "…";

  return (
    <MeContext.Provider value={me}>
      <div className={styles.shell}>
        <Sidebar
          mobileAberto={drawer}
          aoNavegar={() => setDrawer(false)}
          me={me}
        />

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
            <div className={styles.tenantBloco}>
              <span className={styles.tenantLabel}>Tenant</span>
              <span className={styles.tenantNome}>{nomeTenant}</span>
            </div>
            <div className={styles.busca}>
              <span aria-hidden>🔍</span>
              <input
                className={styles.buscaInput}
                placeholder="Buscar obra, código…"
                aria-label="Buscar"
              />
            </div>
            <span className={styles.topbarAvatar} aria-hidden>
              {me ? iniciais(me.nome) : ""}
            </span>
          </div>

          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </MeContext.Provider>
  );
}
