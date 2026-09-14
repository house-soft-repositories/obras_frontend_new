"use server";

import api from "@/core/rest_client/api";
import type { Obra } from "@/core/schemas/obras/obra_schema";

export default async function getObraAction(id: string): Promise<Obra | null> {
  const res = await api.auth.get<Obra>(`/api/obras/${id}`, {
    next: { tags: ["obra", `obra-${id}`] },
  });
  return res.data;
}
