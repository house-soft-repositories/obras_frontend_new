"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { GuiaItem } from "@/core/schemas/obras/guia_item_schema";
import type { ObraOrcamentoReadModel } from "@/core/schemas/obras/orcamento_read_model_schema";

const tagOrcamentos = (obraId: string) => `obra-${obraId}-orcamentos`;

export async function listOrcamentosAction(obraId: string) {
  const res = await api.auth.get<ObraOrcamentoReadModel[]>(`/api/obras/${obraId}/orcamentos`, {
    next: { tags: [tagOrcamentos(obraId)] },
  });
  return res.data;
}

export async function criarOrcamentoAction(obraId: string, payload: unknown) {
  const res = await api.auth.post<GuiaItem>(`/api/obras/${obraId}/orcamentos`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag(tagOrcamentos(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}

export async function removerOrcamentoAction(obraId: string, itemId: string) {
  const res = await api.auth.delete<{ ok: true }>(`/api/obras/${obraId}/orcamentos/${itemId}`);
  updateTag(tagOrcamentos(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}
