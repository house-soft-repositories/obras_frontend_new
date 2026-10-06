"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import {
  atualizarAcompanhamentoSchema,
  atualizarComentarioSchema,
  atualizarEstagioSchema,
  criarAcompanhamentoSchema,
  criarComentarioSchema,
  criarEstagioSchema,
  type AtualizarAcompanhamentoInput,
  type AtualizarComentarioInput,
  type AtualizarEstagioInput,
  type CriarComentarioInput,
  type CriarAcompanhamentoInput,
  type CriarEstagioInput,
  type EstagioAcompanhamento,
  type EstagioComentario,
  type Estagio,
} from "@/core/schemas/cronograma/estagio_schema";
import type ServerActionResult from "@/core/types/server_action_result";

const tagEstagios = (obraId: string) => `obra-${obraId}-estagios`;

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

export async function listEstagiosAction(
  obraId: string,
): Promise<ServerActionResult<Estagio[]>> {
  try {
    const res = await api.auth.get<{ data: Estagio[] } | Estagio[]>(
      `/api/obras/${obraId}/estagios?page=1&take=50&order=ASC`,
      { next: { tags: [tagEstagios(obraId)] } },
    );
    const raw = res.data as unknown as { data?: Estagio[] } | Estagio[];
    const lista = Array.isArray(raw) ? raw : (raw.data ?? []);
    return { success: true, data: lista, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<Estagio[]>;
  }
}

export async function criarEstagioAction(
  obraId: string,
  input: CriarEstagioInput,
): Promise<ServerActionResult<Estagio>> {
  const parsed = criarEstagioSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.post<Estagio>(`/api/obras/${obraId}/estagios`, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(
        clean(parsed.data as unknown as Record<string, unknown>),
      ),
    });
    updateTag(tagEstagios(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function atualizarEstagioAction(
  obraId: string,
  estagioId: string,
  input: AtualizarEstagioInput,
): Promise<ServerActionResult<Estagio>> {
  const parsed = atualizarEstagioSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.patch<Estagio>(
      `/api/obras/${obraId}/estagios/${estagioId}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          clean(parsed.data as unknown as Record<string, unknown>),
        ),
      },
    );
    updateTag(tagEstagios(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function excluirEstagioAction(
  obraId: string,
  estagioId: string,
): Promise<ServerActionResult<void>> {
  try {
    await api.auth.delete(`/api/obras/${obraId}/estagios/${estagioId}`);
    updateTag(tagEstagios(obraId));
    return { success: true, data: undefined as void, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function criarAcompanhamentoAction(
  obraId: string,
  estagioId: string,
  input: CriarAcompanhamentoInput,
): Promise<ServerActionResult<EstagioAcompanhamento>> {
  const parsed = criarAcompanhamentoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.post<EstagioAcompanhamento>(
      `/api/obras/${obraId}/estagios/${estagioId}/acompanhamentos`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          clean(parsed.data as unknown as Record<string, unknown>),
        ),
      },
    );
    updateTag(tagEstagios(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function getAcompanhamentoAction(
  obraId: string,
  estagioId: string,
  acompanhamentoId: string,
): Promise<ServerActionResult<EstagioAcompanhamento>> {
  try {
    const res = await api.auth.get<EstagioAcompanhamento>(
      `/api/obras/${obraId}/estagios/${estagioId}/acompanhamentos/${acompanhamentoId}`,
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function atualizarAcompanhamentoAction(
  obraId: string,
  estagioId: string,
  acompanhamentoId: string,
  input: AtualizarAcompanhamentoInput,
): Promise<ServerActionResult<EstagioAcompanhamento>> {
  const parsed = atualizarAcompanhamentoSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.patch<EstagioAcompanhamento>(
      `/api/obras/${obraId}/estagios/${estagioId}/acompanhamentos/${acompanhamentoId}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          clean(parsed.data as unknown as Record<string, unknown>),
        ),
      },
    );
    updateTag(tagEstagios(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function excluirAcompanhamentoAction(
  obraId: string,
  estagioId: string,
  acompanhamentoId: string,
): Promise<ServerActionResult<void>> {
  try {
    await api.auth.delete(
      `/api/obras/${obraId}/estagios/${estagioId}/acompanhamentos/${acompanhamentoId}`,
    );
    updateTag(tagEstagios(obraId));
    return { success: true, data: undefined as void, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function criarComentarioAction(
  obraId: string,
  estagioId: string,
  input: CriarComentarioInput,
): Promise<ServerActionResult<EstagioComentario>> {
  const parsed = criarComentarioSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.post<EstagioComentario>(
      `/api/obras/${obraId}/estagios/${estagioId}/comentarios`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          clean(parsed.data as unknown as Record<string, unknown>),
        ),
      },
    );
    updateTag(tagEstagios(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function getComentarioAction(
  obraId: string,
  estagioId: string,
  comentarioId: string,
): Promise<ServerActionResult<EstagioComentario>> {
  try {
    const res = await api.auth.get<EstagioComentario>(
      `/api/obras/${obraId}/estagios/${estagioId}/comentarios/${comentarioId}`,
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function atualizarComentarioAction(
  obraId: string,
  estagioId: string,
  comentarioId: string,
  input: AtualizarComentarioInput,
): Promise<ServerActionResult<EstagioComentario>> {
  const parsed = atualizarComentarioSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }
  try {
    const res = await api.auth.patch<EstagioComentario>(
      `/api/obras/${obraId}/estagios/${estagioId}/comentarios/${comentarioId}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          clean(parsed.data as unknown as Record<string, unknown>),
        ),
      },
    );
    updateTag(tagEstagios(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function excluirComentarioAction(
  obraId: string,
  estagioId: string,
  comentarioId: string,
): Promise<ServerActionResult<void>> {
  try {
    await api.auth.delete(
      `/api/obras/${obraId}/estagios/${estagioId}/comentarios/${comentarioId}`,
    );
    updateTag(tagEstagios(obraId));
    return { success: true, data: undefined as void, error: null };
  } catch (error) {
    return fail(error);
  }
}

export async function assumirEstagioAction(
  obraId: string,
  estagioId: string,
): Promise<ServerActionResult<Estagio>> {
  try {
    const res = await api.auth.post<Estagio>(
      `/api/obras/${obraId}/estagios/${estagioId}/assumir`,
    );
    updateTag(tagEstagios(obraId));
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error);
  }
}
