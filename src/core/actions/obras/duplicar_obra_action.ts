"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { DuplicarObraInput } from "@/core/schemas/obras/duplicar_obra_schema";
import type { Obra } from "@/core/schemas/obras/obra_schema";

export default async function duplicarObraAction(obraId: string, payload: DuplicarObraInput = {}): Promise<Obra> {
  const res = await api.auth.post<Obra>(`/api/obras/${obraId}/duplicar`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag("list-obras");
  return res.data;
}
