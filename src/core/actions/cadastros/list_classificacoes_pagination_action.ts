"use server";

import api from "@/core/rest_client/api";
import { ClassificacaoSchema } from "@/core/schemas/cadastros/classificacao_schema";
import CadastroPageParam from "@/core/types/pagination/cadastro_page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = CadastroPageParam;

export default async function listClassificacoesPaginationAction({ page, order, take, apenasAtivos }: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });
  if (apenasAtivos !== undefined) params.set("apenasAtivos", String(apenasAtivos));

  const response = await api.auth.get<Pagination<ClassificacaoSchema>>(
    `/api/cadastros/classificacoes?${params.toString()}`,
    { next: { tags: ["list-classificacoes"] } },
  );
  return response.data;
}
