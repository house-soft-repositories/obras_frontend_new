"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";

export type Observacao = {
  id: string;
  tenantId: string;
  obraId: string;
  texto: string;
  autorUsuarioId: string;
  createdAt: string;
  updatedAt: string;
};

export async function listObservacoesAction(obraId: string) {
  const res = await api.auth.get<Observacao[]>(
    `/api/obras/${obraId}/observacoes`,
    {
      next: { tags: [`obra-${obraId}-observacoes`] },
    },
  );
  const raw = res.data as unknown;
  return Array.isArray(raw) ? raw : [];
}

export async function criarObservacaoAction(obraId: string, texto: string) {
  const res = await api.auth.post<Observacao>(
    `/api/obras/${obraId}/observacoes`,
    {
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ texto }),
    },
  );
  updateTag(`obra-${obraId}-observacoes`);
  return res.data;
}

export async function atualizarObservacaoAction(
  obraId: string,
  obsId: string,
  texto: string,
) {
  const res = await api.auth.patch<Observacao>(
    `/api/obras/${obraId}/observacoes/${obsId}`,
    {
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ texto }),
    },
  );
  updateTag(`obra-${obraId}-observacoes`);
  return res.data;
}

export async function removerObservacaoAction(obraId: string, obsId: string) {
  const res = await api.auth.delete<{ ok: true }>(
    `/api/obras/${obraId}/observacoes/${obsId}`,
  );
  updateTag(`obra-${obraId}-observacoes`);
  return res.data;
}
