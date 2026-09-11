"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { AtualizarObraPayload } from "@/lib/api/obras";
import type { ObraResponseDto } from "@/lib/api/obras";

export default async function updateObraAction(id: string, payload: AtualizarObraPayload): Promise<ObraResponseDto> {
  const res = await api.auth.patch<ObraResponseDto>(`/api/obras/${id}`, {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag("list-obras");
  updateTag("obra");
  updateTag(`obra-${id}`);
  return res.data as ObraResponseDto;
}
