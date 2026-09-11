"use server";

import api from "@/core/rest_client/api";
import type { ObraResponseDto } from "@/lib/api/obras";

export default async function getObraAction(id: string): Promise<ObraResponseDto | null> {
  const res = await api.auth.get<ObraResponseDto>(`/api/obras/${id}`, {
    next: { tags: ["obra", `obra-${id}`] },
  });
  return res.data as ObraResponseDto;
}
