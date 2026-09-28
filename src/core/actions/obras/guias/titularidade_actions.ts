"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { GuiaItem } from "@/core/schemas/obras/guia_item_schema";

const tagTitularidade = (obraId: string) => `obra-${obraId}-titularidade`;

export async function getTitularidadeAction(obraId: string) {
  const res = await api.auth.get<GuiaItem | null>(`/api/obras/${obraId}/titularidade`, {
    next: { tags: [tagTitularidade(obraId)] },
  });
  return res.data;
}

export async function salvarTitularidadeAction(obraId: string, payload: unknown) {
  const res = await api.auth.post<GuiaItem>(`/api/obras/${obraId}/titularidade`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag(tagTitularidade(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}
