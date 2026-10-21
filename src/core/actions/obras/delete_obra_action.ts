"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import type ServerActionResult from "@/core/types/server_action_result";

function fail(error: unknown): ServerActionResult<never> {
  if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
  if (error instanceof HttpClientException) {
    return { success: false, data: null, error: obraErrorTranslator.translate(error) };
  }
  throw error;
}

export default async function deleteObraAction(id: string): Promise<ServerActionResult<void>> {
  try {
    await api.auth.delete(`/api/obras/${id}`);
    updateTag("list-obras");
    updateTag(`obra-${id}`);
    return { success: true, data: undefined, error: null };
  } catch (error) {
    return fail(error);
  }
}