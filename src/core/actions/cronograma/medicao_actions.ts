"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import {
  atualizarMedicaoSchema,
  criarMedicaoSchema,
  type AtualizarMedicaoInput,
  type CriarMedicaoInput,
  type Medicao,
} from "@/core/schemas/cronograma/medicao_schema";
import type ServerActionResult from "@/core/types/server_action_result";

const tagMedicoes = (obraId: string) => `obra-${obraId}-medicoes`;

function fail(error: unknown): ServerActionResult<never> {
  if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
    throw error;
  if (error instanceof HttpClientException) {
    return {
      success: false,
      data: null,
      error: obraErrorTranslator.translate(error),
    };
  }
  throw error;
}

function clean(input: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...input };
  for (const [k, v] of Object.entries(out)) {
    if (v === "" || v === undefined) delete out[k];
  }
  return out;
}

export async function listMedicoesAction(
  obraId: string,
): Promise<ServerActionResult<Medicao[]>> {
  try {
    const res = await api.auth.get<{ data: Medicao[] } | Medicao[]>(
      `/api/obras/${obraId}/medicoes?page=1&take=50&order=DESC`,
      { next: { tags: [tagMedicoes(obraId)] } },
    );
    const raw = res.data as unknown as { data?: Medicao[] } | Medicao[];
    const lista = Array.isArray(raw) ? raw : (raw.data ?? []);
    return { success: true, data: lista, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<Medicao[]>;
  }
}

export async function criarMedicaoAction(
  obraId: string,
  input: CriarMedicaoInput,
): Promise<ServerActionResult<Medicao>> {
  const parsed = criarMedicaoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.post<Medicao>(`/api/obras/${obraId}/medicoes`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    updateTag(tagMedicoes(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function getMedicaoAction(
  obraId: string,
  medicaoId: string,
): Promise<ServerActionResult<Medicao>> {
  try {
    const res = await api.auth.get<Medicao>(
      `/api/obras/${obraId}/medicoes/${medicaoId}`,
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function atualizarMedicaoAction(
  obraId: string,
  medicaoId: string,
  input: AtualizarMedicaoInput,
): Promise<ServerActionResult<Medicao>> {
  const parsed = atualizarMedicaoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.patch<Medicao>(
      `/api/obras/${obraId}/medicoes/${medicaoId}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          clean(parsed.data as unknown as Record<string, unknown>),
        ),
      },
    );
    updateTag(tagMedicoes(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function excluirMedicaoAction(
  obraId: string,
  medicaoId: string,
): Promise<ServerActionResult<void>> {
  try {
    await api.auth.delete(`/api/obras/${obraId}/medicoes/${medicaoId}`);
    updateTag(tagMedicoes(obraId));
    return { success: true, data: undefined as void, error: null };
  } catch (error) {
    return fail(error);
  }
}
