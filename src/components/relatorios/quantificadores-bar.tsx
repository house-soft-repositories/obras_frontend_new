"use client";

import type { QuantificadoresObras } from "@/lib/api/relatorios";

/** Barra com os 4 quantificadores da lista (RN-REL-03), recalculados por filtro. */
export function QuantificadoresBar({ q }: { q: QuantificadoresObras | null }) {
  const cards = [
    { titulo: "Acima da meta", valor: q?.acimaMeta ?? 0, cor: "#16a34a" },
    { titulo: "Prazo vencido", valor: q?.prazoVencido ?? 0, cor: "#dc2626" },
    { titulo: "Abaixo da meta", valor: q?.abaixoMeta ?? 0, cor: "#f59e0b" },
    { titulo: "Sem status", valor: q?.semStatus ?? 0, cor: "#9ca3af" },
  ];
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {cards.map((c) => (
        <div
          key={c.titulo}
          style={{
            border: `1px solid ${c.cor}`,
            borderRadius: 8,
            padding: "8px 16px",
            minWidth: 120,
          }}
        >
          <div style={{ fontSize: 12, color: "#555" }}>{c.titulo}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: c.cor }}>
            {c.valor}
          </div>
        </div>
      ))}
      <div style={{ alignSelf: "center", color: "#777" }}>
        Total: {q?.totalObras ?? 0}
      </div>
    </div>
  );
}
