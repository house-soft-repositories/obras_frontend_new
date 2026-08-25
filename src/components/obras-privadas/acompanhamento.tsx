"use client";

import Link from "next/link";
import type { EtapaComData, EventoTimeline } from "@/lib/api/obras-privadas";
import {
  estiloEventoTimeline,
  rotuloEtapa,
} from "@/lib/ui/obra-privada-labels";
import { formatarDataCurta, formatarDataHora } from "@/lib/ui/prazo";
import styles from "./privadas.module.css";

/**
 * Stepper das etapas da obra. A etapa e a UNICA medida de avanco fisico do
 * modulo: nao ha percentual, porque em obra de terceiro a prefeitura so conhece
 * o que o fiscal observou na visita — e a data sob cada passo deixa isso
 * explicito.
 */
export function StepperEtapas({ etapas }: { etapas: EtapaComData[] }) {
  return (
    <div className={styles.stepper}>
      {etapas.map((e, i) => {
        const bolha = e.atual
          ? styles.passoBolhaAtual
          : e.concluida
            ? styles.passoBolhaConcluida
            : styles.passoBolha;
        const rotulo = e.atual
          ? styles.passoRotuloAtual
          : e.concluida
            ? styles.passoRotuloConcluido
            : styles.passoRotulo;
        return (
          <div key={e.etapa} className={styles.passo}>
            <div className={bolha} aria-hidden>
              {e.concluida ? "✓" : e.atual ? "●" : i + 1}
            </div>
            <div className={rotulo}>{rotuloEtapa(e.etapa)}</div>
            <div className={styles.passoData}>
              {e.data ? formatarDataCurta(e.data) : "—"}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Rota do registro de origem de cada evento, para o link "ver ...". */
function destinoEvento(obraId: string, evento: EventoTimeline): string {
  switch (evento.tipo) {
    case "ALVARA":
    case "HABITE_SE":
      return `/obras-privadas/${obraId}/licenciamento`;
    case "OBSERVACAO":
      return `/obras-privadas/${obraId}/acompanhamento`;
    default:
      return `/obras-privadas/${obraId}/fiscalizacoes`;
  }
}

/**
 * Linha do tempo derivada (decisao 10). Nao existe tabela de timeline: os
 * eventos vem dos registros reais (alvara, visita, auto, habite-se,
 * observacao), o que garante que ela nunca discorde do historico.
 */
export function Timeline({
  obraId,
  eventos,
}: {
  obraId: string;
  eventos: EventoTimeline[];
}) {
  if (eventos.length === 0) {
    return (
      <div className={styles.vazio}>
        <div className={styles.vazioIcone} aria-hidden>
          🕓
        </div>
        <p className={styles.vazioTitulo}>Nada registrado ainda</p>
        <p className={styles.vazioTexto}>
          Alvarás, fiscalizações, autos e habite-se aparecem aqui
          automaticamente.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.timeline}>
      {eventos.map((evento, i) => {
        const estilo = estiloEventoTimeline(evento.tipo);
        const ultimo = i === eventos.length - 1;
        return (
          <div key={`${evento.registroId}-${i}`} className={styles.eventoLinha}>
            <div className={styles.eventoTrilho}>
              <div
                className={styles.eventoIcone}
                style={{ background: estilo.fundo, color: estilo.cor }}
                aria-hidden
              >
                {estilo.icone}
              </div>
              {!ultimo ? <div className={styles.eventoConector} /> : null}
            </div>
            <div className={styles.eventoCorpo}>
              <div className={styles.eventoData}>
                {formatarDataHora(evento.data)}
              </div>
              <div
                className={styles.eventoTitulo}
                style={
                  evento.tipo === "EMBARGO"
                    ? { color: "var(--cor-perigo-forte, #7f1d1d)" }
                    : undefined
                }
              >
                {evento.titulo}
              </div>
              <p className={styles.eventoResumo}>{evento.resumo}</p>
              <Link
                href={destinoEvento(obraId, evento)}
                className={styles.botaoLink}
              >
                Ver registro
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
