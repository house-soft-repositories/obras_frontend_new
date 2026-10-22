"use server";

import { updateTag } from "next/cache";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import api from "@/core/rest_client/api";
import {
  salvarRecebimentoSchema,
  type Recebimento,
  type SalvarRecebimentoInput,
} from "@/core/schemas/obras/recebimento_schema";
import type ServerActionResult from "@/core/types/server_action_result";

const tagRecebimentos = (obraId: string) => `obra-${obraId}-recebimentos`;

function invalidateRecebimentos(obraId: string) {
  updateTag(tagRecebimentos(obraId));
  updateTag(`obra-${obraId}`);
}

const validationError = (message: string) => ({
  success: false as const,
  data: null,
  error: message,
});

const isRedirectError = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "digest" in error &&
  typeof (error as { digest?: unknown }).digest === "string" &&
  (error as { digest: string }).digest.startsWith("NEXT_REDIRECT");

export async function listRecebimentosAction(
  obraId: string,
): Promise<ServerActionResult<Recebimento[]>> {
  try {
    const response = await api.auth.get<Recebimento[]>(
      `/api/obras/${obraId}/recebimentos`,
      {
        next: { tags: [tagRecebimentos(obraId)] },
      },
    );
    return { success: true, data: response.data, error: null };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      data: null,
      error: obraErrorTranslator.translate(error),
    };
  }
}

export async function criarRecebimentoAction(
  obraId: string,
  payload: SalvarRecebimentoInput,
): Promise<ServerActionResult<Recebimento>> {
  const parsed = salvarRecebimentoSchema.safeParse(payload);
  if (!parsed.success) {
    return validationError(
      parsed.error.issues[0]?.message ?? "Revise os dados do recebimento.",
    );
  }
  try {
    const response = await api.auth.post<Recebimento>(
      `/api/obras/${obraId}/recebimentos`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    invalidateRecebimentos(obraId);
    return { success: true, data: response.data, error: null };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      data: null,
      error: obraErrorTranslator.translate(error),
    };
  }
}

export async function atualizarRecebimentoAction(
  obraId: string,
  itemId: string,
  payload: Partial<SalvarRecebimentoInput>,
): Promise<ServerActionResult<Recebimento>> {
  const parsed = salvarRecebimentoSchema.partial().safeParse(payload);
  if (!parsed.success) {
    return validationError(
      parsed.error.issues[0]?.message ?? "Revise os dados do recebimento.",
    );
  }
  try {
    const response = await api.auth.patch<Recebimento>(
      `/api/obras/${obraId}/recebimentos/${itemId}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    invalidateRecebimentos(obraId);
    return { success: true, data: response.data, error: null };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      data: null,
      error: obraErrorTranslator.translate(error),
    };
  }
}

export async function removerRecebimentoAction(
  obraId: string,
  itemId: string,
): Promise<ServerActionResult<{ ok: true }>> {
  try {
    const response = await api.auth.delete<{ ok: true }>(
      `/api/obras/${obraId}/recebimentos/${itemId}`,
    );
    invalidateRecebimentos(obraId);
    return { success: true, data: response.data, error: null };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      data: null,
      error: obraErrorTranslator.translate(error),
    };
  }
}
