"use server";

import api from "@/core/rest_client/api";
import type { VisaoFisicoFinanceira } from "@/core/schemas/financeiro";
import type ServerActionResult from "@/core/types/server_action_result";
import { fail, tagFinanceiro } from "./utils";

export async function getVisaoFisicoFinanceiraAction(
  obraId: string,
): Promise<ServerActionResult<VisaoFisicoFinanceira | null>> {
  try {
    const res = await api.auth.get<VisaoFisicoFinanceira>(
      `/api/obras/${obraId}/visao-fisico-financeira`,
      { next: { tags: [tagFinanceiro(obraId)] } },
    );
    return { success: true, data: res.data, error: null };
  } catch (error) {
    return fail(error) as ServerActionResult<VisaoFisicoFinanceira | null>;
  }
}
