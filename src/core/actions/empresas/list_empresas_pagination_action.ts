"use server";

import api from "@/core/rest_client/api";
import { EmpresaSchema } from "@/core/schemas/empresas/empresa_schema";
import PageParam from "@/core/types/pagination/page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = PageParam;

export default async function listEmpresasPaginationAction({ page, order, take }: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });

  const response = await api.auth.get<Pagination<EmpresaSchema>>(
    `/api/empresas-contratadas?${params.toString()}`,
    {
      next: {
        tags: ["list-empresas"],
      },
    },
  );

  return response.data;
}
