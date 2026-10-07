import type { CreateTenantInput, CreateTenantOutput } from "@/core/schemas/tenants/create_tenant_schema";

export const TENANT_UUIDS = {
  tenantId: "550e8400-e29b-41d4-a716-446655440000",
} as const;

export type TenantFormOption = { id: string; name: string };

export const mockTenantOptions: Record<string, TenantFormOption[]> = {};

export const mockTenantCompleto: CreateTenantInput = {
  name: "Prefeitura Municipal",
  slug: "prefeitura-municipal",
  cnpj: "12.345.678/0001-90",
};

export const mockTenantCompletoOutput: CreateTenantOutput = {
  name: "Prefeitura Municipal",
  slug: "prefeitura-municipal",
  cnpj: "12345678000190",
};

export const mockTenantMinimo: CreateTenantInput = {
  name: "Prefeitura Municipal",
  slug: "prefeitura-municipal",
  cnpj: "",
};

export function buildTenantMock(
  override: Partial<CreateTenantInput> = {},
): CreateTenantInput {
  return {
    ...mockTenantCompleto,
    ...override,
  };
}
