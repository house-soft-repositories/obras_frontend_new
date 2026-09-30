"use server";

import api from "@/core/rest_client/api";
import { FonteSchema } from "@/core/schemas/fontes/fonte_schema";

export default async function getFonteAction(id: string) {
  const response = await api.auth.get<FonteSchema>(`/api/fontes/${id}`, {
    next: { tags: ["fonte", `fonte-${id}`] },
  });
  return response.data;
}
