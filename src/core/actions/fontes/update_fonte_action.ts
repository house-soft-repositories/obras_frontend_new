"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { cadastroErrorTranslator } from "@/core/errors/cadastro_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import {
  atualizarFonteSchema,
  type AtualizarFonteInput,
} from "@/core/schemas/fontes/create_fonte_schema";
import { FonteSchema } from "@/core/schemas/fontes/fonte_schema";
import ServerActionResult from "@/core/types/server_action_result";

export async function atualizarFonteAction(
  id: string,
  data: AtualizarFonteInput,
): Promise<ServerActionResult<FonteSchema>> {
  const parsed = atualizarFonteSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const response = await api.auth.patch<FonteSchema>(`/api/fontes/${id}`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    updateTag("list-fontes");
    updateTag("fonte");
    updateTag(`fonte-${id}`);
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
