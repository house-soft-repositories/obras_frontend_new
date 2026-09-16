"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { obraPrivadaErrorTranslator } from "@/core/errors/obra_privada_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import {
  criarObraPrivadaSchema,
  type CriarObraPrivadaInput,
} from "@/core/schemas/obras-privadas/create_obra_privada_schema";
import type { ObraPrivada } from "@/core/schemas/obras-privadas/obra_privada_schema";
import type ServerActionResult from "@/core/types/server_action_result";

export default async function createObraPrivadaAction(
  input: CriarObraPrivadaInput,
): Promise<ServerActionResult<ObraPrivada>> {
  const parsed = criarObraPrivadaSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }

  try {
    const res = await api.auth.post<ObraPrivada>("/api/obras-privadas", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    updateTag("list-obras-privadas");
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: obraPrivadaErrorTranslator.translate(error),
      };
    }
    throw error;
  }
}
