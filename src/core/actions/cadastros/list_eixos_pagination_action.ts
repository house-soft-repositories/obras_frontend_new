"use server";

import api from "@/core/rest_client/api";
import { EixoSchema } from "@/core/schemas/cadastros/eixo_schema";
import CadastroPageParam from "@/core/types/pagination/cadastro_page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = CadastroPageParam;

export default async function listEixosPaginationAction({ page, order, take, apenasAtivos }: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });
  if (apenasAtivos !== undefined) params.set("apenasAtivos", String(apenasAtivos));

  const response = await api.auth.get<Pagination<EixoSchema>>(
    `/api/cadastros/eixos?${params.toString()}`,
    { next: { tags: ["list-eixos"] } },
  );
  return response.data;
}
