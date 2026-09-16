"use client";

import { useState } from "react";
import { Map, TableProperties } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import type { ObraPrivada } from "@/core/schemas/obras-privadas/obra_privada_schema";
import { MapaTable } from "../../_components/tabelas-simples";
import { MapaObrasPrivadas } from "../../_components/mapa-obras-privadas";

type Visao = "mapa" | "tabela";

export function MapaClient({ obras }: { obras: ObraPrivada[] }) {
  const [visao, setVisao] = useState<Visao>("mapa");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Obras privadas</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Mapa
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Obras privadas com coordenadas registradas para visualização no mapa
            da cidade.
          </p>
        </div>
        <div
          className="inline-flex rounded-app border border-border bg-surface p-1"
          role="group"
          aria-label="Alternar visualização"
        >
          <Button
            type="button"
            variant={visao === "mapa" ? "primary" : "ghost"}
            onClick={() => setVisao("mapa")}
            aria-pressed={visao === "mapa"}
          >
            <Map className="size-4" /> Mapa
          </Button>
          <Button
            type="button"
            variant={visao === "tabela" ? "primary" : "ghost"}
            onClick={() => setVisao("tabela")}
            aria-pressed={visao === "tabela"}
          >
            <TableProperties className="size-4" /> Tabela
          </Button>
        </div>
      </section>
      {visao === "mapa" ? (
        <MapaObrasPrivadas obras={obras} />
      ) : (
        <MapaTable data={obras} />
      )}
    </main>
  );
}
