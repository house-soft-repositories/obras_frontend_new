"use client";

import { Body, Caption } from "@/core/ui/atoms/typography";

// TODO(backend): o backend novo não expõe endpoints financeiro
// (empenhos/liquidações/pagamentos e visão físico-financeira existiam apenas
// no legado). Esta aba exibe empty-state até os endpoints existirem.
export function FinanceiroTab({ obraId }: { obraId: string }) {
  return (
    <div role="tabpanel" className="grid gap-4 p-5 text-center" data-obra-id={obraId}>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Empenhado", "—"],
          ["Liquidado", "—"],
          ["Pago", "—"],
        ].map(([label, value]) => (
          <div key={label} className="overflow-hidden rounded-app border border-border bg-surface">
            <div className="border-b border-border px-4 py-2 text-xs text-muted">{label}</div>
            <div className="px-4 py-3 font-display text-xl font-semibold tabular-nums">{value}</div>
          </div>
        ))}
      </div>
      <Body className="font-semibold">Financeiro indisponível</Body>
      <Caption>
        Os lançamentos de empenho, liquidação e pagamento ainda não possuem
        endpoint no backend novo. Nenhum dado mockado é exibido aqui.
      </Caption>
    </div>
  );
}
