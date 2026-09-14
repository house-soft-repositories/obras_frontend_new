"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { cadastroErrorTranslator } from "@/core/errors/cadastro_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { criarSubclassificacaoSchema, type CriarSubclassificacaoOutput } from "@/core/schemas/cadastros/create_subclassificacao_schema";
import ServerActionResult from "@/core/types/server_action_result";

export async function criarSubclassificacaoAction(input: CriarSubclassificacaoOutput): Promise<ServerActionResult<{ ok: true }>> {
  const parsed = criarSubclassificacaoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const { classificacaoId, ...body } = parsed.data;
    await api.auth.post(`/api/cadastros/classificacoes/${classificacaoId}/subclassificacoes`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    updateTag(`list-subclassificacoes-${classificacaoId}`);
    updateTag("list-subclassificacoes");
    return { success: true, data: { ok: true }, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: cadastroErrorTranslator.translate(error) };
    }
    throw error;
  }
}
