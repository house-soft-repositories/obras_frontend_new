"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import {
  detalharObraPrivada,
  urlDossie,
  type ObraPrivadaDetalhe,
} from "@/lib/api/obras-privadas";
import { mascararDocumento } from "@/lib/ui/documento";
import { chipsDaObra, rotuloEtapa } from "@/lib/ui/obra-privada-labels";
import { formatarDataCurta, resumoUltimaVisita } from "@/lib/ui/prazo";
import styles from "./privadas.module.css";

/** Abas do detalhe, na ordem do design. */
export const ABAS = [
  { sufixo: "", rotulo: "Dados" },
  { sufixo: "/licenciamento", rotulo: "Licenciamento" },
  { sufixo: "/fiscalizacoes", rotulo: "Fiscalizações" },
  { sufixo: "/acompanhamento", rotulo: "Acompanhamento" },
  { sufixo: "/fotos", rotulo: "Fotos e arquivos" },
];

interface Contexto {
  detalhe: ObraPrivadaDetalhe | null;
  recarregar: () => void;
}

const DetalheContext = createContext<Contexto>({
  detalhe: null,
  recarregar: () => {},
});

/**
 * Dados da obra carregados uma unica vez pelo shell. As abas leem daqui em vez
 * de refazer a consulta: o cabecalho e as abas precisam exatamente do mesmo
 * objeto, e duas chamadas poderiam mostrar estados diferentes na mesma tela.
 */
export function useObraPrivada(): Contexto {
  return useContext(DetalheContext);
}

/** Qual aba esta ativa, a partir do pathname. */
export function abaAtiva(pathname: string, obraId: string): string {
  const base = `/obras-privadas/${obraId}`;
  const resto = pathname.slice(base.length);
  const encontrada = ABAS.find((a) => a.sufixo !== "" && resto.startsWith(a.sufixo));
  return encontrada?.sufixo ?? "";
}

export function DetalheObraPrivadaShell({
  obraId,
  children,
}: {
  obraId: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [detalhe, setDetalhe] = useState<ObraPrivadaDetalhe | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  useEffect(() => {
    let vivo = true;
    detalharObraPrivada(obraId)
      .then((d) => {
        if (vivo) {
          setDetalhe(d);
          setErro(null);
        }
      })
      .catch((e) => {
        if (vivo) setErro(mensagemErro(e));
      });
    return () => {
      vivo = false;
    };
  }, [obraId, versao]);

  const ativa = abaAtiva(pathname, obraId);
  const o = detalhe?.obra;
  const d = detalhe?.derivados;
  const visita = resumoUltimaVisita(d?.ultimaVisitaEm ?? null);

  return (
    <DetalheContext.Provider value={{ detalhe, recarregar }}>
      <main style={{ padding: "1.5rem 1.75rem" }}>
        <nav className={styles.trilha}>
          <Link href="/obras-privadas" className={styles.trilhaLink}>
            Obras privadas
          </Link>
          <span className={styles.trilhaSep}>›</span>
          <span className={styles.num}>{o?.codigo ?? "…"}</span>
        </nav>

        {erro ? (
          <div className={styles.faixaErro} role="alert" style={{ marginTop: "1rem" }}>
            <span aria-hidden>⛔</span>
            <div style={{ flex: 1 }}>
              <p className={styles.faixaErroTitulo}>
                Não foi possível carregar a obra
              </p>
              <p className={styles.faixaErroTexto}>{erro}</p>
            </div>
            <button
              type="button"
              className={styles.botaoFantasma}
              onClick={recarregar}
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        <div className={styles.cardDestaque}>
          <div className={styles.cabecalho}>
            <div style={{ minWidth: 0 }}>
              <div className={styles.codigo}>{o?.codigo ?? "…"}</div>
              <h1 className={styles.enderecoTitulo}>
                {o
                  ? `${[o.logradouro, o.numero].filter(Boolean).join(", ")}${o.bairro ? ` — ${o.bairro}` : ""}`
                  : "Carregando…"}
              </h1>
              <p className={styles.proprietarioLinha}>
                {detalhe?.proprietario
                  ? `${detalhe.proprietario.nome} · ${mascararDocumento(detalhe.proprietario.documento)}`
                  : "—"}
              </p>
            </div>
            {o ? (
              <a className={styles.botaoFantasma} href={urlDossie(o.id)}>
                ⤓ Dossiê (PDF)
              </a>
            ) : null}
          </div>

          {o && d ? (
            <>
              <div className={styles.chips}>
                {chipsDaObra({ ...o, ...d }).map((c, i) => (
                  <span key={i} className={`chip ${c.tom}`}>
                    {c.rotulo}
                  </span>
                ))}
              </div>

              <div className={styles.indicadores}>
                <div>
                  <div className="rotulo-campo">Etapa atual</div>
                  <div className={styles.indicadorValor}>
                    {rotuloEtapa(d.etapaAtual)}
                  </div>
                  <div className={styles.indicadorSub}>
                    {d.ultimaVisitaEm
                      ? `constatada em ${formatarDataCurta(d.ultimaVisitaEm)}`
                      : "sem visita registrada"}
                  </div>
                </div>
                <div>
                  <div className="rotulo-campo">Última visita</div>
                  <div
                    className={
                      visita.alerta
                        ? styles.indicadorValorAlerta
                        : styles.indicadorValor
                    }
                  >
                    {visita.rotulo}
                  </div>
                  <div className={styles.indicadorSub}>
                    {visita.dias === null
                      ? "nunca fiscalizada"
                      : `há ${visita.dias} dias`}
                  </div>
                </div>
                <div>
                  <div className="rotulo-campo">Autos abertos</div>
                  <div
                    className={
                      d.autosAbertos > 0
                        ? styles.indicadorValorAlerta
                        : styles.indicadorValor
                    }
                  >
                    {d.autosAbertos}
                  </div>
                  <div className={styles.indicadorSub}>
                    {d.embargada ? "obra embargada" : "sem embargo ativo"}
                  </div>
                </div>
                <div>
                  <div className="rotulo-campo">Alvará</div>
                  <div className={styles.indicadorValorAcento}>
                    {d.alvaraVigenteNumero ? `nº ${d.alvaraVigenteNumero}` : "—"}
                  </div>
                  <div className={styles.indicadorSub}>
                    {d.alvaraVigenteValidade
                      ? `válido até ${formatarDataCurta(d.alvaraVigenteValidade)}`
                      : "sem alvará vigente"}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <nav className={styles.abas}>
          {ABAS.map((a) => (
            <Link
              key={a.sufixo}
              href={`/obras-privadas/${obraId}${a.sufixo}`}
              className={ativa === a.sufixo ? styles.abaAtiva : styles.aba}
            >
              {a.rotulo}
            </Link>
          ))}
        </nav>

        {children}
      </main>
    </DetalheContext.Provider>
  );
}
