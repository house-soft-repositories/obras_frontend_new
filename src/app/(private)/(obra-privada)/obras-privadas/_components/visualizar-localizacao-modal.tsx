"use client";

import { MapPinned } from "lucide-react";
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
};

export function VisualizarLocalizacaoModal({
  latitude,
  longitude,
  endereco,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const lat = coordenada(latitude);
  const lng = coordenada(longitude);

  useEffect(() => {
    if (!open || lat === null || lng === null || !ref.current) return;

    let mapa: import("leaflet").Map | null = null;
    let cancelado = false;

    void (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelado || !ref.current) return;

      mapa = L.map(ref.current).setView([lat, lng], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(mapa);
      L.marker([lat, lng])
        .addTo(mapa)
        .bindPopup(endereco || "Localização da obra")
        .openPopup();
      window.setTimeout(() => mapa?.invalidateSize(), 0);
    })();

    return () => {
      cancelado = true;
      if (mapa) mapa.remove();
    };
  }, [endereco, lat, lng, open]);

  if (lat === null || lng === null) return null;

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Button
        aria-label="Visualizar localização no mapa"
        size="iconSm"
        variant="secondary"
        type="button"
        onClick={() => setOpen(true)}
        title="Visualizar localização no mapa"
      >
        <MapPinned aria-hidden="true" />
      </Button>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-3xl p-5 sm:p-7">
          <Modal.Header>
            <Modal.Title>Localização da obra</Modal.Title>
            <Modal.Description>
              {endereco || "Confira a posição informada para a obra."}
            </Modal.Description>
          </Modal.Header>
          <Modal.CloseIcon />
          <div
            ref={ref}
            className="h-[420px] w-full overflow-hidden rounded-app border border-border"
            role="application"
            aria-label="Mapa da localização da obra"
          />
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
