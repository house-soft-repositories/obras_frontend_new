"use client";

import { DataTable } from "@/core/ui/atoms/data-table";
import { FonteSchema } from "@/core/schemas/fontes/fonte_schema";
import PageMeta from "@/core/types/pagination/page_meta";

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

export function FontesTable({
  data,
  meta,
}: {
  data: FonteSchema[];
  meta: PageMeta;
}) {
  return (
    <DataTable<FonteSchema>
      title="Fontes cadastradas"
      data={data}
      getRowId={(fonte) => fonte.id}
      renderCardTitle={(fonte) => fonte.nome}
      renderCardStatus={(fonte) => (fonte.ativo ? "Ativo" : "Inativo")}
      pageSize={meta.take}
      columns={[
        { id: "nome", header: "Nome", cell: (fonte) => fonte.nome },
        { id: "codigo", header: "Código", cell: (fonte) => formatNullable(fonte.codigo) },
        { id: "tipo", header: "Tipo", cell: (fonte) => formatNullable(fonte.tipo) },
        { id: "valorPrevisto", header: "Valor previsto", cell: (fonte) => formatNullable(fonte.valorPrevisto) },
        { id: "vigencia", header: "Vigência", cell: (fonte) => formatNullable(fonte.vigencia) },
        { id: "status", header: "Status", cell: (fonte) => (fonte.ativo ? "Ativo" : "Inativo") },
      ]}
    />
  );
}
