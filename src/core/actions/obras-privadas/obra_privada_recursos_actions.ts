"use server";

import api from "@/core/rest_client/api";
import type {
  AlvaraPrivado,
  ArquivoPrivado,
  AutoGlobalPrivado,
  AutoInfracaoPrivado,
  FiscalizacaoGlobalPrivada,
  FiscalizacaoPrivada,
  HabiteSePrivado,
  LicenciamentoPrivado,
  ObservacaoPrivada,
  Paginated,
  ResponsavelPrivado,
} from "@/core/schemas/obras-privadas/obra_privada_schema";

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

async function getArray<T>(url: string, tag: string): Promise<T[]> {
  try {
    const res = await api.auth.get<T[]>(url, { next: { tags: [tag] } });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export async function listAlvarasObraPrivadaAction(obraPrivadaId: string) {
  return getArray<AlvaraPrivado>(
    `/api/obras-privadas/${obraPrivadaId}/alvaras`,
    `obra-privada-${obraPrivadaId}-alvaras`,
  );
}

export async function listFiscalizacoesObraPrivadaAction(
  obraPrivadaId: string,
) {
  return getArray<FiscalizacaoPrivada>(
    `/api/obras-privadas/${obraPrivadaId}/fiscalizacoes`,
    `obra-privada-${obraPrivadaId}-fiscalizacoes`,
  );
}

export async function listAutosObraPrivadaAction(obraPrivadaId: string) {
  return getArray<AutoInfracaoPrivado>(
    `/api/obras-privadas/${obraPrivadaId}/autos`,
    `obra-privada-${obraPrivadaId}-autos`,
  );
}

export async function listHabiteSeObraPrivadaAction(obraPrivadaId: string) {
  return getArray<HabiteSePrivado>(
    `/api/obras-privadas/${obraPrivadaId}/habite-se`,
    `obra-privada-${obraPrivadaId}-habite-se`,
  );
}

export async function listResponsaveisObraPrivadaAction(obraPrivadaId: string) {
  return getArray<ResponsavelPrivado>(
    `/api/obras-privadas/${obraPrivadaId}/responsaveis`,
    `obra-privada-${obraPrivadaId}-responsaveis`,
  );
}

export async function listObservacoesObraPrivadaAction(obraPrivadaId: string) {
  return getArray<ObservacaoPrivada>(
    `/api/obras-privadas/${obraPrivadaId}/observacoes`,
    `obra-privada-${obraPrivadaId}-observacoes`,
  );
}

export async function listArquivosObraPrivadaAction(
  obraPrivadaId: string,
  params: { vinculo?: string; vinculoId?: string; categoria?: string } = {},
) {
  return getArray<ArquivoPrivado>(
    `/api/obras-privadas/${obraPrivadaId}/arquivos${qs(params)}`,
    `obra-privada-${obraPrivadaId}-arquivos`,
  );
}

export async function listTimelineObraPrivadaAction(obraPrivadaId: string) {
  return getArray<Record<string, unknown>>(
    `/api/obras-privadas/${obraPrivadaId}/timeline`,
    `obra-privada-${obraPrivadaId}-timeline`,
  );
}

export async function listFiscalizacoesGlobaisPrivadasAction(params: {
  page?: number;
  take?: number;
  order?: "ASC" | "DESC";
  busca?: string;
  tipo?: string;
  resultado?: string;
}): Promise<Paginated<FiscalizacaoGlobalPrivada>> {
  try {
    const take = params.take ?? 50;
    const res = await api.auth.get<Paginated<FiscalizacaoGlobalPrivada>>(
      `/api/obras-privadas/fiscalizacoes${qs({ ...params, take })}`,
      { next: { tags: ["list-obras-privadas-fiscalizacoes"] } },
    );
    return normalizePage<FiscalizacaoGlobalPrivada>(res.data, take);
  } catch {
    return { data: [], meta: { ...FALLBACK_META } };
  }
}

export async function listAutosGlobaisPrivadasAction(params: {
  page?: number;
  take?: number;
  order?: "ASC" | "DESC";
  busca?: string;
  tipo?: string;
  situacao?: string;
  vencidos?: boolean;
}): Promise<Paginated<AutoGlobalPrivado>> {
  try {
    const take = params.take ?? 50;
    const res = await api.auth.get<Paginated<AutoGlobalPrivado>>(
      `/api/obras-privadas/autos${qs({ ...params, take })}`,
      { next: { tags: ["list-obras-privadas-autos"] } },
    );
    return normalizePage<AutoGlobalPrivado>(res.data, take);
  } catch {
    return { data: [], meta: { ...FALLBACK_META } };
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
