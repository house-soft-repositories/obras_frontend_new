"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import {
  atualizarEmpenhoSchema,
  criarEmpenhoSchema,
  type AtualizarEmpenhoInput,
  type CriarEmpenhoInput,
  type Empenho,
  empenhoListResponseSchema,
} from "@/core/schemas/financeiro";
import type ServerActionResult from "@/core/types/server_action_result";
import { fail, tagFinanceiro } from "./utils";

function toEmpenhoBody(input: CriarEmpenhoInput | AtualizarEmpenhoInput) {
  return {
    fonteId: input.fonteId,
    tipo: input.tipo,
    numero: input.numero,
    dataEmpenho: input.dataEmpenho,
    valor: input.valor,
    observacoes: input.observacoes?.trim() || undefined,
  };
}

export async function listEmpenhosAction(
  obraId: string,
): Promise<ServerActionResult<Empenho[]>> {
  try {
    const res = await api.auth.get<unknown>(
      `/api/obras/${obraId}/empenhos?page=1&take=50&order=DESC`,
      { next: { tags: [tagFinanceiro(obraId)] } },
    );
    const parsed = empenhoListResponseSchema.parse(res.data);
    const empenhos = Array.isArray(parsed)
      ? parsed
      : "data" in parsed
        ? parsed.data
        : parsed.items;
    return { success: true, data: empenhos, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<Empenho[]>;
  }
}

export async function criarEmpenhoAction(
  obraId: string,
  input: CriarEmpenhoInput,
): Promise<ServerActionResult<Empenho>> {
  const parsed = criarEmpenhoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const res = await api.auth.post<Empenho>(`/api/obras/${obraId}/empenhos`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toEmpenhoBody(parsed.data)),
    });
    updateTag(tagFinanceiro(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function atualizarEmpenhoAction(
  obraId: string,
  empenhoId: string,
  input: AtualizarEmpenhoInput,
): Promise<ServerActionResult<Empenho>> {
  const parsed = atualizarEmpenhoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const res = await api.auth.patch<Empenho>(
      `/api/obras/${obraId}/empenhos/${empenhoId}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toEmpenhoBody(parsed.data)),
      },
    );
    updateTag(tagFinanceiro(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteEmpenhoAction(
  obraId: string,
  empenhoId: string,
): Promise<ServerActionResult<null>> {
  try {
    await api.auth.delete(`/api/obras/${obraId}/empenhos/${empenhoId}`);
    updateTag(tagFinanceiro(obraId));
    return { success: true, data: null, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<null>;
  }
}
