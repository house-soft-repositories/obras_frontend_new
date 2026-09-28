"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { GuiaItem } from "@/core/schemas/obras/guia_item_schema";

const tagLocalizacoes = (obraId: string) => `obra-${obraId}-localizacoes`;

export async function listLocalizacoesAction(obraId: string) {
  const res = await api.auth.get<GuiaItem[]>(`/api/obras/${obraId}/localizacoes`, {
    next: { tags: [tagLocalizacoes(obraId)] },
  });
  return res.data;
}

export async function criarLocalizacaoAction(obraId: string, payload: unknown) {
  const res = await api.auth.post<GuiaItem>(`/api/obras/${obraId}/localizacoes`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag(tagLocalizacoes(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}

export async function removerLocalizacaoAction(obraId: string, itemId: string) {
  const res = await api.auth.delete<{ ok: true }>(`/api/obras/${obraId}/localizacoes/${itemId}`);
  updateTag(tagLocalizacoes(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}
