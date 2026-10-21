"use server";

import api from "@/core/rest_client/api";
import type { Obra } from "@/core/schemas/obras/obra_schema";
import type Pagination from "@/core/types/pagination/pagination";
import type ServerActionResult from "@/core/types/server_action_result";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";

export interface ListObrasParams {
  page?: number;
  take?: number;
  order?: "ASC" | "DESC";
  status?: string;
  tipo?: string;
  orgaoId?: string;
  q?: string;
}

export default async function listObrasAction(
  params: ListObrasParams,
): Promise<ServerActionResult<Pagination<Obra>>> {
  try {
    const usp = new URLSearchParams();
    if (params.page) usp.set("page", String(params.page));
    if (params.take) usp.set("take", String(params.take));
    if (params.order) usp.set("order", params.order);
    if (params.status) usp.set("status", params.status);
    if (params.tipo) usp.set("tipo", params.tipo);
    if (params.orgaoId) usp.set("orgaoId", params.orgaoId);
    if (params.q) usp.set("q", params.q);
    const qs = usp.toString() ? `?${usp.toString()}` : "";
    const res = await api.auth.get<Pagination<Obra>>(`/api/obras${qs}`, {
      next: { tags: ["list-obras"] },
    });
    const data = res.data.data.filter((obra) => !obra.deletedAt);
    return {
      success: true,
      data: {
        data,
        meta: res.data.meta,
      },
      error: null,
    };
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "digest" in error &&
      typeof (error as { digest?: unknown }).digest === "string" &&
      (error as { digest?: string }).digest!.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    return {
      success: false,
      data: null,
      error: obraErrorTranslator.translate(error),
    };
  }
}
