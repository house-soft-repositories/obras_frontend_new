"use client";

import { useRef } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FluxoFisicoFinanceiro } from "@/lib/api/relatorios";
import { BotoesDownloadGrafico } from "./botoes-download-grafico";

/** Graficos do FluxoFisicoFinanceiro (RN-REL-17): valores e fisico x financeiro. */
export function GraficoFluxoFisicoFinanceiro({
  fluxo,
}: {
  fluxo: FluxoFisicoFinanceiro;
}) {
  const refValores = useRef<HTMLDivElement>(null);
  const refComparativo = useRef<HTMLDivElement>(null);

  const valores = [
    { nome: "Contratado", valor: Number(fluxo.totalContratado) },
    { nome: "Medido", valor: Number(fluxo.medidoTotal) },
    { nome: "Empenhado", valor: Number(fluxo.empenhadoTotal) },
    { nome: "Liquidado", valor: Number(fluxo.liquidadoTotal) },
    { nome: "Pago", valor: Number(fluxo.pagoTotal) },
  ];
  const comparativo = [
    { nome: "Fisico", percentual: fluxo.percentualFisico },
    { nome: "Financeiro", percentual: fluxo.percentualFinanceiro },
  ];

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Execucao financeira (R$)</h3>
          <BotoesDownloadGrafico alvoRef={refValores} nome="fluxo-valores" />
        </div>
        <div ref={refValores} style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={valores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="valor" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>Fisico x Financeiro (%)</h3>
          <BotoesDownloadGrafico alvoRef={refComparativo} nome="fisico-financeiro" />
        </div>
        <div ref={refComparativo} style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <BarChart data={comparativo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="percentual" fill="#7c3aed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
