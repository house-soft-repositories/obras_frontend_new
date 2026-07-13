import { Suspense } from "react";
import { ObrasListagem } from "@/components/obras/listagem/obras-listagem";
import { carregarOpcoesObra } from "@/lib/api/obras-opcoes";
import { carregarUsuarios } from "@/lib/api/usuarios";

export const dynamic = "force-dynamic";

/**
 * Listagem de Obras. As opcoes dos selects vem dos cadastros (server-side,
 * como no restante do modulo); a lista em si e carregada no client via
 * GET /api/proxy/relatorios/obras, com filtros sincronizados na URL.
 */
export default async function ObrasPage() {
  const [opcoes, usuarios] = await Promise.all([
    carregarOpcoesObra(),
    carregarUsuarios(),
  ]);

  return (
    <main style={{ padding: "1.5rem 1.75rem" }}>
      <Suspense fallback={<p className="page-sub">Carregando…</p>}>
        <ObrasListagem
          opcoes={{
            orgaos: opcoes.orgaos,
            eixos: opcoes.eixos,
            tipologias: opcoes.tipologias,
            classificacoes: opcoes.classificacoes,
          }}
          usuarios={usuarios}
        />
      </Suspense>
    </main>
  );
}
