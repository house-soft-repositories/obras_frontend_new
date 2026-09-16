"use server";

import api from "@/core/rest_client/api";
import type {
  ObraPrivada,
  ObraPrivadaList,
} from "@/core/schemas/obras-privadas/obra_privada_schema";

export interface ListObrasPrivadasParams {
  page?: number;
  take?: number;
  order?: "ASC" | "DESC";
  q?: string;
  situacaoAlvara?: string;
  andamento?: string;
  habiteSe?: string;
}

const FALLBACK_META = {
  page: 1,
  take: 20,
  itemCount: 0,
  pageCount: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export default async function listObrasPrivadasAction(
  params: ListObrasPrivadasParams,
): Promise<ObraPrivadaList> {
  const usp = new URLSearchParams();
  if (params.page) usp.set("page", String(params.page));
  if (params.take) usp.set("take", String(params.take));
  if (params.order) usp.set("order", params.order);
  if (params.q) usp.set("q", params.q);
  if (params.situacaoAlvara) usp.set("situacaoAlvara", params.situacaoAlvara);
  if (params.andamento) usp.set("andamento", params.andamento);
  if (params.habiteSe) usp.set("habiteSe", params.habiteSe);
  const qs = usp.toString() ? `?${usp.toString()}` : "";
  try {
    const res = await api.auth.get<
      ObraPrivadaList | { data?: ObraPrivada[]; items?: ObraPrivada[]; total?: number } | ObraPrivada[]
    >(`/api/obras-privadas${qs}`, {
      next: { tags: ["list-obras-privadas"] },
    });
    const raw = res.data as unknown;
    if (Array.isArray(raw)) {
      const lista = (raw as ObraPrivada[]).filter((o) => !o.deletedAt);
      return {
        data: lista,
        meta: { ...FALLBACK_META, itemCount: lista.length, pageCount: 1 },
      };
    }
    const obj = raw as {
      data?: ObraPrivada[];
      items?: ObraPrivada[];
      total?: number;
    };
    const lista = ((obj.data ?? obj.items ?? []) as ObraPrivada[]).filter(
      (o) => !o.deletedAt,
    );
    const paginated = obj as unknown as ObraPrivadaList;
    return {
      data: lista,
      meta: paginated.meta ?? {
        ...FALLBACK_META,
        itemCount: obj.total ?? lista.length,
        pageCount: 1,
      },
    };
  } catch {
    return { data: [], meta: { ...FALLBACK_META } };
  }
}
