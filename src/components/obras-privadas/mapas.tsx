"use client";

import { useEffect, useRef } from "react";
import type { ItemListaObraPrivada } from "@/lib/api/obras-privadas";
import {
  corPinoMapa,
  LEGENDA_MAPA,
  rotuloEtapa,
} from "@/lib/ui/obra-privada-labels";
import { mascararDocumento } from "@/lib/ui/documento";
import styles from "./privadas.module.css";

/** Centro aproximado do Brasil, usado quando nao ha ponto para enquadrar. */
const CENTRO_PADRAO: [number, number] = [-15.78, -47.93];

/**
 * Mapa da cidade: um pino por obra privada, colorido pela SITUACAO DO ALVARA —
 * e a informacao que decide a fiscalizacao, entao e ela que entra na cor.
 * Leaflet e carregado por dynamic import dentro do efeito (sem SSR), igual ao
 * mapa de obras publicas.
 */
export function MapaObrasPrivadas({ obras }: { obras: ItemListaObraPrivada[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mapa: import("leaflet").Map | null = null;
    let cancelado = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelado || !ref.current) return;

      mapa = L.map(ref.current).setView(CENTRO_PADRAO, 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapa);

      const pontos: [number, number][] = [];
      for (const o of obras) {
        if (!o.latitude || !o.longitude) continue;
        const lat = Number(o.latitude);
        const lng = Number(o.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        pontos.push([lat, lng]);

        const cor = corPinoMapa(o.situacaoAlvara);
        const endereco = [o.logradouro, o.numero].filter(Boolean).join(", ");
        L.circleMarker([lat, lng], {
          radius: 9,
          color: cor,
          fillColor: cor,
          fillOpacity: 0.85,
          weight: 2,
        })
          .addTo(mapa)
          .bindPopup(
            `<div style="min-width:190px">` +
              `<div style="font-size:11px;color:#9ca3af;font-weight:600">${o.codigo}</div>` +
              `<div style="font-size:13px;font-weight:600;margin-top:3px">${endereco}</div>` +
              `<div style="font-size:12px;color:#6b7280;margin-top:4px">${o.proprietarioNome}<br/>${mascararDocumento(o.proprietarioDocumento)}</div>` +
              `<div style="font-size:12px;color:#4b5563;margin-top:6px">Etapa: ${rotuloEtapa(o.etapaAtual)}</div>` +
              `<a style="display:inline-block;margin-top:8px;color:#0f766e;font-weight:600" href="/obras-privadas/${o.id}">Abrir obra</a>` +
              `</div>`,
          );
      }
      if (pontos.length > 0) mapa.fitBounds(pontos, { padding: [40, 40] });
    })();

    return () => {
      cancelado = true;
      if (mapa) mapa.remove();
    };
  }, [obras]);

  return (
    <div className={styles.card} style={{ marginTop: "0.9rem" }}>
      <div ref={ref} className={styles.mapa} />
      <div className={styles.legenda}>
        {LEGENDA_MAPA.map((l) => (
          <span key={l.rotulo} className={styles.legendaItem}>
            <span
              className={styles.legendaPonto}
              style={{ background: l.cor }}
              aria-hidden
            />
            {l.rotulo}
          </span>
        ))}
      </div>
    </div>
  );
}

interface PropsPonto {
  latitude: string | null;
  longitude: string | null;
  aoMover: (lat: string, lng: string) => void;
}

/**
 * Mapa do formulario com pino arrastavel. O fiscal ajusta a posicao exata da
 * obra, que raramente coincide com o centroide do CEP — em obra clandestina,
 * sem inscricao imobiliaria, essa coordenada e a unica identificacao confiavel
 * do lote.
 */
export function MapaPonto({ latitude, longitude, aoMover }: PropsPonto) {
  const ref = useRef<HTMLDivElement>(null);
  const marcadorRef = useRef<import("leaflet").Marker | null>(null);
  const mapaRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelado || !ref.current || mapaRef.current) return;

      const inicial: [number, number] =
        latitude && longitude
          ? [Number(latitude), Number(longitude)]
          : CENTRO_PADRAO;
      const zoom = latitude && longitude ? 17 : 4;

      const mapa = L.map(ref.current).setView(inicial, zoom);
      mapaRef.current = mapa;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapa);

      const marcador = L.circleMarker(inicial, {
        radius: 10,
        color: "#0f766e",
        fillColor: "#0f766e",
        fillOpacity: 0.85,
        weight: 3,
      }).addTo(mapa) as unknown as import("leaflet").Marker;
      marcadorRef.current = marcador;

      // Clicar no mapa reposiciona o pino: mais rapido em campo do que
      // arrastar num toque de celular.
      mapa.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        const lat = e.latlng.lat.toFixed(7);
        const lng = e.latlng.lng.toFixed(7);
        (marcador as unknown as import("leaflet").CircleMarker).setLatLng(
          e.latlng,
        );
        aoMover(lat, lng);
      });
    })();

    return () => {
      cancelado = true;
      if (mapaRef.current) {
        mapaRef.current.remove();
        mapaRef.current = null;
      }
    };
    // Monta uma unica vez: as atualizacoes de coordenada vem pelo efeito abaixo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reflete no mapa a coordenada vinda de fora (CEP ou "usar minha localizacao").
  useEffect(() => {
    if (!mapaRef.current || !marcadorRef.current) return;
    if (!latitude || !longitude) return;
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    (marcadorRef.current as unknown as import("leaflet").CircleMarker).setLatLng(
      [lat, lng],
    );
    mapaRef.current.setView([lat, lng], 17);
  }, [latitude, longitude]);

  return <div ref={ref} className={styles.mapaPequeno} />;
}
