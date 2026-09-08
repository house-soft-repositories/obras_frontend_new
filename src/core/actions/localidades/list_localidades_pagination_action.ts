"use server"

import api from "@/core/rest_client/api"
import { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import PageParam from "@/core/types/pagination/page_param"
import Pagination from "@/core/types/pagination/pagination";

type Params = PageParam & {

}


export default async function listLocalidadesPaginationAction({
  page,order,take
}: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });



  const response = await api.auth.get<Pagination<LocalidadeSchema>>(`/api/localidades?${params.toString()}`, {
    next: { tags: ["list-localidades"] },
  });
  return response.data;

}