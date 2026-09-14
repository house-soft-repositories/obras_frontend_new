import listObrasAction from "@/core/actions/obras/list_obras_action";
import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import listUsuariosPaginationAction from "@/core/actions/usuarios/list_usuarios_pagination_action";
import listFontesPaginationAction from "@/core/actions/fontes/list_fontes_pagination_action";
import listSetoresPaginationAction from "@/core/actions/setores/list_setores_pagination_action";
import listLocalidadesPaginationAction from "@/core/actions/localidades/list_localidades_pagination_action";
import listEixosPaginationAction from "@/core/actions/cadastros/list_eixos_pagination_action";
import listClassificacoesPaginationAction from "@/core/actions/cadastros/list_classificacoes_pagination_action";
import listTipologiasPaginationAction from "@/core/actions/cadastros/list_tipologias_pagination_action";
import { ObrasClient } from "./_components/obras-client";

export default async function ObrasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const value = (key: string) =>
    typeof params[key] === "string" ? params[key] : undefined;
  const [obras, orgaos, usuarios, fontes, setores, localidades, eixos, classificacoes, tipologias] = await Promise.all([
    listObrasAction({
      page: Number(value("page") ?? 1),
      take: 20,
      order: "DESC",
      q: value("q"),
      status: value("status"),
      tipo: value("tipo"),
      orgaoId: value("orgaoId"),
    }),
    listOrgaosPaginationAction({ page: 1, order: "ASC", take: 50 }),
    listUsuariosPaginationAction({ page: 1, order: "ASC", take: 50 }),
    listFontesPaginationAction({ page: 1, order: "ASC", take: 50 }),
    listSetoresPaginationAction({ page: 1, order: "ASC", take: 50 }),
    listLocalidadesPaginationAction({ page: 1, order: "ASC", take: 50 }),
    listEixosPaginationAction({ page: 1, order: "ASC", take: 50, apenasAtivos: true }),
    listClassificacoesPaginationAction({ page: 1, order: "ASC", take: 50, apenasAtivos: true }),
    listTipologiasPaginationAction({ page: 1, order: "ASC", take: 50, apenasAtivos: true }),
  ]);
  return (
    <ObrasClient
      obras={obras}
      orgaos={orgaos.data.map((item) => ({ id: item.id, nome: item.nome }))}
      usuarios={usuarios.data.map((item) => ({ id: item.id, nome: item.name }))}
      fontes={fontes.data.map((item) => ({ id: item.id, nome: item.nome }))}
      setores={setores.data.map((item) => ({ id: item.id, nome: item.nome }))}
      localidades={localidades.data.map((item) => ({ id: item.id, nome: item.nome }))}
      eixos={eixos.data.map((item) => ({ id: item.id, nome: item.nome }))}
      classificacoes={classificacoes.data.map((item) => ({ id: item.id, nome: item.nome }))}
      tipologias={tipologias.data.map((item) => ({ id: item.id, nome: item.nome }))}
    />
  );
}
