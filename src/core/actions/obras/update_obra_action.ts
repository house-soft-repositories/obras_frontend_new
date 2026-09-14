"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { AtualizarObraInput } from "@/core/schemas/obras/update_obra_schema";
import type { Obra } from "@/core/schemas/obras/obra_schema";

export default async function updateObraAction(id: string, payload: AtualizarObraInput): Promise<Obra> {
  const res = await api.auth.patch<Obra>(`/api/obras/${id}`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag("list-obras");
  updateTag("obra");
  updateTag(`obra-${id}`);
  return res.data;
}
