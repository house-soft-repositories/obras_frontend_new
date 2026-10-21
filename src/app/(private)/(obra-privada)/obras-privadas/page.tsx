import listObrasPrivadasAction from "@/core/actions/obras-privadas/list_obras_privadas_action";
import listPessoaPaginationAction from "@/core/actions/pessoa/list_pessoa_pagination_action";
import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import listLocalidadesPaginationAction from "@/core/actions/localidades/list_localidades_pagination_action";
import type Pagination from "@/core/types/pagination/pagination";
import type { PessoaType } from "@/core/schemas/pessoa/pessoa_schema";
import type { ObraPrivada } from "@/core/schemas/obras-privadas/obra_privada_schema";
import { ObrasPrivadasClient } from "./_components/obras-privadas-client";

const emptyPagination = <T,>(): Pagination<T> => ({
  data: [],
  meta: {
    page: 1,
    take: 50,
    itemCount: 0,
    pageCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  },
});

export default async function ObrasPrivadasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) =>
    typeof params[key] === "string" ? params[key] : undefined;
  const [obrasResult, pessoas, orgaos, localidades] = await Promise.all([
    listObrasPrivadasAction({
      page: 1,
      take: 50,
      order: "DESC",
      q: value("q"),
      situacaoAlvara: value("situacaoAlvara"),
      andamento: value("andamento"),
      habiteSe: value("habiteSe"),
    }),
    listPessoaPaginationAction({ page: 1, order: "ASC", take: 50 }),
    listOrgaosPaginationAction({ page: 1, order: "ASC", take: 50 }),
    listLocalidadesPaginationAction({ page: 1, order: "ASC", take: 50 }),
  ]);

  let obras: Pagination<ObraPrivada>;
  if (obrasResult.success) {
    obras = obrasResult.data;
  } else {
    obras = emptyPagination<ObraPrivada>();
  }

  return (
    <ObrasPrivadasClient
      obras={obras}
      initialFilters={{
        q: value("q") ?? "",
        situacaoAlvara: value("situacaoAlvara") ?? "",
        andamento: value("andamento") ?? "",
      }}
      proprietarios={pessoas.data.map((item) => ({
        id: item.id,
        nome: item.nome ?? item.id,
      }))}
      orgaos={orgaos.data.map((item) => ({ id: item.id, nome: item.nome }))}
      localidades={localidades.data.map((item) => ({
        id: item.id,
        nome: item.nome,
      }))}
    />
  );
}
