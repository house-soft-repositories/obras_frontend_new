import listObrasPrivadasAction from "@/core/actions/obras-privadas/list_obras_privadas_action";
import listPessoaPaginationAction from "@/core/actions/pessoa/list_pessoa_pagination_action";
import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import listLocalidadesPaginationAction from "@/core/actions/localidades/list_localidades_pagination_action";
import { ObrasPrivadasClient } from "./_components/obras-privadas-client";

export default async function ObrasPrivadasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) =>
    typeof params[key] === "string" ? params[key] : undefined;
  const [obras, pessoas, orgaos, localidades] = await Promise.all([
    listObrasPrivadasAction({
      page: 1,
      take: 50,
      order: "DESC",
      q: value("q"),
      situacaoAlvara: value("situacaoAlvara"),
      andamento: value("andamento"),
      habiteSe: value("habiteSe"),
    }),
    listPessoaPaginationAction({ page: 1, order: "ASC", take: 50 }).catch(
      () => ({ data: [] as Array<{ id: string; nome: string | null }> }),
    ),
    listOrgaosPaginationAction({ page: 1, order: "ASC", take: 50 }),
    listLocalidadesPaginationAction({ page: 1, order: "ASC", take: 50 }),
  ]);

  return (
    <ObrasPrivadasClient
      obras={obras}
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
