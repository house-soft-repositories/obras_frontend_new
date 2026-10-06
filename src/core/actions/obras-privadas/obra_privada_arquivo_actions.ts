"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { obraPrivadaErrorTranslator } from "@/core/errors/obra_privada_error_translator";
import {
  confirmarUploadArquivoSchema,
  iniciarUploadArquivoSchema,
  type ConfirmarUploadArquivoInput,
  type IniciarUploadArquivoInput,
  type UploadPreparado,
} from "@/core/schemas/obras-privadas/obra_privada_arquivo_schema";
import type { ArquivoPrivado } from "@/core/schemas/obras-privadas/obra_privada_schema";
import type ServerActionResult from "@/core/types/server_action_result";

function translateArquivoError(error: unknown, fallback: string): string {
  if (error instanceof HttpClientException) {
    return obraPrivadaErrorTranslator.translate(error);
  }
  return fallback;
}

function revalidateArquivosTag(obraPrivadaId: string) {
  updateTag(`obra-privada-${obraPrivadaId}-arquivos`);
  updateTag(`obra-privada-${obraPrivadaId}-timeline`);
}

export async function iniciarUploadArquivoObraPrivadaAction(
  obraPrivadaId: string,
  input: IniciarUploadArquivoInput,
): Promise<ServerActionResult<UploadPreparado[]>> {
  const parsed = iniciarUploadArquivoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }

  try {
    const res = await api.auth.post<UploadPreparado[]>(
      `/api/obras-privadas/${obraPrivadaId}/arquivos`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: translateArquivoError(
          error,
          "Não foi possível iniciar o upload do arquivo.",
        ),
      };
    }
    throw error;
  }
}

export async function confirmarUploadArquivoObraPrivadaAction(
  obraPrivadaId: string,
  arquivoId: string,
  input: ConfirmarUploadArquivoInput,
): Promise<ServerActionResult<ArquivoPrivado>> {
  const parsed = confirmarUploadArquivoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }

  try {
    const res = await api.auth.post<ArquivoPrivado>(
      `/api/obras-privadas-arquivos/${arquivoId}/confirmar`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    revalidateArquivosTag(obraPrivadaId);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: translateArquivoError(
          error,
          "Não foi possível confirmar o upload do arquivo.",
        ),
      };
    }
    throw error;
  }
}
