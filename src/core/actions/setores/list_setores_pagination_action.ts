"use server";

import api from "@/core/rest_client/api";
import { SetorWithOrgaoSchema } from "@/core/schemas/setores/setor_schema";
import PageParam from "@/core/types/pagination/page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = PageParam;

export default async function listSetoresPaginationAction({
  page,
  order,
  take,
}: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });

  const response = await api.auth.get<Pagination<SetorWithOrgaoSchema>>(
    `/api/orgaos/setores?${params.toString()}`,
    { next: { tags: ["list-setores"] } },
  );
  return response.data;
}
