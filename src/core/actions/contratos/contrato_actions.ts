"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import {
  atualizarContratoSchema,
  criarContratoSchema,
  type AtualizarContratoInput,
  type Contrato,
  type CriarContratoInput,
  type PrazoFinal,
  type ValoresContrato,
} from "@/core/schemas/contratos/contrato_schema";
import type ServerActionResult from "@/core/types/server_action_result";

const tagContrato = (obraId: string) => `obra-${obraId}-contrato`;

function toPayload(input: CriarContratoInput | AtualizarContratoInput) {
  const out: Record<string, unknown> = { ...(input as Record<string, unknown>) };
  for (const key of ["objeto", "dataAssinatura", "fimVigencia", "prazoExecucaoData"]) {
    if (out[key] === "") delete out[key];
  }
  if (out.prazoExecucaoDias === undefined) delete out.prazoExecucaoDias;
  return out;
}

function fail(error: unknown): ServerActionResult<never> {
  if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
  if (error instanceof HttpClientException) {
    return { success: false, data: null, error: obraErrorTranslator.translate(error) };
  }
  throw error;
}

// TODO(backend): GET /api/contratos não aceita filtro por obraId; a action
// lista com take amplo e filtra por obraId no client. Quando o backend
// expuser /api/obras/:obraId/contrato, trocar por essa rota.
export async function getContratoDaObraAction(
  obraId: string,
): Promise<ServerActionResult<Contrato | null>> {
  try {
    const res = await api.auth.get<{ data: Contrato[] }>(
      `/api/contratos?page=1&take=50&order=DESC`,
      { next: { tags: [tagContrato(obraId)] } },
    );
    const raw = res.data as unknown as { data?: Contrato[] } | Contrato[];
    const lista = Array.isArray(raw) ? raw : (raw.data ?? []);
    const contrato = lista.find((c) => c.obraId === obraId) ?? null;
    return { success: true, data: contrato, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<Contrato | null>;
  }
}

export async function criarContratoAction(
  input: CriarContratoInput,
): Promise<ServerActionResult<Contrato>> {
  const parsed = criarContratoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.post<Contrato>("/api/contratos", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(parsed.data)),
    });
    updateTag(tagContrato(parsed.data.obraId));
    updateTag(`obra-${parsed.data.obraId}`);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function atualizarContratoAction(
  obraId: string,
  contratoId: string,
  input: AtualizarContratoInput,
): Promise<ServerActionResult<Contrato>> {
  const parsed = atualizarContratoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.patch<Contrato>(`/api/contratos/${contratoId}`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(parsed.data)),
    });
    updateTag(tagContrato(obraId));
    updateTag(`obra-${obraId}`);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function getPrazoFinalAction(
  contratoId: string,
): Promise<ServerActionResult<PrazoFinal | null>> {
  try {
    const res = await api.auth.get<PrazoFinal>(`/api/contratos/${contratoId}/prazo-final`);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<PrazoFinal | null>;
  }
}

export async function getValoresContratoAction(
  contratoId: string,
): Promise<ServerActionResult<ValoresContrato>> {
  try {
    const res = await api.auth.get<ValoresContrato>(`/api/contratos/${contratoId}/valores`);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}
