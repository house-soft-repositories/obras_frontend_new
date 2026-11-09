"use client";

import { Check, MapPinned } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/core/ui/atoms/button";
import { Modal } from "@/core/ui/molecules/modal";

function coordenada(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

type Props = {
  latitude: string;
  longitude: string;
  endereco?: string;
  onSelect?: (coordinates: { latitude: string; longitude: string }) => void;
};

export function VisualizarLocalizacaoModal({
  latitude,
  longitude,
  endereco,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{
    latitude: string;
    longitude: string;
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const lat = coordenada(latitude);
  const lng = coordenada(longitude);
  const selectedLat = selected ? Number(selected.latitude) : (lat ?? -15.78);
  const selectedLng = selected ? Number(selected.longitude) : (lng ?? -47.93);

  useEffect(() => {
    if (!open || !ref.current) return;

    let mapa: import("leaflet").Map | null = null;
    let cancelado = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelado || !ref.current) return;

      L.Icon.Default.mergeOptions({
        iconUrl: "/marker-icon.png",
        iconRetinaUrl: "/marker-icon-2x.png",
        shadowUrl: "/marker-shadow.png",
      });
      mapa = L.map(ref.current).setView([selectedLat, selectedLng], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapa);
      const marcador = L.marker([selectedLat, selectedLng])
        .addTo(mapa)
        .bindPopup(endereco || "Localização da obra")
        .openPopup();
      mapa.on("click", (event) => {
        const next = {
          latitude: event.latlng.lat.toFixed(6),
          longitude: event.latlng.lng.toFixed(6),
        };
        setSelected(next);
        marcador.setLatLng(event.latlng);
        marcador.bindPopup("Nova localização selecionada").openPopup();
      });
      window.setTimeout(() => mapa?.invalidateSize(), 0);
    })();

    return () => {
      cancelado = true;
      if (mapa) mapa.remove();
    };
  }, [endereco, lat, lng, open, selectedLat, selectedLng]);

  function confirmarSelecao() {
    if (!selected || !onSelect) return;
    onSelect(selected);
    setOpen(false);
  }

  if (!onSelect && (lat === null || lng === null)) return null;

  return (
    <Modal.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setSelected(null);
      }}
    >
      <Button
        aria-label="Visualizar localização no mapa"
        size={onSelect ? "sm" : "iconSm"}
        variant="secondary"
        type="button"
        onClick={() => setOpen(true)}
        title="Visualizar localização no mapa"
      >
        <MapPinned aria-hidden="true" />
        {onSelect ? "Escolher no mapa" : null}
      </Button>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-3xl p-5 sm:p-7">
          <Modal.Header>
            <Modal.Title>Localização da obra</Modal.Title>
            <Modal.Description>
              {onSelect
                ? "Clique no mapa para posicionar a obra."
                : endereco || "Confira a posição informada para a obra."}
            </Modal.Description>
          </Modal.Header>
          <Modal.CloseIcon />
          <div
            ref={ref}
            className="h-[420px] w-full overflow-hidden rounded-app border border-border"
            role="application"
            aria-label="Mapa da localização da obra"
          />
          {onSelect ? (
            <Modal.Footer>
              <Button
                type="button"
                disabled={!selected}
                onClick={confirmarSelecao}
              >
                <Check className="size-4" /> Confirmar localização
              </Button>
            </Modal.Footer>
          ) : null}
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
