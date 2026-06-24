"use client";

import { RefObject } from "react";
import {
  exportarGrafico,
  type FormatoGrafico,
} from "@/lib/graficos/exportar-grafico";

const FORMATOS: FormatoGrafico[] = ["PNG", "JPEG", "SVG"];

/** Botoes de download do grafico em PNG/JPEG/SVG (RN-REL-16). */
export function BotoesDownloadGrafico({
  alvoRef,
  nome,
}: {
  alvoRef: RefObject<HTMLDivElement | null>;
  nome: string;
}) {
  async function baixar(formato: FormatoGrafico) {
    const svg = alvoRef.current?.querySelector("svg");
    if (svg) await exportarGrafico(svg as SVGSVGElement, formato, nome);
  }
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {FORMATOS.map((f) => (
        <button key={f} type="button" onClick={() => baixar(f)} style={{ fontSize: 11 }}>
          {f}
        </button>
      ))}
    </div>
  );
}
