"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import {
  criarParalisacaoSchema,
  reinicioParalisacaoSchema,
  type CriarParalisacaoInput,
  type Paralisacao,
  type ReinicioParalisacaoInput,
} from "@/core/schemas/contratos/contrato_schema";
import type ServerActionResult from "@/core/types/server_action_result";

function fail(error: unknown): ServerActionResult<never> {
  if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
  if (error instanceof HttpClientException) {
    return { success: false, data: null, error: obraErrorTranslator.translate(error) };
  }
  throw error;
}

export async function listParalisacoesAction(
  obraId: string,
  contratoId: string,
): Promise<ServerActionResult<Paralisacao[]>> {
  try {
    const res = await api.auth.get<Paralisacao[]>(`/api/contratos/${contratoId}/paralisacoes`, {
      next: { tags: [`obra-${obraId}-paralisacoes`] },
    });
    const raw = res.data as unknown;
    return { success: true, data: Array.isArray(raw) ? raw : [], error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<Paralisacao[]>;
  }
}

export async function criarParalisacaoAction(
  obraId: string,
  contratoId: string,
  input: CriarParalisacaoInput,
): Promise<ServerActionResult<Paralisacao>> {
  const parsed = criarParalisacaoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.post<Paralisacao>(`/api/contratos/${contratoId}/paralisacoes`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    updateTag(`obra-${obraId}-paralisacoes`);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function reiniciarParalisacaoAction(
  obraId: string,
  paralisacaoId: string,
  input: ReinicioParalisacaoInput,
): Promise<ServerActionResult<void>> {
  const parsed = reinicioParalisacaoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    await api.auth.post(`/api/paralisacoes/${paralisacaoId}/reinicio`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    updateTag(`obra-${obraId}-paralisacoes`);
    return { success: true, data: undefined as void, error: null };
  } catch (error) {
    return fail(error);
  }
}
