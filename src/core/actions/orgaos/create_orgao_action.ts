"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { cadastroErrorTranslator } from "@/core/errors/cadastro_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { CriarOrgaoOutput } from "@/core/schemas/orgaos/create_orgao_schema";
import ServerActionResult from "@/core/types/server_action_result";

export async function criarOrgaoAction(
  data: CriarOrgaoOutput,
): Promise<ServerActionResult<{ ok: true }>> {
  try {
    await api.auth.post("/api/orgaos", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    updateTag("list-orgaos");
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
