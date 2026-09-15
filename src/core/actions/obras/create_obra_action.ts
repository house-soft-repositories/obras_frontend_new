"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import {
  criarObraSchema,
  type CriarObraInput,
} from "@/core/schemas/obras/create_obra_schema";
import type { Obra } from "@/core/schemas/obras/obra_schema";
import type ServerActionResult from "@/core/types/server_action_result";

export default async function createObraAction(
  input: CriarObraInput,
): Promise<ServerActionResult<Obra>> {
  const parsed = criarObraSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }

  try {
    const res = await api.auth.post<Obra>("/api/obras", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    updateTag("list-obras");
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: obraErrorTranslator.translate(error),
      };
    }
    throw error;
  }
}
