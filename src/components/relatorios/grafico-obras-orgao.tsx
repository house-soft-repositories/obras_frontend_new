"use client";

import { useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ObrasPorOrgaoItem } from "@/lib/api/relatorios";
import { BotoesDownloadGrafico } from "./botoes-download-grafico";

/**
 * Grafico de barras do total de obras por orgao (Dashboard) com drill-down:
 * clicar numa barra dispara onDrillDown(orgaoId) — a pagina refiltra o
 * dashboard inteiro por esse orgao (desfaz-se pelo botao "todos os órgãos").
 */
export function GraficoObrasOrgao({
  dados,
  onDrillDown,
}: {
  dados: ObrasPorOrgaoItem[];
  onDrillDown?: (orgaoId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>Obras por órgão</h3>
        <BotoesDownloadGrafico alvoRef={ref} nome="obras-orgao" />
      </div>
      <div ref={ref} style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={dados} margin={{ top: 24, right: 8 }}>
            <CartesianGrid stroke="#eef0f3" vertical={false} />
            <XAxis
              dataKey="orgaoNome"
              tickLine={false}
              axisLine={{ stroke: "#e2e5ea" }}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={36}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <Tooltip cursor={{ fill: "rgba(37, 99, 235, 0.08)" }} />
            <Bar
              dataKey="total"
              name="Obras"
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
              maxBarSize={24}
              cursor="pointer"
              onClick={(_d, i) => onDrillDown?.(dados[i].orgaoId)}
            >
              <LabelList dataKey="total" position="top" fill="#374151" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
