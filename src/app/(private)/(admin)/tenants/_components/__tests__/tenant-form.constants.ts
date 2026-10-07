import type { CreateTenantInput } from "@/core/schemas/tenants/create_tenant_schema";

export const TENANT_FORM_EXPECTED_FIELDS = [
  "name",
  "slug",
  "cnpj",
] as const satisfies ReadonlyArray<keyof CreateTenantInput>;

export const TENANT_FORM_REQUIRED_FIELDS = [
  "name",
  "slug",
  "cnpj",
] as const satisfies ReadonlyArray<keyof CreateTenantInput>;

export const TENANT_FORM_ALL_INPUT_KEYS: ReadonlyArray<keyof CreateTenantInput> = [
  "name",
  "slug",
  "cnpj",
];

export const TENANT_FORM_EXPECTED_LABELS = [
  "Nome",
  "Slug",
  "CNPJ",
] as const;
