"use client";

import { useEffect, useRef } from "react";
import { corSemaforo, type ItemListaObras } from "@/lib/api/relatorios";

/**
 * Modo MAPA (RN-REL-13): um marcador por localizacao com coordenadas (uma obra
 * com N localidades gera N pontos; obras sem coordenadas nao aparecem). Leaflet
 * carregado por dynamic import (sem SSR) dentro do efeito.
 */
export function MapaObras({ obras }: { obras: ItemListaObras[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mapa: import("leaflet").Map | null = null;
    let cancelado = false;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelado || !ref.current) return;
      mapa = L.map(ref.current).setView([-5.09, -42.8], 6); // Piaui aprox.
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapa);

      const pontos: [number, number][] = [];
      for (const o of obras) {
        for (const loc of o.localizacoes) {
          if (loc.latitude == null || loc.longitude == null) continue;
          pontos.push([loc.latitude, loc.longitude]);
          L.circleMarker([loc.latitude, loc.longitude], {
            radius: 8,
            color: corSemaforo(o.semaforo),
            fillColor: corSemaforo(o.semaforo),
            fillOpacity: 0.8,
          })
            .addTo(mapa)
            .bindPopup(
              `<b>${o.nome}</b><br/>${o.statusObra} · ${o.percentualRealizado}%<br/>` +
                `${loc.localidade}/${loc.uf}<br/>` +
                `<a href="/obras/${o.obraId}/editar">abrir obra</a>`,
            );
        }
      }
      if (pontos.length > 0) mapa.fitBounds(pontos, { padding: [40, 40] });
    })();
    return () => {
      cancelado = true;
      if (mapa) mapa.remove();
    };
  }, [obras]);

  return (
    <div
      ref={ref}
      data-testid="mapa-obras"
      style={{ height: 480, width: "100%", borderRadius: 8, overflow: "hidden" }}
    />
  );
}
