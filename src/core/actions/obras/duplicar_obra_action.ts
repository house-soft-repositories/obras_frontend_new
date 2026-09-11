"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { DuplicarObraPayload } from "@/lib/api/obras";
import type { ObraResponseDto } from "@/lib/api/obras";

export default async function duplicarObraAction(obraId: string, payload: DuplicarObraPayload): Promise<ObraResponseDto> {
  const res = await api.auth.post<ObraResponseDto>(`/api/obras/${obraId}/duplicar`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag("list-obras");
  return res.data as ObraResponseDto;
}
