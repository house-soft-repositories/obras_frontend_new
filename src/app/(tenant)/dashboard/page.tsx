"use client";

import { Suspense, useEffect, useState } from "react";
import { GraficoFluxoFisicoFinanceiro } from "@/components/relatorios/grafico-fluxo-fisico-financeiro";
import { GraficoQuantificadoresOrgao } from "@/components/relatorios/grafico-quantificadores-orgao";
import { obterDashboard, type Dashboard } from "@/lib/api/relatorios";

function Pagina() {
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

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", display: "grid", gap: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        {orgaoId && (
          <button type="button" onClick={() => setOrgaoId(undefined)}>
            ← todos os orgaos
          </button>
        )}
      </div>
      {carregando && <p style={{ color: "#888" }}>Carregando…</p>}
      {!carregando && dash && (
        <>
          <GraficoQuantificadoresOrgao
            dados={dash.quantificadoresPorOrgao}
            onDrillDown={(oid) => setOrgaoId(oid === "—" ? undefined : oid)}
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
