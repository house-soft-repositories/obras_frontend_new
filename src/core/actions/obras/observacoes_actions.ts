"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";

export async function listObservacoesAction(obraId: string) {
  const res = await api.auth.get<{ id: string; texto: string; autorId: string; createdAt: string; updatedAt: string }[]>(`/api/obras/${obraId}/observacoes`, {
    next: { tags: [`obra-${obraId}-observacoes`] },
  });
  const raw = res.data as unknown;
  return Array.isArray(raw) ? raw : [];
}

export async function criarObservacaoAction(obraId: string, texto: string) {
  const res = await api.auth.post(`/api/obras/${obraId}/observacoes`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ texto }),
  });
  updateTag(`obra-${obraId}-observacoes`);
  return res.data;
}

export async function atualizarObservacaoAction(obraId: string, obsId: string, texto: string) {
  await api.auth.patch(`/api/obras/${obraId}/observacoes/${obsId}`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ texto }),
  });
  updateTag(`obra-${obraId}-observacoes`);
}

export async function removerObservacaoAction(obraId: string, obsId: string) {
  await api.auth.delete(`/api/obras/${obraId}/observacoes/${obsId}`);
  updateTag(`obra-${obraId}-observacoes`);
}
