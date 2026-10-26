"use server";

import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import api from "@/core/rest_client/api";
import type ServerActionResult from "@/core/types/server_action_result";

function fail(error: unknown): ServerActionResult<never> {
  if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
  if (error instanceof HttpClientException) {
    return { success: false, data: null, error: obraErrorTranslator.translate(error) };
  }
  throw error;
}

// TODO(backend): /api/attachments possui upload/download/replace/delete, mas
// não expõe listagem por entidade. A aba Arquivos usa upload + empty-state de
// listagem até o backend expor GET por entityType/entityId.
export async function getAttachmentDownloadUrlAction(
  attachmentId: string,
): Promise<ServerActionResult<{ url: string }>> {
  try {
    const res = await api.auth.get<{ downloadUrl?: string; url?: string }>(
      `/api/attachments/${attachmentId}/download`,
    );
    const url = res.data.downloadUrl ?? res.data.url;
    if (!url) {
      return { success: false, data: null, error: "URL de download não encontrada." };
    }
    return { success: true, data: { url }, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<{ url: string }>;
  }
}

export async function deleteAttachmentAction(
  attachmentId: string,
): Promise<ServerActionResult<void>> {
  try {
    await api.auth.delete(`/api/attachments/${attachmentId}`);
    return { success: true, data: undefined as void, error: null };
  } catch (error) {
    return fail(error);
  }
}
