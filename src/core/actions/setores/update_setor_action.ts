"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { cadastroErrorTranslator } from "@/core/errors/cadastro_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { SetorPayloadOutput } from "@/core/schemas/setores/create_setor_schema";
import { SetorSchema } from "@/core/schemas/setores/setor_schema";
import ServerActionResult from "@/core/types/server_action_result";

export async function atualizarSetorAction(
  orgaoId: string,
  id: string,
  data: SetorPayloadOutput,
): Promise<ServerActionResult<SetorSchema>> {
  try {
    const payload = { ...data } as SetorPayloadOutput & {
      orgaoId?: unknown;
    };
    delete payload.orgaoId;
    const response = await api.auth.patch<SetorSchema>(
      `/api/orgaos/${orgaoId}/setores/${id}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    updateTag("list-setores");
    updateTag("setor");
    updateTag(`setor-${id}`);
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
