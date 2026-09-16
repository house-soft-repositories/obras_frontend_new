"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import {
  atualizarPagamentoSchema,
  criarPagamentoSchema,
  type AtualizarPagamentoInput,
  type CriarPagamentoInput,
  type Pagamento,
  type PagamentoComAlerta,
  pagamentoListResponseSchema,
} from "@/core/schemas/financeiro";
import type ServerActionResult from "@/core/types/server_action_result";
import { fail, tagFinanceiro } from "./utils";

function toCriarPagamentoBody(input: CriarPagamentoInput) {
  return {
    empenhoId: input.empenhoId,
    liquidacaoId: input.liquidacaoId,
    fonteId: input.fonteId,
    numeroOrdemBancaria: input.numeroOrdemBancaria,
    dataOrdemBancaria: input.dataOrdemBancaria,
    valor: input.valor,
    observacoes: input.observacoes?.trim() || undefined,
  };
}

function toAtualizarPagamentoBody(input: AtualizarPagamentoInput) {
  return {
    fonteId: input.fonteId,
    numeroOrdemBancaria: input.numeroOrdemBancaria,
    dataOrdemBancaria: input.dataOrdemBancaria,
    valor: input.valor,
    observacoes: input.observacoes?.trim() || undefined,
  };
}

export async function listPagamentosAction(
  obraId: string,
): Promise<ServerActionResult<Pagamento[]>> {
  try {
    const res = await api.auth.get<unknown>(
      `/api/obras/${obraId}/pagamentos?page=1&take=200&order=DESC`,
      { next: { tags: [tagFinanceiro(obraId)] } },
    );
    const parsed = pagamentoListResponseSchema.parse(res.data);
    const pagamentos = Array.isArray(parsed)
      ? parsed
      : "data" in parsed
        ? parsed.data
        : parsed.items;
    return { success: true, data: pagamentos, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<Pagamento[]>;
  }
}

export async function criarPagamentoAction(
  obraId: string,
  input: CriarPagamentoInput,
): Promise<ServerActionResult<PagamentoComAlerta>> {
  const parsed = criarPagamentoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const res = await api.auth.post<PagamentoComAlerta>(
      `/api/obras/${obraId}/pagamentos`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toCriarPagamentoBody(parsed.data)),
      },
    );
    updateTag(tagFinanceiro(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function atualizarPagamentoAction(
  obraId: string,
  pagamentoId: string,
  input: AtualizarPagamentoInput,
): Promise<ServerActionResult<Pagamento>> {
  const parsed = atualizarPagamentoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  try {
    const res = await api.auth.patch<Pagamento>(
      `/api/obras/${obraId}/pagamentos/${pagamentoId}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toAtualizarPagamentoBody(parsed.data)),
      },
    );
    updateTag(tagFinanceiro(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function deletePagamentoAction(
  obraId: string,
  pagamentoId: string,
): Promise<ServerActionResult<null>> {
  try {
    await api.auth.delete(`/api/obras/${obraId}/pagamentos/${pagamentoId}`);
    updateTag(tagFinanceiro(obraId));
    return { success: true, data: null, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<null>;
  }
}
