"use client";

import { DataTable } from "@/components/ui/data-table";
import { SubtipologiaSchema } from "@/core/schemas/cadastros/subtipologia_schema";
import PageMeta from "@/core/types/pagination/page_meta";

export function SubtipologiasTable({ data, meta }: { data: SubtipologiaSchema[]; meta: PageMeta }) {
  return (
    <DataTable<SubtipologiaSchema>
      title="Subtipologias cadastradas"
      data={data}
      getRowId={(item) => item.id}
      renderCardTitle={(item) => item.nome}
      renderCardStatus={(item) => (item.ativo ? "Ativo" : "Inativo")}
      pageSize={meta.take}
      columns={[
        { id: "nome", header: "Nome", cell: (item) => item.nome },
        { id: "status", header: "Status", cell: (item) => (item.ativo ? "Ativo" : "Inativo") },
      ]}
    />
  );
}
