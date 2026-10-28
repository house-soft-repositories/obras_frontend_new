"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import HttpClientException from "@/core/exceptions/http_client_exception";
import { obraPrivadaErrorTranslator } from "@/core/errors/obra_privada_error_translator";
import type {
  AlvaraPrivado,
  ArquivoPrivado,
  AutoInfracaoPrivado,
  FiscalizacaoPrivada,
  HabiteSePrivado,
  LicenciamentoPrivado,
  ObservacaoPrivada,
  Paginated,
  ResponsavelPrivado,
} from "@/core/schemas/obras-privadas/obra_privada_schema";
import {
  criarAlvaraSchema,
  criarAutoSchema,
  criarFiscalizacaoSchema,
  criarHabiteSeSchema,
  toCriarAlvaraPayload,
  toCriarAutoPayload,
  toCriarFiscalizacaoPayload,
  toCriarHabiteSePayload,
  type CriarAlvaraInput,
  type CriarAutoInput,
  type CriarFiscalizacaoInput,
  type CriarHabiteSeInput,
} from "@/core/schemas/obras-privadas/create_obra_privada_recursos_schema";
import type ServerActionResult from "@/core/types/server_action_result";
import {
  baixarResponsavelObraPrivadaSchema,
  criarResponsavelObraPrivadaSchema,
  type BaixarResponsavelObraPrivadaInput,
  type CriarResponsavelObraPrivadaInput,
} from "@/core/schemas/obras-privadas/obra_privada_responsavel_schema";
import { confirmarUploadArquivoObraPrivadaAction } from "@/core/actions/obras-privadas/obra_privada_arquivo_actions";
import {
  categoriaPorMime,
  type UploadPreparado,
} from "@/core/schemas/obras-privadas/obra_privada_arquivo_schema";

const FALLBACK_META = {
  page: 1,
  take: 20,
  itemCount: 0,
  pageCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

function qs(
  params: Record<string, string | number | boolean | undefined | null>,
) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      usp.set(key, String(value));
    }
  });
  return usp.toString() ? `?${usp.toString()}` : "";
}

function normalizePage<T>(raw: unknown, take = 20): Paginated<T> {
  if (Array.isArray(raw)) {
    return {
      data: raw as T[],
      meta: { ...FALLBACK_META, take, itemCount: raw.length, pageCount: 1 },
    };
  }
  const obj = raw as {
    data?: T[];
    items?: T[];
    total?: number;
    meta?: Paginated<T>["meta"];
  };
  const data = obj.data ?? obj.items ?? [];
  return {
    data,
    meta: obj.meta ?? {
      ...FALLBACK_META,
      take,
      itemCount: obj.total ?? data.length,
      pageCount: 1,
    },
  };
}

export async function listAlvarasObraPrivadaAction(
  obraPrivadaId: string,
): Promise<ServerActionResult<AlvaraPrivado[]>> {
  try {
    const res = await api.auth.get<AlvaraPrivado[]>(
      `/api/obras-privadas/${obraPrivadaId}/alvaras`,
      { next: { tags: [`obra-privada-${obraPrivadaId}-alvaras`] } },
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: obraPrivadaErrorTranslator.translate(error),
      };
    }
    throw error;
  }
}

export async function listFiscalizacoesObraPrivadaAction(
  obraPrivadaId: string,
): Promise<ServerActionResult<FiscalizacaoPrivada[]>> {
  try {
    const res = await api.auth.get<FiscalizacaoPrivada[]>(
      `/api/obras-privadas/${obraPrivadaId}/fiscalizacoes`,
      { next: { tags: [`obra-privada-${obraPrivadaId}-fiscalizacoes`] } },
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: obraPrivadaErrorTranslator.translate(error) };
    }
    throw error;
  }
}

export async function listAutosObraPrivadaAction(
  obraPrivadaId: string,
): Promise<ServerActionResult<AutoInfracaoPrivado[]>> {
  try {
    const res = await api.auth.get<AutoInfracaoPrivado[]>(
      `/api/obras-privadas/${obraPrivadaId}/autos`,
      { next: { tags: [`obra-privada-${obraPrivadaId}-autos`] } },
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: obraPrivadaErrorTranslator.translate(error) };
    }
    throw error;
  }
}

export async function listHabiteSeObraPrivadaAction(
  obraPrivadaId: string,
): Promise<ServerActionResult<HabiteSePrivado[]>> {
  try {
    const res = await api.auth.get<HabiteSePrivado[]>(
      `/api/obras-privadas/${obraPrivadaId}/habite-se`,
      { next: { tags: [`obra-privada-${obraPrivadaId}-habite-se`] } },
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: obraPrivadaErrorTranslator.translate(error) };
    }
    throw error;
  }
}

export async function listResponsaveisObraPrivadaAction(
  obraPrivadaId: string,
): Promise<ServerActionResult<ResponsavelPrivado[]>> {
  try {
    const res = await api.auth.get<ResponsavelPrivado[]>(
      `/api/obras-privadas/${obraPrivadaId}/responsaveis`,
      { next: { tags: [`obra-privada-${obraPrivadaId}-responsaveis`] } },
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: obraPrivadaErrorTranslator.translate(error) };
    }
    throw error;
  }
}

export async function createResponsavelObraPrivadaAction(
  obraPrivadaId: string,
  input: CriarResponsavelObraPrivadaInput,
): Promise<ServerActionResult<ResponsavelPrivado>> {
  const parsed = criarResponsavelObraPrivadaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const res = await api.auth.post<ResponsavelPrivado>(
      `/api/obras-privadas/${obraPrivadaId}/responsaveis`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    updateTag(`obra-privada-${obraPrivadaId}-responsaveis`);
    updateTag(`obra-privada-${obraPrivadaId}-timeline`);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      success: false,
      data: null,
      error: obraPrivadaErrorTranslator.translate(error),
    };
  }
}

export async function baixarResponsavelObraPrivadaAction(
  obraPrivadaId: string,
  responsavelId: string,
  input: BaixarResponsavelObraPrivadaInput,
): Promise<ServerActionResult<ResponsavelPrivado>> {
  const parsed = baixarResponsavelObraPrivadaSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      data: null,
      error: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  try {
    const res = await api.auth.patch<ResponsavelPrivado>(
      `/api/obras-privadas/${obraPrivadaId}/responsaveis/${responsavelId}`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    updateTag(`obra-privada-${obraPrivadaId}-responsaveis`);
    updateTag(`obra-privada-${obraPrivadaId}-timeline`);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      success: false,
      data: null,
      error: obraPrivadaErrorTranslator.translate(error),
    };
  }
}

export async function createObservacaoObraPrivadaAction(
  obraPrivadaId: string,
  texto: string,
): Promise<ServerActionResult<ObservacaoPrivada>> {
  const value = texto.trim();
  if (!value) return { success: false, data: null, error: "Informe a observação." };

  try {
    const res = await api.auth.post<ObservacaoPrivada>(
      `/api/obras-privadas/${obraPrivadaId}/observacoes`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ texto: value }),
      },
    );
    updateTag(`obra-privada-${obraPrivadaId}-observacoes`);
    updateTag(`obra-privada-${obraPrivadaId}-timeline`);
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    return { success: false, data: null, error: obraPrivadaErrorTranslator.translate(error) };
  }
}

export async function listObservacoesObraPrivadaAction(
  obraPrivadaId: string,
): Promise<ServerActionResult<ObservacaoPrivada[]>> {
  try {
    const res = await api.auth.get<ObservacaoPrivada[]>(
      `/api/obras-privadas/${obraPrivadaId}/observacoes`,
      { next: { tags: [`obra-privada-${obraPrivadaId}-observacoes`] } },
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: obraPrivadaErrorTranslator.translate(error) };
    }
    throw error;
  }
}

export async function listArquivosObraPrivadaAction(
  obraPrivadaId: string,
  params: { vinculo?: string; vinculoId?: string; categoria?: string } = {},
): Promise<ServerActionResult<ArquivoPrivado[]>> {
  try {
    const res = await api.auth.get<ArquivoPrivado[]>(
      `/api/obras-privadas/${obraPrivadaId}/arquivos${qs(params)}`,
      { next: { tags: [`obra-privada-${obraPrivadaId}-arquivos`] } },
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) throw error;
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: obraPrivadaErrorTranslator.translate(error) };
    }
    throw error;
  }
}

export type TimelineObraPrivadaItem = {
  id: string;
  tipo:
    | "ALVARA"
    | "FISCALIZACAO"
    | "AUTO_INFRACAO"
    | "HABITE_SE"
    | "OBSERVACAO"
    | "ARQUIVO";
  data: string;
  titulo: string;
  situacao: string | null;
  observacoes: string | null;
};

export async function listTimelineObraPrivadaAction(
  obraPrivadaId: string,
): Promise<ServerActionResult<TimelineObraPrivadaItem[]>> {
  try {
    const res = await api.auth.get<TimelineObraPrivadaItem[]>(
      `/api/obras-privadas/${obraPrivadaId}/timeline`,
      { next: { tags: [`obra-privada-${obraPrivadaId}-timeline`] } },
    );
    return {
      success: true,
      data: res.data,
      error: null,
    };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      success: false,
      data: null,
      error: obraPrivadaErrorTranslator.translate(error),
    };
  }
}

export async function listLicenciamentoPrivadasAction(params: {
  page?: number;
  take?: number;
  order?: "ASC" | "DESC";
  busca?: string;
  situacaoAlvara?: string;
  habiteSe?: string;
  vencendoEmDias?: number;
}): Promise<Paginated<LicenciamentoPrivado>> {
  try {
    const take = params.take ?? 50;
    const res = await api.auth.get<Paginated<LicenciamentoPrivado>>(
      `/api/obras-privadas/licenciamento${qs({ ...params, take })}`,
      { next: { tags: ["list-obras-privadas-licenciamento"] } },
    );
    return normalizePage<LicenciamentoPrivado>(res.data, take);
  } catch {
    return { data: [], meta: { ...FALLBACK_META } };
  }
}

function translateRecursoError(error: unknown, fallback: string): string {
  if (error instanceof HttpClientException) {
    return obraPrivadaErrorTranslator.translate(error);
  }
  return fallback;
}

function revalidateRecursoTags(obraPrivadaId: string, recurso: string) {
  updateTag(`obra-privada-${obraPrivadaId}-${recurso}`);
  updateTag(`obra-privada-${obraPrivadaId}-timeline`);
}

export type AlvaraCriado = AlvaraPrivado & {
  arquivoUpload?: UploadPreparado;
};

export type HabiteSeCriado = HabiteSePrivado & {
  arquivoUpload?: UploadPreparado;
};

function metadataArquivoDoFile(file: File): Record<string, unknown> {
  return {
    nomeOriginal: file.name,
    categoria: categoriaPorMime(file.type || "application/octet-stream"),
    ...(file.type ? { mimeType: file.type } : {}),
  };
}

/**
 * Envia o binário para a URL pré-assinada devolvida na criação e confirma o
 * upload. O recurso já foi criado neste ponto; em falha retorna mensagem
 * orientando novo anexo pela aba de arquivos (sem recriar o recurso).
 */
async function enviarEConfirmarArquivoCriacao(
  obraPrivadaId: string,
  recursoLabel: string,
  upload: UploadPreparado,
  file: File,
): Promise<string | null> {
  const contentType = file.type || "application/octet-stream";
  let resposta: Response;
  try {
    resposta = await fetch(upload.urlUpload, {
      method: "PUT",
      body: file,
      headers: { "content-type": contentType },
    });
  } catch {
    return (
      `${recursoLabel} registrado, mas não foi possível enviar o arquivo ` +
      `para o armazenamento. Anexe novamente pela aba de arquivos.`
    );
  }
  if (!resposta.ok) {
    return (
      `${recursoLabel} registrado, mas o envio do arquivo falhou ` +
      `(HTTP ${resposta.status}). Anexe novamente pela aba de arquivos.`
    );
  }
  const confirmado = await confirmarUploadArquivoObraPrivadaAction(
    obraPrivadaId,
    upload.arquivoId,
    {
      tamanhoBytes: file.size,
      ...(file.type ? { mimeType: file.type } : {}),
    },
  );
  if (!confirmado.success) {
    return (
      `${recursoLabel} registrado e arquivo enviado, mas não foi possível ` +
      `confirmar o upload (${confirmado.error}).`
    );
  }
  return null;
}

export async function createAlvaraObraPrivadaAction(
  obraPrivadaId: string,
  input: CriarAlvaraInput,
  file?: File,
): Promise<ServerActionResult<AlvaraCriado>> {
  const payload = toCriarAlvaraPayload(input);
  if (file && !payload.arquivo) {
    payload.arquivo = metadataArquivoDoFile(file);
  }
  const parsed = criarAlvaraSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }

  try {
    const res = await api.auth.post<AlvaraCriado>(
      `/api/obras-privadas/${obraPrivadaId}/alvaras`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    revalidateRecursoTags(obraPrivadaId, "alvaras");
    updateTag("list-obras-privadas-licenciamento");
    if (file && res.data.arquivoUpload?.urlUpload) {
      const falha = await enviarEConfirmarArquivoCriacao(
        obraPrivadaId,
        "O alvará foi",
        res.data.arquivoUpload,
        file,
      );
      if (falha) return { success: false, data: null, error: falha };
    }
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: translateRecursoError(
          error,
          "Não foi possível registrar o alvará. Os dados foram preservados.",
        ),
      };
    }
    throw error;
  }
}

export async function createHabiteSeObraPrivadaAction(
  obraPrivadaId: string,
  input: CriarHabiteSeInput,
  file?: File,
): Promise<ServerActionResult<HabiteSeCriado>> {
  const payload = toCriarHabiteSePayload(input);
  if (file && !payload.arquivo) {
    payload.arquivo = metadataArquivoDoFile(file);
  }
  const parsed = criarHabiteSeSchema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }

  try {
    const res = await api.auth.post<HabiteSeCriado>(
      `/api/obras-privadas/${obraPrivadaId}/habite-se`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    revalidateRecursoTags(obraPrivadaId, "habite-se");
    updateTag("list-obras-privadas-licenciamento");
    if (file && res.data.arquivoUpload?.urlUpload) {
      const falha = await enviarEConfirmarArquivoCriacao(
        obraPrivadaId,
        "O habite-se foi",
        res.data.arquivoUpload,
        file,
      );
      if (falha) return { success: false, data: null, error: falha };
    }
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: translateRecursoError(
          error,
          "Não foi possível registrar o habite-se. Os dados foram preservados.",
        ),
      };
    }
    throw error;
  }
}

export async function createFiscalizacaoObraPrivadaAction(
  obraPrivadaId: string,
  input: CriarFiscalizacaoInput,
): Promise<ServerActionResult<FiscalizacaoPrivada>> {
  const parsed = criarFiscalizacaoSchema.safeParse(
    toCriarFiscalizacaoPayload(input),
  );
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }

  try {
    const res = await api.auth.post<FiscalizacaoPrivada>(
      `/api/obras-privadas/${obraPrivadaId}/fiscalizacoes`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    revalidateRecursoTags(obraPrivadaId, "fiscalizacoes");
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: translateRecursoError(
          error,
          "Não foi possível registrar a fiscalização. Os dados foram preservados.",
        ),
      };
    }
    throw error;
  }
}

export async function createAutoObraPrivadaAction(
  obraPrivadaId: string,
  input: CriarAutoInput,
): Promise<ServerActionResult<AutoInfracaoPrivado>> {
  const parsed = criarAutoSchema.safeParse(toCriarAutoPayload(input));
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Dados inválidos.";
    return { success: false, data: null, error: message };
  }

  try {
    const res = await api.auth.post<AutoInfracaoPrivado>(
      `/api/obras-privadas/${obraPrivadaId}/autos`,
      {
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      },
    );
    revalidateRecursoTags(obraPrivadaId, "autos");
    return { success: true, data: res.data, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: translateRecursoError(
          error,
          "Não foi possível registrar o auto. Os dados foram preservados.",
        ),
      };
    }
    throw error;
  }
}

export async function excluirAutoInfracaoAction(
  obraPrivadaId: string,
  autoId: string,
): Promise<ServerActionResult<void>> {
  try {
    await api.auth.delete(`/api/obras-privadas/${obraPrivadaId}/autos/${autoId}`);
    revalidateRecursoTags(obraPrivadaId, "autos");
    return { success: true, data: undefined, error: null };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: translateRecursoError(
          error,
          "Não foi possível excluir o auto. Tente novamente.",
        ),
      };
    }
    throw error;
  }
}
