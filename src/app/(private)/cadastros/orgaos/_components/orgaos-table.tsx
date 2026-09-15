"use client";

import { DataTable } from "@/core/ui/atoms/data-table";
import { OrgaoSchema } from "@/core/schemas/orgaos/orgao_schema";
import PageMeta from "@/core/types/pagination/page_meta";

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

export function OrgaosTable({
  data,
  meta,
}: {
  data: OrgaoSchema[];
  meta: PageMeta;
}) {
  return (
    <DataTable<OrgaoSchema>
      title="Órgãos cadastrados"
      data={data}
      getRowId={(orgao) => orgao.id}
      renderCardTitle={(orgao) => orgao.nome}
      renderCardStatus={(orgao) => (orgao.ativo ? "Ativo" : "Inativo")}
      pageSize={meta.take}
      columns={[
        { id: "nome", header: "Nome", cell: (orgao) => orgao.nome },
        {
          id: "sigla",
          header: "Sigla",
          cell: (orgao) => formatNullable(orgao.sigla),
        },
        {
          id: "tipo",
          header: "Tipo",
          cell: (orgao) => formatNullable(orgao.tipo),
        },
        {
          id: "responsavel",
          header: "Responsável",
          cell: (orgao) => formatNullable(orgao.responsavel),
        },
        {
          id: "status",
          header: "Status",
          cell: (orgao) => (orgao.ativo ? "Ativo" : "Inativo"),
        },
      ]}
    />
  );
}
