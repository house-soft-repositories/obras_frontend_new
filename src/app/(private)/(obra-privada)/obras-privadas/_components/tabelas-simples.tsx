"use client";

import Link from "next/link";
import { DataTable } from "@/core/ui/atoms/data-table";
import {
  HABITE_SE_LABELS,
  SITUACAO_ALVARA_LABELS,
  TIPO_ALVARA_LABELS,
  type LicenciamentoPrivado,
  type ObraPrivada,
} from "@/core/schemas/obras-privadas/obra_privada_schema";

function text(value: unknown, fallback = "—") {
  if (typeof value === "number") return String(value);
  return typeof value === "string" && value.trim() ? value : fallback;
}

function label(map: Record<string, string>, value: unknown) {
  return typeof value === "string" && value && map[value]
    ? map[value]
    : text(value);
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const [date] = value.split("T");
  const parts = date.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
}

function ObraLink({
  id,
  codigo,
  endereco,
}: {
  id: string;
  codigo?: unknown;
  endereco?: unknown;
}) {
  return (
    <div>
      <Link
        className="font-semibold hover:underline"
        href={`/obras-privadas/${id}`}
      >
        {text(codigo, "Obra privada")}
      </Link>
      <div className="text-xs text-muted">{text(endereco)}</div>
    </div>
  );
}

export function LicenciamentoTable({ data }: { data: LicenciamentoPrivado[] }) {
  return (
    <DataTable<LicenciamentoPrivado>
      title="Situação de licenciamento"
      data={data}
      getRowId={(item) => item.obraPrivadaId}
      renderCardTitle={(item) => text(item.obraCodigo)}
      renderCardStatus={(item) =>
        label(SITUACAO_ALVARA_LABELS, item.situacaoAlvara)
      }
      columns={[
        {
          id: "obra",
          header: "Obra",
          cell: (item) => (
            <ObraLink
              id={item.obraPrivadaId}
              codigo={item.obraCodigo}
              endereco={item.obraEndereco}
            />
          ),
        },
        {
          id: "proprietario",
          header: "Proprietário",
          cell: (item) => text(item.proprietarioNome),
        },
        {
          id: "alvara",
          header: "Alvará",
          cell: (item) => text(item.alvaraNumero),
        },
        {
          id: "tipo",
          header: "Tipo",
          cell: (item) => label(TIPO_ALVARA_LABELS, item.alvaraTipo),
        },
        {
          id: "situacao",
          header: "Situação",
          cell: (item) => label(SITUACAO_ALVARA_LABELS, item.situacaoAlvara),
        },
        {
          id: "validade",
          header: "Validade",
          cell: (item) => formatDate(item.alvaraDataValidade),
        },
        {
          id: "habiteSe",
          header: "Habite-se",
          cell: (item) => label(HABITE_SE_LABELS, item.habiteSe),
        },
      ]}
    />
  );
}

export function MapaTable({ data }: { data: ObraPrivada[] }) {
  const comCoordenadas = data.filter(
    (obra) => {
      const raw = obra as Record<string, unknown>;
      const latitude = String(raw.latitude ?? "").trim();
      const longitude = String(raw.longitude ?? "").trim();
      return (
        latitude !== "" &&
        longitude !== "" &&
        Number.isFinite(Number(latitude.replace(",", "."))) &&
        Number.isFinite(Number(longitude.replace(",", ".")))
      );
    },
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
        {
          id: "obra",
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
          cell: (obra) => text((obra as Record<string, unknown>).latitude),
        },
        {
          id: "longitude",
          header: "Longitude",
          cell: (obra) => text((obra as Record<string, unknown>).longitude),
        },
      ]}
    />
  );
}
