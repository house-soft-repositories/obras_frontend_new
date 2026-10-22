"use server";

import { updateTag } from "next/cache";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import api from "@/core/rest_client/api";
import HttpClientException from "@/core/exceptions/http_client_exception";
import {
  atualizarStatusObraSchema,
  type AtualizarStatusObraInput,
} from "@/core/schemas/obras/update_status_obra_schema";
import type { Obra } from "@/core/schemas/obras/obra_schema";
import type ServerActionResult from "@/core/types/server_action_result";

export default async function updateStatusObraAction(
  id: string,
  input: AtualizarStatusObraInput,
): Promise<ServerActionResult<Obra>> {
  const parsed = atualizarStatusObraSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Status inválido.",
    };
  }

  try {
    const response = await api.auth.patch<Obra>(`/api/obras/${id}/status`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ novoStatus: parsed.data.novoStatus }),
    });
    updateTag("list-obras");
    updateTag("obra");
    updateTag(`obra-${id}`);
    return { success: true, data: response.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: obraErrorTranslator.translate(error) };
    }
    return { success: false, data: null, error: obraErrorTranslator.translate(error) };
  }
}
