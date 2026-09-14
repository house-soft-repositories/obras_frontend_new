"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { cadastroErrorTranslator } from "@/core/errors/cadastro_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { criarTipologiaSchema, type CriarTipologiaOutput } from "@/core/schemas/cadastros/create_tipologia_schema";
import ServerActionResult from "@/core/types/server_action_result";

export async function criarTipologiaAction(input: CriarTipologiaOutput): Promise<ServerActionResult<{ ok: true }>> {
  const parsed = criarTipologiaSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    await api.auth.post("/api/cadastros/tipologias", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    updateTag("list-tipologias");
    return { success: true, data: { ok: true }, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: cadastroErrorTranslator.translate(error) };
    }
    throw error;
  }
}
