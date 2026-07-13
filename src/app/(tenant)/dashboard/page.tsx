"use client";

import { Suspense, useEffect, useState } from "react";
import { useMe } from "@/components/layout/app-shell";
import { GraficoFluxoFisicoFinanceiro } from "@/components/relatorios/grafico-fluxo-fisico-financeiro";
import { GraficoObrasOrgao } from "@/components/relatorios/grafico-obras-orgao";
import { KpisDashboard } from "@/components/relatorios/kpis-dashboard";
import { obterDashboard, type Dashboard } from "@/lib/api/relatorios";

function Pagina() {
  const me = useMe();
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [orgaoId, setOrgaoId] = useState<string | undefined>(undefined);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let vivo = true;
    obterDashboard({}, orgaoId)
      .then((d) => vivo && setDash(d))
      .catch(() => vivo && setDash(null))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [orgaoId]);

  const nomeTenant = me ? (me.tenant?.nome ?? "Plataforma") : "…";

  return (
    <main style={{ padding: "2rem", display: "grid", gap: 24 }}>
      <div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Dashboard</h1>
          {orgaoId && (
            <button type="button" onClick={() => setOrgaoId(undefined)}>
              ← todos os órgãos
            </button>
          )}
        </div>
        <p className="page-sub">Indicadores físico-financeiros · {nomeTenant}</p>
      </div>
      {carregando && <p style={{ color: "#888" }}>Carregando…</p>}
      {!carregando && dash && (
        <>
          <KpisDashboard
            contagem={dash.contagemPorStatus}
            numeroOrgaos={dash.obrasPorOrgao.length}
          />
          <GraficoObrasOrgao
            dados={dash.obrasPorOrgao}
            onDrillDown={(oid) => setOrgaoId(oid)}
          />
          <GraficoFluxoFisicoFinanceiro fluxo={dash.fluxoAgregado} />
        </>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<p style={{ padding: "2rem" }}>Carregando…</p>}>
      <Pagina />
    </Suspense>
  );
}
