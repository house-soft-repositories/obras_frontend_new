"use server";

import api from "@/core/rest_client/api";
import { TipologiaSchema } from "@/core/schemas/cadastros/tipologia_schema";
import CadastroPageParam from "@/core/types/pagination/cadastro_page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = CadastroPageParam;

export default async function listTipologiasPaginationAction({ page, order, take, apenasAtivos }: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });
  if (apenasAtivos !== undefined) params.set("apenasAtivos", String(apenasAtivos));

  const response = await api.auth.get<Pagination<TipologiaSchema>>(
    `/api/cadastros/tipologias?${params.toString()}`,
    { next: { tags: ["list-tipologias"] } },
  );
  return response.data;
}
