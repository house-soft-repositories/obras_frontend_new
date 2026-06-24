"use client";

import { useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { QuantificadoresObras } from "@/lib/api/relatorios";
import { BotoesDownloadGrafico } from "./botoes-download-grafico";

/**
 * Grafico de barras dos QuantificadoresObras por orgao (RN-REL-15) com
 * drill-down: clicar numa barra dispara onDrillDown(orgaoId).
 */
export function GraficoQuantificadoresOrgao({
  dados,
  onDrillDown,
}: {
  dados: QuantificadoresObras[];
  onDrillDown?: (orgaoId: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const linhas = dados.map((q) => ({
    orgaoId: q.orgaoId ?? "—",
    orgao: (q.orgaoId ?? "Sem orgao").slice(0, 8),
    acimaMeta: q.acimaMeta,
    prazoVencido: q.prazoVencido,
    abaixoMeta: q.abaixoMeta,
    semStatus: q.semStatus,
  }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Obras por orgao</h3>
        <BotoesDownloadGrafico alvoRef={ref} nome="quantificadores-orgao" />
      </div>
      <div ref={ref} style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={linhas}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="orgao" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="acimaMeta" stackId="a" fill="#16a34a"
              onClick={(_d, i) => onDrillDown?.(linhas[i].orgaoId)} cursor="pointer" />
            <Bar dataKey="prazoVencido" stackId="a" fill="#dc2626"
              onClick={(_d, i) => onDrillDown?.(linhas[i].orgaoId)} cursor="pointer" />
            <Bar dataKey="abaixoMeta" stackId="a" fill="#f59e0b"
              onClick={(_d, i) => onDrillDown?.(linhas[i].orgaoId)} cursor="pointer" />
            <Bar dataKey="semStatus" stackId="a" fill="#9ca3af"
              onClick={(_d, i) => onDrillDown?.(linhas[i].orgaoId)} cursor="pointer" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
