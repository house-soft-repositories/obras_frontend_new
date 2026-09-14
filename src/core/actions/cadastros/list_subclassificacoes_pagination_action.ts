"use server";

import api from "@/core/rest_client/api";
import { SubclassificacaoSchema } from "@/core/schemas/cadastros/subclassificacao_schema";
import CadastroPageParam from "@/core/types/pagination/cadastro_page_param";
import Pagination from "@/core/types/pagination/pagination";

type Params = CadastroPageParam & { classificacaoId: string };

export default async function listSubclassificacoesPaginationAction({ classificacaoId, page, order, take, apenasAtivos }: Params) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
  });
  if (apenasAtivos !== undefined) params.set("apenasAtivos", String(apenasAtivos));

  const response = await api.auth.get<Pagination<SubclassificacaoSchema>>(
    `/api/cadastros/classificacoes/${classificacaoId}/subclassificacoes?${params.toString()}`,
    { next: { tags: [`list-subclassificacoes-${classificacaoId}`] } },
  );
  return response.data;
}
