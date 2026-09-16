"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import {
  criarAditivoSchema,
  type Aditivo,
  type CriarAditivoInput,
} from "@/core/schemas/contratos/contrato_schema";
import type ServerActionResult from "@/core/types/server_action_result";

function fail(error: unknown): ServerActionResult<never> {
  if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
  if (error instanceof HttpClientException) {
    return { success: false, data: null, error: obraErrorTranslator.translate(error) };
  }
  throw error;
}

export async function listAditivosAction(
  obraId: string,
  contratoId: string,
): Promise<ServerActionResult<Aditivo[]>> {
  try {
    const res = await api.auth.get<Aditivo[]>(`/api/contratos/${contratoId}/aditivos`, {
      next: { tags: [`obra-${obraId}-aditivos`] },
    });
    const raw = res.data as unknown;
    return { success: true, data: Array.isArray(raw) ? raw : [], error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<Aditivo[]>;
  }
}

export async function criarAditivoAction(
  obraId: string,
  contratoId: string,
  input: CriarAditivoInput,
): Promise<ServerActionResult<Aditivo>> {
  const parsed = criarAditivoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const payload: Record<string, unknown> = { ...parsed.data };
    for (const key of ["dataAssinatura", "prazoExecucaoData", "vigenciaAditivada", "observacoes"]) {
      if (payload[key] === "") delete payload[key];
    }
    if (payload.prazoExecucaoDias === undefined) delete payload.prazoExecucaoDias;
    if (payload.tipoPrazoExecucao === undefined) delete payload.tipoPrazoExecucao;
    const res = await api.auth.post<Aditivo>(`/api/contratos/${contratoId}/aditivos`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    updateTag(`obra-${obraId}-aditivos`);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function excluirAditivoAction(
  obraId: string,
  contratoId: string,
  aditivoId: string,
): Promise<ServerActionResult<void>> {
  try {
    await api.auth.delete(`/api/contratos/${contratoId}/aditivos/${aditivoId}`);
    updateTag(`obra-${obraId}-aditivos`);
    return { success: true, data: undefined as void, error: null };
  } catch (error) {
    return fail(error);
  }
}
