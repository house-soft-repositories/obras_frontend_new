import { Suspense } from "react";
import { ObrasPrivadasListagem } from "@/components/obras-privadas/listagem";

export const dynamic = "force-dynamic";

/**
 * Listagem de obras privadas. Toda a carga e client-side com os filtros
 * sincronizados na URL, entao a pagina server so provê o Suspense exigido pelo
 * `useSearchParams`.
 */
export default function ObrasPrivadasPage() {
  return (
    <Suspense fallback={<p className="page-sub" style={{ padding: "1.5rem 1.75rem" }}>Carregando…</p>}>
      <ObrasPrivadasListagem />
    </Suspense>
  );
}
