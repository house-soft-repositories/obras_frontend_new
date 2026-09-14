"use server";

import api from "@/core/rest_client/api";
import { FonteSchema } from "@/core/schemas/fontes/fonte_schema";
import PageParam from "@/core/types/pagination/page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = PageParam;

export default async function listFontesPaginationAction({
  page,
  order,
  take,
}: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });

  const response = await api.auth.get<Pagination<FonteSchema>>(
    `/api/fontes?${params.toString()}`,
    { next: { tags: ["list-fontes"] } },
  );
  return response.data;
}
