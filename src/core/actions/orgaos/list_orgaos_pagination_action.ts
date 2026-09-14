"use server";

import api from "@/core/rest_client/api";
import { OrgaoSchema } from "@/core/schemas/orgaos/orgao_schema";
import PageParam from "@/core/types/pagination/page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = PageParam;

export default async function listOrgaosPaginationAction({
  page,
  order,
  take,
}: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });

  const response = await api.auth.get<Pagination<OrgaoSchema>>(
    `/api/orgaos?${params.toString()}`,
    { next: { tags: ["list-orgaos"] } },
  );
  return response.data;
}
