"use server";

import api from "@/core/rest_client/api";
import type { ObraPrivada } from "@/core/schemas/obras-privadas/obra_privada_schema";

export default async function getObraPrivadaAction(
  id: string,
): Promise<ObraPrivada | null> {
  try {
    const res = await api.auth.get<ObraPrivada>(`/api/obras-privadas/${id}`, {
      next: { tags: ["obra-privada", `obra-privada-${id}`] },
    });
    return res.data;
  } catch {
    return null;
  }
}
