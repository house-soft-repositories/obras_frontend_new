"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type ArquivoPrivado,
  urlArquivo,
} from "@/lib/api/obras-privadas";
import { formatarDataCurta } from "@/lib/ui/prazo";
import styles from "./privadas.module.css";

/**
 * URLs pre-assinadas expiram em 15 minutos, entao sao resolvidas no mount da
 * aba e mantidas em memoria — nao ha como guardar no banco nem no cache do
 * navegador. Resolvemos em paralelo para nao serializar 20 requisicoes.
 */
export function useUrlsDeArquivos(arquivos: ArquivoPrivado[]) {
  const [urls, setUrls] = useState<Record<string, string>>({});

  const chaves = arquivos.map((a) => a.id).join(",");

  useEffect(() => {
    let vivo = true;
    // Lista vazia cai no Promise.all([]) e resolve para {} no `then`, em vez
    // de um setState sincrono aqui (react-hooks/set-state-in-effect).
    Promise.all(
      arquivos.map((a) =>
        urlArquivo(a.id)
          .then((r) => [a.id, r.url] as const)
          .catch(() => [a.id, ""] as const),
      ),
    ).then((pares) => {
      if (!vivo) return;
      setUrls(Object.fromEntries(pares.filter(([, u]) => u)));
    });
    return () => {
      vivo = false;
    };
    // `chaves` cobre a identidade da lista; `arquivos` muda de referencia a
    // cada render do pai e reiniciaria o efeito em loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chaves]);

  return urls;
}

interface PropsGaleria {
  arquivos: ArquivoPrivado[];
  urls: Record<string, string>;
  /** Ativa o modo de selecao para o relatorio fotografico. */
  selecionaveis?: boolean;
  selecionadas?: Set<string>;
  aoAlternarSelecao?: (id: string) => void;
}

/**
 * Grade de fotos com legenda, data e marcador de geolocalizacao. Primeira
 * exibicao de imagem do projeto — antes disso nao havia nenhuma tag `img` no
 * `src/`. Usamos `img` e nao `next/image` de proposito: a URL e pre-assinada,
 * efemera e de host externo, o que anula o pipeline de otimizacao do Next.
 */
export function GaleriaFotos({
  arquivos,
  urls,
  selecionaveis = false,
  selecionadas,
  aoAlternarSelecao,
}: PropsGaleria) {
  const [lightbox, setLightbox] = useState(-1);

  const fechar = useCallback(() => setLightbox(-1), []);
  const anterior = useCallback(
    () => setLightbox((i) => (i - 1 + arquivos.length) % arquivos.length),
    [arquivos.length],
  );
  const proxima = useCallback(
    () => setLightbox((i) => (i + 1) % arquivos.length),
    [arquivos.length],
  );

  // Teclado no lightbox: Esc fecha, setas navegam.
  useEffect(() => {
    if (lightbox < 0) return;
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") proxima();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [lightbox, fechar, anterior, proxima]);

  if (arquivos.length === 0) {
    return (
      <div className={styles.vazio}>
        <div className={styles.vazioIcone} aria-hidden>
          📷
        </div>
        <p className={styles.vazioTitulo}>Nenhuma foto enviada</p>
        <p className={styles.vazioTexto}>
          As fotos da fiscalização aparecem aqui e alimentam o relatório
          fotográfico.
        </p>
      </div>
    );
  }

  const atual = lightbox >= 0 ? arquivos[lightbox] : null;

  return (
    <>
      <div className={styles.gradeFotos}>
        {arquivos.map((a, i) => {
          const marcada = selecionadas?.has(a.id) ?? false;
          const url = urls[a.id];
          return (
            <div key={a.id}>
              <button
                type="button"
                className={
                  selecionaveis && marcada ? styles.fotoSelecionada : styles.foto
                }
                onClick={() =>
                  selecionaveis && aoAlternarSelecao
                    ? aoAlternarSelecao(a.id)
                    : setLightbox(i)
                }
                aria-label={
                  selecionaveis
                    ? `${marcada ? "Remover" : "Incluir"} ${a.nome} no relatório`
                    : `Abrir ${a.nome}`
                }
              >
                {url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={a.descricao ?? a.nome}
                    className={styles.fotoImagem}
                    loading="lazy"
                  />
                ) : null}
                {selecionaveis ? (
                  <span
                    className={
                      marcada ? styles.fotoCheckMarcado : styles.fotoCheck
                    }
                    aria-hidden
                  >
                    {marcada ? "✓" : ""}
                  </span>
                ) : null}
                {a.latitude && a.longitude ? (
                  <span className={styles.fotoGeo} aria-hidden>
                    ⌖ geo
                  </span>
                ) : null}
              </button>
              <p className={styles.fotoLegenda}>{a.descricao ?? a.nome}</p>
              <p className={styles.fotoData}>
                {formatarDataCurta(
                  (a.capturadoEm ?? a.criadoEm)?.slice(0, 10),
                )}
              </p>
            </div>
          );
        })}
      </div>

      {atual ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={atual.descricao ?? atual.nome}
        >
          <button
            type="button"
            className={styles.lightboxFechar}
            onClick={fechar}
            aria-label="Fechar"
          >
            ✕
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              className={styles.lightboxBotao}
              onClick={anterior}
              aria-label="Anterior"
            >
              ‹
            </button>
            {urls[atual.id] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urls[atual.id]}
                alt={atual.descricao ?? atual.nome}
                className={styles.lightboxImagem}
              />
            ) : null}
            <button
              type="button"
              className={styles.lightboxBotao}
              onClick={proxima}
              aria-label="Próxima"
            >
              ›
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: "1.1rem", maxWidth: 520 }}>
            <p className={styles.lightboxLegenda}>
              {atual.descricao ?? atual.nome}
            </p>
            <p className={styles.lightboxMeta}>
              {formatarDataCurta((atual.capturadoEm ?? atual.criadoEm)?.slice(0, 10))}
              {atual.latitude && atual.longitude
                ? ` · ⌖ ${atual.latitude} / ${atual.longitude}`
                : ""}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}
