"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";

export async function listResponsaveisAction(obraId: string) {
  const res = await api.auth.get<{ id: string; usuarioId: string; tipo: string }[]>(`/api/obras/${obraId}/equipe/responsaveis`, {
    next: { tags: [`obra-${obraId}-responsaveis`] },
  });
  const raw = res.data as unknown;
  return Array.isArray(raw) ? raw : [];
}

export async function adicionarResponsavelAction(obraId: string, usuarioId: string, tipo: string) {
  await api.auth.post(`/api/obras/${obraId}/equipe/responsaveis`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ usuarioId, tipo }),
  });
  updateTag(`obra-${obraId}-responsaveis`);
}

export async function removerResponsavelAction(obraId: string, id: string) {
  await api.auth.delete(`/api/obras/${obraId}/equipe/responsaveis/${id}`);
  updateTag(`obra-${obraId}-responsaveis`);
}

export async function listSeguidoresAction(obraId: string) {
  const res = await api.auth.get<{ id: string; usuarioId: string }[]>(`/api/obras/${obraId}/equipe/seguidores`, {
    next: { tags: [`obra-${obraId}-seguidores`] },
  });
  const raw = res.data as unknown;
  return Array.isArray(raw) ? raw : [];
}

export async function adicionarSeguidorAction(obraId: string, usuarioId: string) {
  await api.auth.post(`/api/obras/${obraId}/equipe/seguidores`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ usuarioId }),
  });
  updateTag(`obra-${obraId}-seguidores`);
}

export async function removerSeguidorAction(obraId: string, usuarioId: string) {
  await api.auth.delete(`/api/obras/${obraId}/equipe/seguidores/${usuarioId}`);
  updateTag(`obra-${obraId}-seguidores`);
}
