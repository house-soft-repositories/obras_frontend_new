"use server";

import api from "@/core/rest_client/api";
import type { Obra, ObraList } from "@/core/schemas/obras/obra_schema";

export interface ListObrasParams {
  page?: number;
  take?: number;
  order?: "ASC" | "DESC";
  status?: string;
  tipo?: string;
  orgaoId?: string;
  q?: string;
}

export default async function listObrasAction(params: ListObrasParams) {
  const usp = new URLSearchParams();
  if (params.page) usp.set("page", String(params.page));
  if (params.take) usp.set("take", String(params.take));
  if (params.order) usp.set("order", params.order);
  if (params.status) usp.set("status", params.status);
  if (params.tipo) usp.set("tipo", params.tipo);
  if (params.orgaoId) usp.set("orgaoId", params.orgaoId);
  if (params.q) usp.set("q", params.q);
  const qs = usp.toString() ? `?${usp.toString()}` : "";
  const res = await api.auth.get<ObraList | { data?: Obra[]; items?: Obra[]; total?: number } | Obra[]>(`/api/obras${qs}`, {
    next: { tags: ["list-obras"] },
  });
  const raw = res.data as unknown;
  if (Array.isArray(raw)) return { data: (raw as Obra[]).filter((o) => !o.deletedAt), meta: { page: params.page ?? 1, take: params.take ?? 20, itemCount: raw.length, pageCount: 1, hasPreviousPage: false, hasNextPage: false } };
  const obj = raw as { data?: Obra[]; items?: Obra[]; total?: number };
  const lista = (obj.data ?? obj.items ?? []) as Obra[];
  const filtrada = lista.filter((o) => !o.deletedAt);
  const paginated = obj as ObraList;
  return { data: filtrada, meta: paginated.meta ?? { page: params.page ?? 1, take: params.take ?? 20, itemCount: obj.total ?? filtrada.length, pageCount: 1, hasPreviousPage: false, hasNextPage: false } };
}
