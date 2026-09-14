"use server";

import api from "@/core/rest_client/api";
import { SubtipologiaSchema } from "@/core/schemas/cadastros/subtipologia_schema";
import CadastroPageParam from "@/core/types/pagination/cadastro_page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = CadastroPageParam & { tipologiaId: string };

export default async function listSubtipologiasPaginationAction({ tipologiaId, page, order, take, apenasAtivos }: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });
  if (apenasAtivos !== undefined) params.set("apenasAtivos", String(apenasAtivos));

  const response = await api.auth.get<Pagination<SubtipologiaSchema>>(
    `/api/cadastros/tipologias/${tipologiaId}/subtipologias?${params.toString()}`,
    { next: { tags: [`list-subtipologias-${tipologiaId}`] } },
  );
  return response.data;
}
