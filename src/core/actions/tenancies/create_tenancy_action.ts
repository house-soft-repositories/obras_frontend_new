"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import type { TenantType } from "@/core/schemas/tenants/tenant_schema";
import type { CreateTenantOutput } from "@/core/schemas/tenants/create_tenant_schema";
import ServerActionResult from "@/core/types/server_action_result";
import { tenancyErrorTranslator } from "@/core/errors/tenancy_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";

export default async function createTenancyAction(
  input: CreateTenantOutput,
): Promise<ServerActionResult<TenantType>> {
  try {
    const response = await api.auth.post<TenantType>("/api/tenancies", {
      body: JSON.stringify(input),
      headers: {
        "Content-Type": "application/json",
      },
    });
    updateTag("list-tenancies");
    return { success: true, data: response.data, error: null };
  } catch (error) {
    if (error instanceof HttpClientException) {
      const message = tenancyErrorTranslator.translate(error);
      return { success: false, data: null, error: message };
    }
    throw error;
  }
}
