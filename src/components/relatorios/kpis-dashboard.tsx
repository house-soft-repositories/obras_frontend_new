"use client";

import type { ContagemPorStatus } from "@/lib/api/relatorios";
import { montarKpisDashboard } from "@/lib/api/relatorios-dashboard";

/**
 * Fileira de cartoes de KPI do Dashboard: total de obras, em desenvolvimento,
 * concluidas e paralisadas (montados pela logica pura montarKpisDashboard).
 */
export function KpisDashboard({
  contagem,
  numeroOrgaos,
}: {
  contagem: ContagemPorStatus;
  numeroOrgaos: number;
}) {
  const kpis = montarKpisDashboard(contagem, numeroOrgaos);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 12,
      }}
    >
      {kpis.map((k) => (
        <div
          key={k.label}
          style={{
            background: "#fff",
            border: "1px solid #e2e5ea",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              aria-hidden
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                background: k.cor,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12.5, color: "#6b7280" }}>{k.label}</span>
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 30,
              fontWeight: 700,
              lineHeight: 1.15,
              color: "#1f2933",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {k.valor}
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: "#6b7280" }}>
            {k.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
