"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, LayoutList } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import type { ModoExibicaoObras } from "@/core/schemas/relatorios/obras_relatorio_schema";

/** Alterna entre lista e calendário preservando filtros e paginação na URL. */
export function ModoExibicaoToggle({ modo }: { modo: ModoExibicaoObras }) {
  const router = useRouter();

  function irPara(destino: ModoExibicaoObras) {
    const usp = new URLSearchParams(window.location.search);
    if (destino === "lista") usp.delete("modo");
    else usp.set("modo", destino);
    const qs = usp.toString();
    router.push(`/relatorios/obras${qs ? `?${qs}` : ""}`);
  }

  return (
    <div
      role="group"
      aria-label="Modo de exibição do relatório"
      className="flex flex-wrap items-center gap-2"
    >
      <Button
        type="button"
        variant={modo === "lista" ? "primary" : "secondary"}
        aria-pressed={modo === "lista"}
        onClick={() => irPara("lista")}
      >
        <LayoutList aria-hidden="true" />
        Lista
      </Button>
      <Button
        type="button"
        variant={modo === "calendario" ? "primary" : "secondary"}
        aria-pressed={modo === "calendario"}
        onClick={() => irPara("calendario")}
      >
        <CalendarDays aria-hidden="true" />
        Calendário
      </Button>
    </div>
  );
}
