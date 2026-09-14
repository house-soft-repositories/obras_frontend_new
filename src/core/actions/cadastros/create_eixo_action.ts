"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { cadastroErrorTranslator } from "@/core/errors/cadastro_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { criarEixoSchema, type CriarEixoOutput } from "@/core/schemas/cadastros/create_eixo_schema";
import ServerActionResult from "@/core/types/server_action_result";

export async function criarEixoAction(input: CriarEixoOutput): Promise<ServerActionResult<{ ok: true }>> {
  const parsed = criarEixoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    await api.auth.post("/api/cadastros/eixos", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    updateTag("list-eixos");
    return { success: true, data: { ok: true }, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: cadastroErrorTranslator.translate(error) };
    }
    throw error;
  }
}
