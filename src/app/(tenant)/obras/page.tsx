import {
  ObrasListagem,
  type ObraLinha,
} from "@/components/obras/listagem/obras-listagem";
import {
  filtrosParaQueryString,
  queryStringParaFiltros,
} from "@/lib/api/obras-listagem";
import { carregarOpcoesObra } from "@/lib/api/obras-opcoes";
import { apiServerFetch } from "@/lib/api/server";

export const dynamic = "force-dynamic";

interface PaginaObras {
  itens: ObraLinha[];
  total: number;
}

export default async function ObrasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") usp.set(k, v);
  }
  const filtros = queryStringParaFiltros(usp);
  const qs = filtrosParaQueryString(filtros);

  let pagina: PaginaObras = { itens: [], total: 0 };
  try {
    pagina = await apiServerFetch<PaginaObras>(`/obras?${qs}`);
  } catch {
    pagina = { itens: [], total: 0 };
  }
  const opcoes = await carregarOpcoesObra();

  return (
    <main style={{ padding: "1.5rem 1.75rem" }}>
      <h1 className="page-titulo">Obras</h1>
      <ObrasListagem
        itens={pagina.itens}
        total={pagina.total}
        filtros={filtros}
        opcoes={{
          orgaos: opcoes.orgaos,
          eixos: opcoes.eixos,
          tipologias: opcoes.tipologias,
        }}
      />
    </main>
  );
}
