"use client";

import { DataTable } from "@/core/ui/atoms/data-table";
import { EmpresaSchema } from "@/core/schemas/empresas/empresa_schema";
import PageMeta from "@/core/types/pagination/page_meta";

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

export function EmpresasTable({ data, meta }: { data: EmpresaSchema[]; meta: PageMeta }) {
  return (
    <DataTable<EmpresaSchema>
      title="Empresas cadastradas"
      data={data}
      getRowId={(empresa) => empresa.id}
      renderCardTitle={(empresa) => empresa.razaoSocial}
      renderCardStatus={(empresa) => (empresa.ativo ? "Ativo" : "Inativo")}
      pageSize={meta.take}
      columns={[
        { id: "razaoSocial", header: "Razão social", cell: (empresa) => empresa.razaoSocial },
        { id: "cnpj", header: "CNPJ", cell: (empresa) => empresa.cnpj },
        {
          id: "nomeFantasia",
          header: "Nome fantasia",
          cell: (empresa) => formatNullable(empresa.nomeFantasia),
        },
        {
          id: "responsavel",
          header: "Responsável",
          cell: (empresa) => formatNullable(empresa.responsavel),
        },
        {
          id: "email",
          header: "E-mail",
          cell: (empresa) => formatNullable(empresa.email),
        },
        {
          id: "status",
          header: "Status",
          cell: (empresa) => (empresa.ativo ? "Ativo" : "Inativo"),
        },
      ]}
    />
  );
}
