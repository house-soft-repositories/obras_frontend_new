"use client";

import { useEffect, useMemo, useState } from "react";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import {
  listarArquivos,
  urlArquivo,
  urlDossie,
  type ArquivoPrivado,
} from "@/lib/api/obras-privadas";
import { formatarTamanho } from "@/lib/ui/prazo";
import { useObraPrivada } from "./detalhe-shell";
import { GaleriaFotos, useUrlsDeArquivos } from "./galeria-fotos";
import { UploadArquivos } from "./upload-arquivos";
import styles from "./privadas.module.css";

const ROTULO_VINCULO: Record<string, string> = {
  OBRA: "Obra",
  FISCALIZACAO: "Fiscalização",
  ALVARA: "Alvará",
  HABITE_SE: "Habite-se",
  AUTO_INFRACAO: "Auto de infração",
  ART_RRT: "ART / RRT",
};

/**
 * Aba Fotos e arquivos: galeria com selecao para o relatorio fotografico,
 * upload e lista de documentos.
 *
 * A selecao existe porque o relatorio tem teto de 40 fotos e 25 MB
 * (RN-PRV-18) — sem escolher, uma obra com 200 fotos geraria um PDF inutil.
 */
export function AbaFotos() {
  const { detalhe } = useObraPrivada();
  const obraId = detalhe?.obra.id;

  const [arquivos, setArquivos] = useState<ArquivoPrivado[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!obraId) return;
    let vivo = true;
    listarArquivos(obraId)
      .then((lista) => {
        if (!vivo) return;
        setArquivos(lista);
        setErro(null);
      })
      .catch((e) => {
        if (vivo) setErro(mensagemErro(e));
      });
    return () => {
      vivo = false;
    };
  }, [obraId, versao]);

  const fotos = useMemo(
    () => arquivos.filter((a) => a.categoria === "FOTO"),
    [arquivos],
  );
  const documentos = useMemo(
    () => arquivos.filter((a) => a.categoria !== "FOTO"),
    [arquivos],
  );
  const urls = useUrlsDeArquivos(fotos);

  function alternar(id: string) {
    setSelecionadas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  async function baixar(id: string) {
    try {
      const { url } = await urlArquivo(id);
      window.open(url, "_blank");
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  if (!obraId) return null;

  return (
    <>
      {erro ? (
        <div className={styles.faixaErro} role="alert" style={{ marginTop: "1rem" }}>
          <span aria-hidden>⛔</span>
          <div>
            <p className={styles.faixaErroTexto}>{erro}</p>
          </div>
        </div>
      ) : null}

      <div className={styles.cabecalho} style={{ marginTop: "1rem" }}>
        <h2 className={styles.secaoTitulo}>Fotos</h2>
        <button
          type="button"
          className={modoSelecao ? styles.chipRapidoAtivo : styles.botaoFantasma}
          style={{ marginLeft: "auto", minHeight: 42 }}
          onClick={() => {
            setModoSelecao((v) => !v);
            setSelecionadas(new Set());
          }}
        >
          {modoSelecao
            ? "✓ Modo de seleção ativo"
            : "Selecionar fotos para o relatório"}
        </button>
        {modoSelecao ? (
          <a className="btn-primario" href={urlDossie(obraId)}>
            Gerar relatório fotográfico (PDF) · {selecionadas.size} selecionadas
          </a>
        ) : null}
      </div>

      <div className={styles.cardSecao}>
        <GaleriaFotos
          arquivos={fotos}
          urls={urls}
          selecionaveis={modoSelecao}
          selecionadas={selecionadas}
          aoAlternarSelecao={alternar}
        />
      </div>

      <div className={styles.cardSecao}>
        <UploadArquivos
          obraId={obraId}
          vinculo="OBRA"
          categoria="FOTO"
          destaque
          aoConcluir={() => setVersao((v) => v + 1)}
        />
      </div>

      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo}>Documentos</p>
        {documentos.length === 0 ? (
          <div className={styles.vazio}>
            <div className={styles.vazioIcone} aria-hidden>
              📄
            </div>
            <p className={styles.vazioTitulo}>Nenhum documento anexado</p>
            <p className={styles.vazioTexto}>
              Alvarás, ART/RRT e autos em PDF ficam aqui.
            </p>
          </div>
        ) : (
          <div className={styles.listaItens}>
            {documentos.map((d) => (
              <div key={d.id} className={styles.itemLista}>
                <span className={styles.badgePdf} aria-hidden>
                  {(d.nomeOriginal.split(".").pop() ?? "DOC")
                    .slice(0, 3)
                    .toUpperCase()}
                </span>
                <span style={{ minWidth: 0, flex: 1 }}>
                  <span className={styles.comboNome}>{d.nome}</span>
                  <span className={styles.comboDoc}>
                    {ROTULO_VINCULO[d.vinculo] ?? d.vinculo} ·{" "}
                    {formatarTamanho(d.tamanhoBytes)}
                  </span>
                </span>
                <button
                  type="button"
                  className={styles.botaoFantasma}
                  onClick={() => void baixar(d.id)}
                >
                  ⤓ Baixar
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          <UploadArquivos
            obraId={obraId}
            vinculo="OBRA"
            categoria="DOCUMENTO"
            titulo="Enviar documentos"
            ajuda="PDF · alvará, ART/RRT, autos e demais peças"
            aoConcluir={() => setVersao((v) => v + 1)}
          />
        </div>
      </div>
    </>
  );
}
