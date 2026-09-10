"use server";

import api from "@/core/rest_client/api";
import { TenantType } from "@/core/schemas/tenants/tenant_schema";

export default async function listTenanciesAction(): Promise<TenantType[]> {
  const response = await api.auth.get<TenantType[]>("/api/tenancies", {
    next: { tags: ["list-tenancies"] },
  });
  return response.data
}
