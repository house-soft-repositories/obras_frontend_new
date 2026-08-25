import { Suspense } from "react";
import { ObrasPrivadasListagem } from "@/components/obras-privadas/listagem";

export const dynamic = "force-dynamic";

/**
 * Mapa da cidade: a MESMA listagem em outra visualizacao, para que os filtros
 * e a contagem sejam identicos aos da lista — duas fontes de verdade
 * divergiriam.
 */
export default function MapaObrasPrivadasPage() {
  return (
    <Suspense fallback={<p className="page-sub" style={{ padding: "1.5rem 1.75rem" }}>Carregando…</p>}>
      <ObrasPrivadasListagem visaoInicial="mapa" />
    </Suspense>
  );
}
