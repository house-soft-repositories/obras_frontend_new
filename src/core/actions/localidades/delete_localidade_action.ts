"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { cadastroErrorTranslator } from "@/core/errors/cadastro_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import ServerActionResult from "@/core/types/server_action_result";

export async function excluirLocalidadeAction(
  id: string,
): Promise<ServerActionResult<{ ok: true }>> {
  try {
    await api.auth.delete(`/api/localidades/${id}`);
    updateTag("list-localidades");
    updateTag("localidade");
    updateTag(`localidade-${id}`);
    return { success: true, data: { ok: true }, error: null };
  } catch (error) {
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: cadastroErrorTranslator.translate(error),
      };
    }
    throw error;
  }
}
