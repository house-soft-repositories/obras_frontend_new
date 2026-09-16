"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import {
  criarMedicaoSchema,
  type CriarMedicaoInput,
  type Medicao,
} from "@/core/schemas/cronograma/medicao_schema";
import type ServerActionResult from "@/core/types/server_action_result";

const tagMedicoes = (obraId: string) => `obra-${obraId}-medicoes`;

function fail(error: unknown): ServerActionResult<never> {
  if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
  if (error instanceof HttpClientException) {
    return { success: false, data: null, error: obraErrorTranslator.translate(error) };
  }
  throw error;
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
