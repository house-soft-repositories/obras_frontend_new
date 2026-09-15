"use client";

import { DataTable } from "@/core/ui/atoms/data-table";
import { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import PageMeta from "@/core/types/pagination/page_meta";

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

export function LocalidadesTable({
  data,
  meta,
}: {
  data: LocalidadeSchema[];
  meta: PageMeta;
}) {
  return (
    <DataTable<LocalidadeSchema>
      title="Localidades cadastradas"
      data={data}
      getRowId={(localidade) => localidade.id}
      renderCardTitle={(localidade) => localidade.nome}
      pageSize={meta.take}
      columns={[
        { id: "nome", header: "Nome", cell: (localidade) => localidade.nome },
        { id: "uf", header: "UF", cell: (localidade) => localidade.uf },
        {
          id: "tipo",
          header: "Tipo",
          cell: (localidade) => localidade.tipo,
        },
        {
          id: "municipio",
          header: "Município",
          cell: (localidade) => formatNullable(localidade.municipio),
        },
        {
          id: "codigoIbge",
          header: "Código IBGE",
          cell: (localidade) => formatNullable(localidade.codigoIbge),
        },
      ]}
    />
  );
}
