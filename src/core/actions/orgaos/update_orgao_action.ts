"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { cadastroErrorTranslator } from "@/core/errors/cadastro_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { CriarOrgaoOutput } from "@/core/schemas/orgaos/create_orgao_schema";
import { OrgaoSchema } from "@/core/schemas/orgaos/orgao_schema";
import ServerActionResult from "@/core/types/server_action_result";

export async function atualizarOrgaoAction(
  id: string,
  data: CriarOrgaoOutput,
): Promise<ServerActionResult<OrgaoSchema>> {
  try {
    const response = await api.auth.patch<OrgaoSchema>(`/api/orgaos/${id}`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    updateTag("list-orgaos");
    updateTag("orgao");
    updateTag(`orgao-${id}`);
    return { success: true, data: response.data, error: null };
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
