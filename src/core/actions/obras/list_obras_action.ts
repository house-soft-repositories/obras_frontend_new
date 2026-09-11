"use server";

import api from "@/core/rest_client/api";
import type { ObraResponseDto } from "@/lib/api/obras";

export interface ListObrasParams {
  page?: number;
  limit?: number;
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
  const limit = params.limit ?? params.take;
  if (limit) usp.set("limit", String(limit));
  if (params.order) usp.set("order", params.order);
  if (params.status) usp.set("status", params.status);
  if (params.tipo) usp.set("tipo", params.tipo);
  if (params.orgaoId) usp.set("orgaoId", params.orgaoId);
  if (params.q) usp.set("q", params.q);
  const qs = usp.toString() ? `?${usp.toString()}` : "";
  const res = await api.auth.get<{ data?: ObraResponseDto[]; items?: ObraResponseDto[]; total?: number } | ObraResponseDto[]>(`/api/obras${qs}`, {
    next: { tags: ["list-obras"] },
  });
  const raw = res.data as unknown;
  if (Array.isArray(raw)) return { data: (raw as ObraResponseDto[]).filter((o) => !o.deletedAt), total: (raw as ObraResponseDto[]).filter((o) => !o.deletedAt).length };
  const obj = raw as { data?: ObraResponseDto[]; items?: ObraResponseDto[]; total?: number };
  const lista = (obj.data ?? obj.items ?? []) as ObraResponseDto[];
  const filtrada = lista.filter((o) => !o.deletedAt);
  return { data: filtrada, total: obj.total ?? filtrada.length };
}
