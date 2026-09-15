"use client";

import { DataTable } from "@/core/ui/atoms/data-table";
import { EixoSchema } from "@/core/schemas/cadastros/eixo_schema";
import PageMeta from "@/core/types/pagination/page_meta";

export function EixosTable({ data, meta }: { data: EixoSchema[]; meta: PageMeta }) {
  return (
    <DataTable<EixoSchema>
      title="Eixos cadastrados"
      data={data}
      getRowId={(eixo) => eixo.id}
      renderCardTitle={(eixo) => eixo.nome}
      renderCardStatus={(eixo) => (eixo.ativo ? "Ativo" : "Inativo")}
      pageSize={meta.take}
      columns={[
        { id: "nome", header: "Nome", cell: (eixo) => eixo.nome },
        { id: "status", header: "Status", cell: (eixo) => (eixo.ativo ? "Ativo" : "Inativo") },
      ]}
    />
  );
}
