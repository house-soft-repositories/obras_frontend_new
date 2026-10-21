"use server";

import api from "@/core/rest_client/api";
import type { ObraPrivada } from "@/core/schemas/obras-privadas/obra_privada_schema";
import type Pagination from "@/core/types/pagination/pagination";
import type ServerActionResult from "@/core/types/server_action_result";
import { obraPrivadaErrorTranslator } from "@/core/errors/obra_privada_error_translator";

export interface ListObrasPrivadasParams {
  page?: number;
  take?: number;
  order?: "ASC" | "DESC";
  q?: string;
  situacaoAlvara?: string;
  andamento?: string;
  habiteSe?: string;
}

export default async function listObrasPrivadasAction(
  params: ListObrasPrivadasParams,
): Promise<ServerActionResult<Pagination<ObraPrivada>>> {
  try {
    const usp = new URLSearchParams();
    if (params.page) usp.set("page", String(params.page));
    if (params.take) usp.set("take", String(params.take));
    if (params.order) usp.set("order", params.order);
    if (params.q) usp.set("busca", params.q);
    if (params.situacaoAlvara) usp.set("situacaoAlvara", params.situacaoAlvara);
    if (params.andamento) usp.set("andamento", params.andamento);
    if (params.habiteSe) usp.set("habiteSe", params.habiteSe);
    const qs = usp.toString() ? `?${usp.toString()}` : "";
    const res = await api.auth.get<Pagination<ObraPrivada>>(
      `/api/obras-privadas${qs}`,
      {
        next: { tags: ["list-obras-privadas"] },
      },
    );
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
      error: obraPrivadaErrorTranslator.translate(error),
    };
  }
}
