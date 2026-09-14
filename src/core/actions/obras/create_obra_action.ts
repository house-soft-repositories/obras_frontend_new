"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import HttpClientException from "@/core/exceptions/http_client_exception";
import type { CriarObraInput } from "@/core/schemas/obras/create_obra_schema";
import type { Obra } from "@/core/schemas/obras/obra_schema";
import type ServerActionResult from "@/core/types/server_action_result";

export default async function createObraAction(
  payload: CriarObraInput,
): Promise<ServerActionResult<Obra>> {
  try {
    const res = await api.auth.post<Obra>("/api/obras", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    updateTag("list-obras");
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
    throw error;
  }
}
