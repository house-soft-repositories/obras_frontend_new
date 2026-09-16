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

function ObraCell({ obra }: { obra: ObraPrivada }) {
  return (
    <div>
      <Link
        className="font-semibold hover:underline"
        href={`/obras-privadas/${obra.id}`}
      >
        {text(obra.descricao)}
      </Link>
      <div className="text-xs text-muted">{text(obra.codigo)}</div>
    </div>
  );
}

function SimNao({ value }: { value: boolean | undefined }) {
  return value ? "Sim" : "Não";
}

export function AutosTable({ data }: { data: ObraPrivada[] }) {
  const filtradas = data.filter((obra) => obra.autuada || obra.embargada);
  return (
    <DataTable<ObraPrivada>
      title="Autos de fiscalização"
      data={filtradas}
      getRowId={(obra) => obra.id}
      renderCardTitle={(obra) => text(obra.descricao)}
      renderCardStatus={(obra) =>
        [obra.autuada ? "Autuada" : null, obra.embargada ? "Embargada" : null]
          .filter(Boolean)
          .join(" · ") || "—"
      }
      columns={[
        { id: "obra", header: "Obra", cell: (obra) => <ObraCell obra={obra} /> },
        { id: "autuada", header: "Autuada", cell: (obra) => <SimNao value={obra.autuada} /> },
        { id: "embargada", header: "Embargada", cell: (obra) => <SimNao value={obra.embargada} /> },
        {
          id: "alvara",
          header: "Alvará",
          cell: (obra) => label(SITUACAO_ALVARA_LABELS, obra.situacaoAlvara),
        },
      ]}
    />
  );
}

export function FiscalizacoesTable({ data }: { data: ObraPrivada[] }) {
  const filtradas = data.filter((obra) => obra.fiscalizada);
  return (
    <DataTable<ObraPrivada>
      title="Visitas de fiscalização"
      data={filtradas}
      getRowId={(obra) => obra.id}
      renderCardTitle={(obra) => text(obra.descricao)}
      renderCardStatus={(obra) => text(obra.etapaAtual)}
      columns={[
        { id: "obra", header: "Obra", cell: (obra) => <ObraCell obra={obra} /> },
        {
          id: "ultimaVisita",
          header: "Última visita",
          cell: (obra) => text(obra.ultimaVisitaEm),
        },
        {
          id: "etapa",
          header: "Etapa atual",
          cell: (obra) => text(obra.etapaAtual),
        },
        {
          id: "andamento",
          header: "Andamento",
          cell: (obra) => label(ANDAMENTO_LABELS, obra.andamento),
        },
      ]}
    />
  );
}

export function LicenciamentoTable({ data }: { data: ObraPrivada[] }) {
  return (
    <DataTable<ObraPrivada>
      title="Situação de licenciamento"
      data={data}
      getRowId={(obra) => obra.id}
      renderCardTitle={(obra) => text(obra.descricao)}
      renderCardStatus={(obra) =>
        label(SITUACAO_ALVARA_LABELS, obra.situacaoAlvara)
      }
      columns={[
        { id: "obra", header: "Obra", cell: (obra) => <ObraCell obra={obra} /> },
        {
          id: "alvara",
          header: "Alvará",
          cell: (obra) => label(SITUACAO_ALVARA_LABELS, obra.situacaoAlvara),
        },
        {
          id: "habiteSe",
          header: "Habite-se",
          cell: (obra) => label(HABITE_SE_LABELS, obra.habiteSe),
        },
        {
          id: "proprietario",
          header: "Proprietário",
          cell: (obra) => text(obra.proprietarioNome),
        },
      ]}
    />
  );
}

export function MapaTable({ data }: { data: ObraPrivada[] }) {
  const comCoordenadas = data.filter(
    (obra) =>
      typeof (obra as Record<string, unknown>).latitude === "string" &&
      ((obra as Record<string, unknown>).latitude as string).trim() &&
      typeof (obra as Record<string, unknown>).longitude === "string" &&
      ((obra as Record<string, unknown>).longitude as string).trim(),
  );
  return (
    <DataTable<ObraPrivada>
      title="Obras georreferenciadas"
      data={comCoordenadas}
      getRowId={(obra) => obra.id}
      renderCardTitle={(obra) => text(obra.descricao)}
      renderCardStatus={(obra) =>
        text((obra as Record<string, unknown>).latitude)
      }
      columns={[
        { id: "obra", header: "Obra", cell: (obra) => <ObraCell obra={obra} /> },
        {
          id: "endereco",
          header: "Endereço",
          cell: (obra) =>
          [obra.logradouro, obra.numero, obra.bairro]
            .filter((part) => typeof part === "string" && part.trim())
            .join(", ") || "—",
        },
        {
          id: "latitude",
          header: "Latitude",
          cell: (obra) =>
            text((obra as Record<string, unknown>).latitude),
        },
        {
          id: "longitude",
          header: "Longitude",
          cell: (obra) =>
            text((obra as Record<string, unknown>).longitude),
        },
      ]}
    />
  );
}
