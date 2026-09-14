"use client";

import { DataTable } from "@/components/ui/data-table";
import { SetorWithOrgaoSchema } from "@/core/schemas/setores/setor_schema";
import PageMeta from "@/core/types/pagination/page_meta";

export function SetoresTable({
  data,
  meta,
}: {
  data: SetorWithOrgaoSchema[];
  meta: PageMeta;
}) {
  return (
    <DataTable<SetorWithOrgaoSchema>
      title="Setores cadastrados"
      data={data}
      getRowId={(setor) => setor.id}
      renderCardTitle={(setor) => setor.nome}
      renderCardStatus={(setor) => (setor.ativo ? "Ativo" : "Inativo")}
      pageSize={meta.take}
      columns={[
        { id: "nome", header: "Nome", cell: (setor) => setor.nome },
        { id: "orgao", header: "Órgão", cell: (setor) => setor.orgao.nome },
        {
          id: "status",
          header: "Status",
          cell: (setor) => (setor.ativo ? "Ativo" : "Inativo"),
        },
      ]}
    />
  );
}
