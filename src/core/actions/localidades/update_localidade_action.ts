"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { cadastroErrorTranslator } from "@/core/errors/cadastro_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { CriarLocalidadeOutput } from "@/core/schemas/localidade/create_localidade_shema";
import { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import ServerActionResult from "@/core/types/server_action_result";

export async function atualizarLocalidadeAction(
  id: string,
  data: CriarLocalidadeOutput,
): Promise<ServerActionResult<LocalidadeSchema>> {
  try {
    const response = await api.auth.patch<LocalidadeSchema>(
      `/api/localidades/${id}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      },
    );
    updateTag("list-localidades");
    updateTag("localidade");
    updateTag(`localidade-${id}`);
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
