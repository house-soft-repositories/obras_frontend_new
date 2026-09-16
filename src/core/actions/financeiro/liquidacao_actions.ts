"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import {
  atualizarLiquidacaoSchema,
  criarLiquidacaoSchema,
  type AtualizarLiquidacaoInput,
  type CriarLiquidacaoInput,
  type Liquidacao,
  liquidacaoListResponseSchema,
} from "@/core/schemas/financeiro";
import type ServerActionResult from "@/core/types/server_action_result";
import { fail, tagFinanceiro } from "./utils";

function toLiquidacaoBody(input: CriarLiquidacaoInput | AtualizarLiquidacaoInput) {
  return {
    empenhoId: input.empenhoId,
    fonteId: input.fonteId,
    numero: input.numero,
    dataLiquidacao: input.dataLiquidacao,
    valor: input.valor,
    observacoes: input.observacoes?.trim() || undefined,
  };
}

export async function listLiquidacoesAction(
  obraId: string,
): Promise<ServerActionResult<Liquidacao[]>> {
  try {
    const res = await api.auth.get<unknown>(
      `/api/obras/${obraId}/liquidacoes?page=1&take=50&order=DESC`,
      { next: { tags: [tagFinanceiro(obraId)] } },
    );
    const parsed = liquidacaoListResponseSchema.parse(res.data);
    const liquidacoes = Array.isArray(parsed)
      ? parsed
      : "data" in parsed
        ? parsed.data
        : parsed.items;
    return { success: true, data: liquidacoes, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<Liquidacao[]>;
  }
}

export async function criarLiquidacaoAction(
  obraId: string,
  input: CriarLiquidacaoInput,
): Promise<ServerActionResult<Liquidacao>> {
  const parsed = criarLiquidacaoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const res = await api.auth.post<Liquidacao>(
      `/api/obras/${obraId}/liquidacoes`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toLiquidacaoBody(parsed.data)),
      },
    );
    updateTag(tagFinanceiro(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function atualizarLiquidacaoAction(
  obraId: string,
  liquidacaoId: string,
  input: AtualizarLiquidacaoInput,
): Promise<ServerActionResult<Liquidacao>> {
  const parsed = atualizarLiquidacaoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const res = await api.auth.patch<Liquidacao>(
      `/api/obras/${obraId}/liquidacoes/${liquidacaoId}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toLiquidacaoBody(parsed.data)),
      },
    );
    updateTag(tagFinanceiro(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function deleteLiquidacaoAction(
  obraId: string,
  liquidacaoId: string,
): Promise<ServerActionResult<null>> {
  try {
    await api.auth.delete(`/api/obras/${obraId}/liquidacoes/${liquidacaoId}`);
    updateTag(tagFinanceiro(obraId));
    return { success: true, data: null, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<null>;
  }
}
