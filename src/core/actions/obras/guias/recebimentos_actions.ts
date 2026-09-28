"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { GuiaItem } from "@/core/schemas/obras/guia_item_schema";

const tagRecebimentos = (obraId: string) => `obra-${obraId}-recebimentos`;

export async function listRecebimentosAction(obraId: string) {
  const res = await api.auth.get<GuiaItem[]>(`/api/obras/${obraId}/recebimentos`, {
    next: { tags: [tagRecebimentos(obraId)] },
  });
  return res.data;
}

export async function criarRecebimentoAction(obraId: string, payload: unknown) {
  const res = await api.auth.post<GuiaItem>(`/api/obras/${obraId}/recebimentos`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag(tagRecebimentos(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}

export async function atualizarRecebimentoAction(obraId: string, itemId: string, payload: unknown) {
  const res = await api.auth.patch<GuiaItem>(`/api/obras/${obraId}/recebimentos/${itemId}`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag(tagRecebimentos(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}

export async function removerRecebimentoAction(obraId: string, itemId: string) {
  const res = await api.auth.delete<{ ok: true }>(`/api/obras/${obraId}/recebimentos/${itemId}`);
  updateTag(tagRecebimentos(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}
