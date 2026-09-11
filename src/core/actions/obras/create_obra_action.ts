"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { CriarObraPayload } from "@/lib/api/obras";
import type { ObraResponseDto } from "@/lib/api/obras";

export default async function createObraAction(payload: CriarObraPayload): Promise<ObraResponseDto> {
  const res = await api.auth.post<ObraResponseDto>("/api/obras", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  updateTag("list-obras");
  return res.data as ObraResponseDto;
}
