import listLocalidadesPaginationAction from "@/core/actions/localidades/list_localidades_pagination_action";
import { LocalidadesClient } from "./localidades-client";
import PageParam from "@/core/types/pagination/page_param";

type Params = {
  params: Promise<Partial<PageParam>>
}


export default async function LocalidadesPage(props: Params) {

  const { page, order, take } = await props.params;

  const localidades = await listLocalidadesPaginationAction({
    page: page ?? 1,
    order: order ?? "ASC",
    take: take ?? 10,
  })

  return <LocalidadesClient localidadesIniciais={localidades} />;
}
