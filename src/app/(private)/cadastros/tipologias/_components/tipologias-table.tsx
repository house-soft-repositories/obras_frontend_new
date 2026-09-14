"use client";

import { DataTable } from "@/components/ui/data-table";
import { TipologiaSchema } from "@/core/schemas/cadastros/tipologia_schema";
import PageMeta from "@/core/types/pagination/page_meta";

export function TipologiasTable({ data, meta }: { data: TipologiaSchema[]; meta: PageMeta }) {
  return (
    <DataTable<TipologiaSchema>
      title="Tipologias cadastradas"
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
