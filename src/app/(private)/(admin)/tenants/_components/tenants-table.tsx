"use client";

import { DataTable } from "@/core/ui/atoms/data-table";
import type { TenantType } from "@/core/schemas/tenants/tenant_schema";

function formatCnpj(cnpj: string | null) {
  if (!cnpj) return "—";
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TenantsTable({ tenants }: { tenants: TenantType[] }) {
  return (
    <DataTable<TenantType>
      title="Tenants cadastrados"
      data={tenants}
      getRowId={(tenant) => tenant.id}
      renderCardTitle={(tenant) => tenant.name}
      renderCardStatus={(tenant) => (tenant.active ? "Ativo" : "Inativo")}
      pageSize={10}
      columns={[
        { id: "name", header: "Nome", cell: (tenant) => tenant.name },
        { id: "slug", header: "Slug", cell: (tenant) => tenant.slug },
        {
          id: "cnpj",
          header: "CNPJ",
          cell: (tenant) => formatCnpj(tenant.cnpj),
        },
        {
          id: "active",
          header: "Status",
          cell: (tenant) => (tenant.active ? "Ativo" : "Inativo"),
        },
        {
          id: "createdAt",
          header: "Criado em",
          cell: (tenant) => formatDate(tenant.createdAt),
        },
      ]}
    />
  );
}
