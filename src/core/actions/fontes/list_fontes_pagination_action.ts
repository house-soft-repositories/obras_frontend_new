"use server";

import api from "@/core/rest_client/api";
import { FonteSchema } from "@/core/schemas/fontes/fonte_schema";
import PageParam from "@/core/types/pagination/page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = PageParam;

type ListFontesPaginationParams = Params & {
  ativo?: boolean;
};

export default async function listFontesPaginationAction({
  page,
  order,
  take,
  ativo,
}: ListFontesPaginationParams) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });

  if (typeof ativo === "boolean") {
    params.set("ativo", String(ativo));
  }

  const response = await api.auth.get<Pagination<FonteSchema>>(
    `/api/fontes?${params.toString()}`,
    { next: { tags: ["list-fontes"] } },
  );
  return response.data;
}
