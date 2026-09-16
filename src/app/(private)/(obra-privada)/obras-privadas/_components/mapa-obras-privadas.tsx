"use client";

import { useEffect, useRef } from "react";
import {
  SITUACAO_ALVARA_LABELS,
  type ObraPrivada,
} from "@/core/schemas/obras-privadas/obra_privada_schema";

const CENTRO_PADRAO: [number, number] = [-15.78, -47.93];

function corPino(situacaoAlvara: unknown) {
  switch (situacaoAlvara) {
    case "SEM_ALVARA":
      return "#dc2626";
    case "COM_ALVARA_VIGENTE":
      return "#15803d";
    case "COM_ALVARA_VENCIDO":
      return "#ca8a04";
    default:
      return "#9ca3af";
  }
}

const LEGENDA = [
  { rotulo: "Sem alvará", cor: "#dc2626" },
  { rotulo: "Alvará vigente", cor: "#15803d" },
  { rotulo: "Alvará vencido", cor: "#ca8a04" },
  { rotulo: "Dispensada / outro", cor: "#9ca3af" },
];

function escapar(value: unknown) {
  return String(value ?? "—").replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
      }
  });
}

export function MapaObrasPrivadas({ obras }: { obras: ObraPrivada[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mapa: import("leaflet").Map | null = null;
    let cancelado = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelado || !ref.current) return;

      mapa = L.map(ref.current).setView(CENTRO_PADRAO, 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapa);

      const pontos: [number, number][] = [];
      for (const obra of obras) {
        const raw = obra as Record<string, unknown>;
        if (typeof raw.latitude !== "string" || typeof raw.longitude !== "string") {
          continue;
        }
        const lat = Number(raw.latitude.replace(",", "."));
        const lng = Number(raw.longitude.replace(",", "."));
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        pontos.push([lat, lng]);

        const cor = corPino(obra.situacaoAlvara);
        const endereco = [obra.logradouro, obra.numero, obra.bairro]
          .filter((part) => typeof part === "string" && part.trim())
          .join(", ");
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
              `<div style="font-size:11px;color:#9ca3af;font-weight:600">${escapar(obra.codigo)}</div>` +
              `<div style="font-size:13px;font-weight:600;margin-top:3px">${escapar(obra.descricao)}</div>` +
              `<div style="font-size:12px;color:#6b7280;margin-top:4px">${escapar(endereco)}<br/>${escapar(SITUACAO_ALVARA_LABELS[typeof obra.situacaoAlvara === "string" ? obra.situacaoAlvara : ""] ?? obra.situacaoAlvara)}</div>` +
              `<a style="display:inline-block;margin-top:8px;color:#0f766e;font-weight:600" href="/obras-privadas/${escapar(obra.id)}">Abrir obra</a>` +
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
    <section className="overflow-hidden rounded-app border border-border bg-surface shadow-card">
      <div ref={ref} className="h-[480px] w-full" role="application" aria-label="Mapa das obras privadas" />
      <div className="flex flex-wrap gap-4 border-t border-border px-5 py-3 text-xs text-muted">
        {LEGENDA.map((item) => (
          <span key={item.rotulo} className="inline-flex items-center gap-2">
            <span
              className="inline-block size-3 rounded-full"
              style={{ background: item.cor }}
              aria-hidden="true"
            />
            {item.rotulo}
          </span>
        ))}
      </div>
    </section>
  );
}
