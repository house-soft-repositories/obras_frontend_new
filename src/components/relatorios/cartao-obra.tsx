"use client";

import Link from "next/link";
import { corSemaforo, type ItemListaObras } from "@/lib/api/relatorios";

/** Cartao de obra (modo CARTAO) com a cor do semaforo e o percentual realizado. */
export function CartaoObra({ obra }: { obra: ItemListaObras }) {
  return (
    <div
      data-testid="cartao-obra"
      style={{
        border: "1px solid #e5e7eb",
        borderLeft: `6px solid ${corSemaforo(obra.semaforo)}`,
        borderRadius: 8,
        padding: 12,
        width: 280,
      }}
    >
      <Link href={`/obras/${obra.obraId}/editar`} style={{ fontWeight: 600 }}>
        {obra.nome}
      </Link>
      <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
        {obra.statusObra} · {obra.percentualRealizado}%
      </div>
      <div style={{ fontSize: 12, color: "#555" }}>
        {obra.estagioAtualNome ?? "—"}
        {obra.prazoConclusaoEstagio ? ` (prazo ${obra.prazoConclusaoEstagio})` : ""}
      </div>
      <div style={{ fontSize: 12, color: "#777" }}>
        {obra.localidadeNome ?? ""} {obra.numeroContrato ? `· ${obra.numeroContrato}` : ""}
      </div>
    </div>
  );
}
