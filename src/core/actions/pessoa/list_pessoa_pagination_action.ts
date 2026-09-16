"use server";

import api from "@/core/rest_client/api";
import { PessoaType } from "@/core/schemas/pessoa/pessoa_schema";
import PageParam from "@/core/types/pagination/page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = PageParam;

export default async function listPessoaPaginationAction({ page, order, take }: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });

  const response = await api.auth.get<Pagination<PessoaType>>(
    `/api/pessoas?${params.toString()}`,
    {
      next: {
        tags: ["list-pessoa-pagination"],
      },
    },
  );

  return response.data;
}
