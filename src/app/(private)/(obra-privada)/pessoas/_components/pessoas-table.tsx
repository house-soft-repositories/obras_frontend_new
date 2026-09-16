"use client";

import { DataTable } from "@/core/ui/atoms/data-table";
import { PessoaType } from "@/core/schemas/pessoa/pessoa_schema";
import PageMeta from "@/core/types/pagination/page_meta";

const tipoLabels: Record<PessoaType["tipo"], string> = {
  FISICA: "Pessoa física",
  JURIDICA: "Pessoa jurídica",
};

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

export function PessoasTable({ data, meta }: { data: PessoaType[]; meta: PageMeta }) {
  return (
    <DataTable<PessoaType>
      title="Pessoas cadastradas"
      data={data}
      getRowId={(pessoa) => pessoa.id}
      renderCardTitle={(pessoa) => pessoa.nome}
      renderCardStatus={(pessoa) => (pessoa.ativo ? "Ativo" : "Inativo")}
      pageSize={meta.take}
      columns={[
        { id: "nome", header: "Nome", cell: (pessoa) => pessoa.nome },
        {
          id: "tipo",
          header: "Tipo",
          cell: (pessoa) => tipoLabels[pessoa.tipo] ?? pessoa.tipo,
        },
        { id: "documento", header: "CPF/CNPJ", cell: (pessoa) => pessoa.documento },
        {
          id: "email",
          header: "E-mail",
          cell: (pessoa) => formatNullable(pessoa.email),
        },
        {
          id: "telefone",
          header: "Telefone",
          cell: (pessoa) => formatNullable(pessoa.telefone),
        },
        {
          id: "status",
          header: "Status",
          cell: (pessoa) => (pessoa.ativo ? "Ativo" : "Inativo"),
        },
      ]}
    />
  );
}
