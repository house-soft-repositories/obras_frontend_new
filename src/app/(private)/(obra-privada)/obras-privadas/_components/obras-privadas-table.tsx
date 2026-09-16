"use client";

import Link from "next/link";
import { DataTable } from "@/core/ui/atoms/data-table";
import {
  ANDAMENTO_LABELS,
  HABITE_SE_LABELS,
  SITUACAO_ALVARA_LABELS,
  type ObraPrivada,
} from "@/core/schemas/obras-privadas/obra_privada_schema";

function text(value: unknown, fallback = "—") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function label(map: Record<string, string>, value: unknown) {
  return typeof value === "string" && value && map[value]
    ? map[value]
    : text(value);
}

function endereco(obra: ObraPrivada) {
  const parts = [obra.logradouro, obra.numero, obra.bairro].filter(
    (part) => typeof part === "string" && part.trim(),
  );
  return parts.length > 0 ? parts.join(", ") : "—";
}

export function ObrasPrivadasTable({ data }: { data: ObraPrivada[] }) {
  return (
    <DataTable<ObraPrivada>
      title="Obras privadas cadastradas"
      data={data}
      getRowId={(obra) => obra.id}
      renderCardTitle={(obra) => text(obra.descricao)}
      renderCardStatus={(obra) => label(SITUACAO_ALVARA_LABELS, obra.situacaoAlvara)}
      columns={[
        {
          id: "descricao",
          header: "Obra",
          cell: (obra) => (
            <div>
              <Link
                className="font-semibold hover:underline"
                href={`/obras-privadas/${obra.id}`}
              >
                {text(obra.descricao)}
              </Link>
              <div className="text-xs text-muted">{text(obra.codigo)}</div>
            </div>
          ),
        },
        {
          id: "proprietario",
          header: "Proprietário",
          cell: (obra) => text(obra.proprietarioNome),
        },
        {
          id: "endereco",
          header: "Endereço",
          cell: (obra) => endereco(obra),
        },
        {
          id: "alvara",
          header: "Alvará",
          cell: (obra) => label(SITUACAO_ALVARA_LABELS, obra.situacaoAlvara),
        },
        {
          id: "andamento",
          header: "Andamento",
          cell: (obra) => label(ANDAMENTO_LABELS, obra.andamento),
        },
        {
          id: "habiteSe",
          header: "Habite-se",
          cell: (obra) => label(HABITE_SE_LABELS, obra.habiteSe),
        },
      ]}
    />
  );
}
