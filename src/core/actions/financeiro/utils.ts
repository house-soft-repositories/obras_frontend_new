import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import type ServerActionResult from "@/core/types/server_action_result";

export const tagFinanceiro = (obraId: string) => `obra-${obraId}-financeiro`;

export function fail(error: unknown): ServerActionResult<never> {
  if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
    throw error;
  }
  if (error instanceof HttpClientException) {
    return {
      success: false,
      data: null,
      error: obraErrorTranslator.translate(error),
    };
  }
  throw error;
}
