"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { GuiaItem } from "@/core/schemas/obras/guia_item_schema";

const tagLicencas = (obraId: string) => `obra-${obraId}-licencas`;

export async function listLicencasAction(obraId: string) {
  const res = await api.auth.get<GuiaItem[]>(`/api/obras/${obraId}/licencas`, {
    next: { tags: [tagLicencas(obraId)] },
  });
  return res.data;
}

export async function criarLicencaAction(obraId: string, payload: unknown) {
  const res = await api.auth.post<GuiaItem>(`/api/obras/${obraId}/licencas`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag(tagLicencas(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}

export async function atualizarLicencaAction(obraId: string, itemId: string, payload: unknown) {
  const res = await api.auth.patch<GuiaItem>(`/api/obras/${obraId}/licencas/${itemId}`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag(tagLicencas(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}

export async function removerLicencaAction(obraId: string, itemId: string) {
  const res = await api.auth.delete<{ ok: true }>(`/api/obras/${obraId}/licencas/${itemId}`);
  updateTag(tagLicencas(obraId));
  updateTag(`obra-${obraId}`);
  return res.data;
}
