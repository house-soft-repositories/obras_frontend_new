"use client";

import { DataTable } from "@/core/ui/atoms/data-table";
import { SubclassificacaoSchema } from "@/core/schemas/cadastros/subclassificacao_schema";
import PageMeta from "@/core/types/pagination/page_meta";

export function SubclassificacoesTable({ data, meta }: { data: SubclassificacaoSchema[]; meta: PageMeta }) {
  return (
    <DataTable<SubclassificacaoSchema>
      title="Subclassificações cadastradas"
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
