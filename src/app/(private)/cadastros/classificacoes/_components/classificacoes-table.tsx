"use client";

import { DataTable } from "@/components/ui/data-table";
import { ClassificacaoSchema } from "@/core/schemas/cadastros/classificacao_schema";
import PageMeta from "@/core/types/pagination/page_meta";

export function ClassificacoesTable({ data, meta }: { data: ClassificacaoSchema[]; meta: PageMeta }) {
  return (
    <DataTable<ClassificacaoSchema>
      title="Classificações cadastradas"
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
