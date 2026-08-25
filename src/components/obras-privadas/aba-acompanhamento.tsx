"use client";

import { useEffect, useState } from "react";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import {
  carregarEtapas,
  carregarTimeline,
  criarObservacao,
  type EtapaComData,
  type EventoTimeline,
} from "@/lib/api/obras-privadas";
import { StepperEtapas, Timeline } from "./acompanhamento";
import { useObraPrivada } from "./detalhe-shell";
import styles from "./privadas.module.css";

/**
 * Aba Acompanhamento: stepper de etapas + linha do tempo.
 *
 * NAO ha percentual de execucao nem curva de avanco (decisao 10): em obra de
 * terceiro a prefeitura so conhece a etapa que o fiscal observou. Todo o
 * conteudo desta aba e derivado — nao existe nada aqui que alguem digite
 * diretamente, exceto a observacao livre.
 */
export function AbaAcompanhamento() {
  const { detalhe } = useObraPrivada();
  const obraId = detalhe?.obra.id;

  const [etapas, setEtapas] = useState<EtapaComData[]>([]);
  const [eventos, setEventos] = useState<EventoTimeline[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [texto, setTexto] = useState("");
  const [escrevendo, setEscrevendo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!obraId) return;
    let vivo = true;
    Promise.all([carregarEtapas(obraId), carregarTimeline(obraId)])
      .then(([e, t]) => {
        if (!vivo) return;
        setEtapas(e);
        setEventos(t);
        setErro(null);
      })
      .catch((e) => {
        if (vivo) setErro(mensagemErro(e));
      });
    return () => {
      vivo = false;
    };
  }, [obraId, versao]);

  async function salvarObservacao() {
    if (!obraId || !texto.trim()) return;
    setSalvando(true);
    try {
      await criarObservacao(obraId, texto.trim());
      setTexto("");
      setEscrevendo(false);
      setVersao((v) => v + 1);
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvando(false);
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

      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo} style={{ marginBottom: 0 }}>
          Etapa da obra
        </p>
        <p className={styles.cardSub} style={{ margin: "0.25rem 0 1rem" }}>
          Etapa constatada na última fiscalização de campo.
        </p>
        <StepperEtapas etapas={etapas} />
      </div>

      <div className={styles.cardSecao}>
        <div className={styles.cabecalho} style={{ marginBottom: "1rem" }}>
          <p className={styles.cardTitulo} style={{ marginBottom: 0 }}>
            Linha do tempo
          </p>
          <button
            type="button"
            className="btn-primario"
            style={{ marginLeft: "auto" }}
            onClick={() => setEscrevendo((v) => !v)}
          >
            ＋ Nova observação
          </button>
        </div>

        {escrevendo ? (
          <div className={styles.blocoInline} style={{ marginBottom: "1rem" }}>
            <label className={styles.rotuloForm}>Observação</label>
            <textarea
              rows={3}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ex.: comunicação de início de obra protocolada no balcão."
            />
            <div
              style={{
                display: "flex",
                gap: "0.55rem",
                justifyContent: "flex-end",
                marginTop: "0.7rem",
              }}
            >
              <button
                type="button"
                className="btn-secundario"
                onClick={() => {
                  setEscrevendo(false);
                  setTexto("");
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primario"
                onClick={() => void salvarObservacao()}
                disabled={salvando || !texto.trim()}
              >
                {salvando ? "Salvando…" : "Salvar observação"}
              </button>
            </div>
          </div>
        ) : null}

        <Timeline obraId={obraId} eventos={eventos} />
      </div>
    </>
  );
}
