"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";

export async function listTagsAction(obraId: string) {
  const res = await api.auth.get<{ id: string; nome: string }[]>(`/api/obras/${obraId}/tags`, {
    next: { tags: [`obra-${obraId}-tags`] },
  });
  const raw = res.data as unknown;
  return Array.isArray(raw) ? raw : [];
}

export async function aplicarTagsAction(obraId: string, tags: string) {
  await api.auth.post(`/api/obras/${obraId}/tags`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tags }),
  });
  updateTag(`obra-${obraId}-tags`);
  updateTag(`obra-${obraId}`);
  updateTag("list-obras");
}

export async function removerTagAction(obraId: string, tagId: string) {
  await api.auth.delete(`/api/obras/${obraId}/tags/${tagId}`);
  updateTag(`obra-${obraId}-tags`);
  updateTag(`obra-${obraId}`);
}
