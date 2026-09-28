"use server";

import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import api from "@/core/rest_client/api";
import {
  arquivoResponseSchema,
  confirmarUploadPayloadSchema,
  conteudoPastaResponseSchema,
  criarSubpastaSchema,
  downloadUrlResponseSchema,
  editarArquivoSchema,
  iniciarUploadPayloadSchema,
  listarConteudoPastaSchema,
  moverArquivoSchema,
  pastaResponseSchema,
  uploadIniciadoResponseSchema,
  type ArquivoResponse,
  type ConfirmarUploadPayload,
  type ConteudoPastaResponse,
  type CriarSubpastaInput,
  type DownloadUrlResponse,
  type EditarArquivoInput,
  type IniciarUploadPayload,
  type ListarConteudoPastaInput,
  type MoverArquivoInput,
  type PastaResponse,
  type UploadIniciadoResponse,
} from "@/core/schemas/documentos/arquivo_obra_schema";
import type ServerActionResult from "@/core/types/server_action_result";

function validationError(message?: string): ServerActionResult<never> {
  return {
    success: false,
    data: null,
    error: message ?? "Dados inválidos.",
  };
}

function fail(error: unknown): ServerActionResult<never> {
  if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
  if (error instanceof HttpClientException) {
    return { success: false, data: null, error: obraErrorTranslator.translate(error) };
  }
  return { success: false, data: null, error: "Não foi possível concluir a operação." };
}

const jsonHeaders = { "Content-Type": "application/json" };

export async function obterPastaRaizObraAction(
  obraId: string,
): Promise<ServerActionResult<PastaResponse>> {
  const parsed = pastaResponseSchema.shape.obraId.safeParse(obraId);
  if (!parsed.success) return validationError("Obra inválida.");

  try {
    const response = await api.auth.get<PastaResponse>(`/api/obras/${obraId}/pastas/raiz`, {
      next: { tags: [`obra-${obraId}-documentos`] },
    });
    return { success: true, data: pastaResponseSchema.parse(response.data), error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<PastaResponse>;
  }
}

export async function listarConteudoPastaAction(
  input: ListarConteudoPastaInput,
): Promise<ServerActionResult<ConteudoPastaResponse>> {
  const parsed = listarConteudoPastaSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error.issues[0]?.message);

  const params = new URLSearchParams({
    page: String(parsed.data.page),
    take: String(parsed.data.take),
    order: parsed.data.order,
  });

  try {
    const response = await api.auth.get<ConteudoPastaResponse>(
      `/api/pastas/${parsed.data.pastaId}?${params.toString()}`,
      { next: { tags: [`pasta-${parsed.data.pastaId}-conteudo`] } },
    );
    return { success: true, data: conteudoPastaResponseSchema.parse(response.data), error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<ConteudoPastaResponse>;
  }
}

export async function criarSubpastaAction(
  input: CriarSubpastaInput,
): Promise<ServerActionResult<PastaResponse>> {
  const parsed = criarSubpastaSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error.issues[0]?.message);

  try {
    const response = await api.auth.post<PastaResponse>("/api/pastas", {
      body: JSON.stringify(parsed.data),
      headers: jsonHeaders,
    });
    return { success: true, data: pastaResponseSchema.parse(response.data), error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<PastaResponse>;
  }
}

export async function removerPastaAction(
  pastaId: string,
): Promise<ServerActionResult<void>> {
  const parsed = listarConteudoPastaSchema.shape.pastaId.safeParse(pastaId);
  if (!parsed.success) return validationError("Pasta inválida.");

  try {
    await api.auth.delete(`/api/pastas/${pastaId}`);
    return { success: true, data: undefined as void, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function iniciarUploadArquivosAction(
  pastaId: string,
  input: IniciarUploadPayload,
): Promise<ServerActionResult<UploadIniciadoResponse>> {
  const pastaIdParsed = listarConteudoPastaSchema.shape.pastaId.safeParse(pastaId);
  if (!pastaIdParsed.success) return validationError("Pasta inválida.");

  const parsed = iniciarUploadPayloadSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error.issues[0]?.message);

  try {
    const response = await api.auth.post<UploadIniciadoResponse>(
      `/api/pastas/${pastaId}/arquivos`,
      {
        body: JSON.stringify(parsed.data),
        headers: jsonHeaders,
      },
    );
    return { success: true, data: uploadIniciadoResponseSchema.parse(response.data), error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<UploadIniciadoResponse>;
  }
}

export async function confirmarUploadArquivoAction(
  arquivoId: string,
  input: ConfirmarUploadPayload,
): Promise<ServerActionResult<ArquivoResponse>> {
  const arquivoIdParsed = arquivoResponseSchema.shape.id.safeParse(arquivoId);
  if (!arquivoIdParsed.success) return validationError("Arquivo inválido.");

  const parsed = confirmarUploadPayloadSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error.issues[0]?.message);

  try {
    const response = await api.auth.post<ArquivoResponse>(
      `/api/arquivos/${arquivoId}/confirmar`,
      {
        body: JSON.stringify(parsed.data),
        headers: jsonHeaders,
      },
    );
    return { success: true, data: arquivoResponseSchema.parse(response.data), error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<ArquivoResponse>;
  }
}

export async function uploadArquivosDiretoAction(
  pastaId: string,
  formData: FormData,
): Promise<ServerActionResult<ArquivoResponse[]>> {
  const pastaIdParsed = listarConteudoPastaSchema.shape.pastaId.safeParse(pastaId);
  if (!pastaIdParsed.success) return validationError("Pasta inválida.");

  try {
    const response = await api.auth.post<ArquivoResponse[]>(
      `/api/pastas/${pastaId}/arquivos/direto`,
      { body: formData },
    );
    return { success: true, data: arquivoResponseSchema.array().parse(response.data), error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<ArquivoResponse[]>;
  }
}

export async function obterUrlDownloadArquivoAction(
  arquivoId: string,
): Promise<ServerActionResult<DownloadUrlResponse>> {
  const parsed = arquivoResponseSchema.shape.id.safeParse(arquivoId);
  if (!parsed.success) return validationError("Arquivo inválido.");

  try {
    const response = await api.auth.get<DownloadUrlResponse>(`/api/arquivos/${arquivoId}/download`);
    return { success: true, data: downloadUrlResponseSchema.parse(response.data), error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<DownloadUrlResponse>;
  }
}

export async function editarArquivoAction(
  input: EditarArquivoInput,
): Promise<ServerActionResult<ArquivoResponse>> {
  const parsed = editarArquivoSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error.issues[0]?.message);

  const { arquivoId, ...payload } = parsed.data;

  try {
    const response = await api.auth.patch<ArquivoResponse>(`/api/arquivos/${arquivoId}`, {
      body: JSON.stringify(payload),
      headers: jsonHeaders,
    });
    return { success: true, data: arquivoResponseSchema.parse(response.data), error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<ArquivoResponse>;
  }
}

export async function moverArquivoAction(
  input: MoverArquivoInput,
): Promise<ServerActionResult<ArquivoResponse>> {
  const parsed = moverArquivoSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error.issues[0]?.message);

  try {
    const response = await api.auth.patch<ArquivoResponse>(
      `/api/arquivos/${parsed.data.arquivoId}/mover`,
      {
        body: JSON.stringify({ pastaId: parsed.data.pastaId }),
        headers: jsonHeaders,
      },
    );
    return { success: true, data: arquivoResponseSchema.parse(response.data), error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<ArquivoResponse>;
  }
}

export async function removerArquivoAction(
  arquivoId: string,
): Promise<ServerActionResult<void>> {
  const parsed = arquivoResponseSchema.shape.id.safeParse(arquivoId);
  if (!parsed.success) return validationError("Arquivo inválido.");

  try {
    await api.auth.delete(`/api/arquivos/${arquivoId}`);
    return { success: true, data: undefined as void, error: null };
  } catch (error) {
    return fail(error);
  }
}
