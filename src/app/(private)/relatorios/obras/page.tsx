import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import { listarObrasRelatorio } from "@/core/actions/relatorios/obras_relatorio_action";
import {
  lerFiltro,
  normalizarPaginacao,
  type FiltroRelatorioObras,
} from "@/core/schemas/relatorios/obras_relatorio_schema";
import { Caption, Eyebrow, Heading } from "@/core/ui/atoms/typography";
import { FiltrosObras } from "./_components/filtros-obras";
import { ListaObras } from "./_components/lista-obras";
import { QuantificadoresBar } from "./_components/quantificadores-bar";

type SearchParams = Record<string, string | string[] | undefined>;

function valor(params: SearchParams, chave: string): string {
  const v = params[chave];
  return typeof v === "string" ? v : "";
}

function numero(params: SearchParams, chave: string): number | undefined {
  const n = Number(valor(params, chave));
  return valor(params, chave) !== "" && Number.isFinite(n) ? n : undefined;
}

/** Reconstrói a query string da URL para leitura via `lerFiltro` (só chaves do schema). */
function paraURLSearchParams(params: SearchParams): URLSearchParams {
  const usp = new URLSearchParams();
  for (const [chave, v] of Object.entries(params)) {
    if (Array.isArray(v)) {
      for (const item of v) if (item) usp.append(chave, item);
    } else if (typeof v === "string" && v !== "") {
      usp.set(chave, v);
    }
  }
  return usp;
}

export default async function RelatorioObrasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const q = valor(params, "q");
  const status = valor(params, "status");
  const tipo = valor(params, "tipo");
  const orgaoId = valor(params, "orgaoId");

  const filtro: FiltroRelatorioObras = {
    ...lerFiltro(paraURLSearchParams(params)),
    ...(q ? { q } : {}),
    ...(status ? { status } : {}),
    ...(tipo ? { tipo } : {}),
    ...(orgaoId ? { orgaoId } : {}),
  };
  const { pagina, tamanho } = normalizarPaginacao(
    numero(params, "pagina"),
    numero(params, "tamanho"),
  );

  const [{ itens: obras, quantificadores, total }, orgaos] = await Promise.all([
    listarObrasRelatorio({ ...filtro, pagina, tamanho }),
    listOrgaosPaginationAction({ page: 1, order: "ASC", take: 50 }),
  ]);

  const temFiltro = Object.keys(filtro).length > 0;

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-6 border-b border-border pb-8">
        <Eyebrow>Relatórios</Eyebrow>
        <Heading className="mt-1 text-3xl sm:text-4xl">Obras</Heading>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Filtre a carteira, confira os quantificadores e navegue pelas obras.
          Filtros e paginação lidos da URL no servidor.
        </p>
      </section>

      <div className="grid gap-4">
        <QuantificadoresBar q={quantificadores} />
        <FiltrosObras
          inicial={{ q, status, tipo, orgaoId }}
          orgaos={orgaos.data.map((o) => ({ id: o.id, nome: o.nome }))}
        />
        {obras.length === 0 ? (
          <section className="rounded-app border border-dashed border-border p-12 text-center">
            <Heading as="h2" className="text-xl">
              Nenhuma obra para os filtros atuais
            </Heading>
            <Caption className="mt-2">
              {temFiltro
                ? "Ajuste ou limpe os filtros para ver mais resultados."
                : "Cadastre a primeira obra para começar o relatório."}
            </Caption>
          </section>
        ) : (
          <ListaObras
            obras={obras}
            total={total}
            pagina={pagina}
            tamanho={tamanho}
            filtros={filtro}
          />
        )}
      </div>
    </main>
  );
}
