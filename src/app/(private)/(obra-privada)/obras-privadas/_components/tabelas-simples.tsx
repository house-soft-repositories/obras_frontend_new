"use client";

import Link from "next/link";
import { DataTable } from "@/core/ui/atoms/data-table";
import {
  ANDAMENTO_LABELS,
  HABITE_SE_LABELS,
  RESULTADO_FISCALIZACAO_LABELS,
  SITUACAO_ALVARA_LABELS,
  SITUACAO_AUTO_INFRACAO_LABELS,
  TIPO_ALVARA_LABELS,
  TIPO_AUTO_INFRACAO_LABELS,
  TIPO_FISCALIZACAO_LABELS,
  type AutoGlobalPrivado,
  type FiscalizacaoGlobalPrivada,
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

export function AutosTable({ data }: { data: AutoGlobalPrivado[] }) {
  return (
    <DataTable<AutoGlobalPrivado>
      title="Autos de fiscalização"
      data={data}
      getRowId={(auto) => auto.id}
      renderCardTitle={(auto) => text(auto.numero)}
      renderCardStatus={(auto) =>
        label(SITUACAO_AUTO_INFRACAO_LABELS, auto.situacao)
      }
      columns={[
        {
          id: "obra",
          header: "Obra",
          cell: (auto) => (
            <ObraLink
              id={auto.obraPrivadaId}
              codigo={auto.obraCodigo}
              endereco={auto.obraEndereco}
            />
          ),
        },
        { id: "numero", header: "Auto", cell: (auto) => text(auto.numero) },
        {
          id: "tipo",
          header: "Tipo",
          cell: (auto) => label(TIPO_AUTO_INFRACAO_LABELS, auto.tipo),
        },
        {
          id: "situacao",
          header: "Situação",
          cell: (auto) => label(SITUACAO_AUTO_INFRACAO_LABELS, auto.situacao),
        },
        {
          id: "emissao",
          header: "Emissão",
          cell: (auto) => formatDate(auto.dataEmissao),
        },
        {
          id: "limite",
          header: "Limite",
          cell: (auto) => formatDate(auto.dataLimite),
        },
      ]}
    />
  );
}

export function FiscalizacoesTable({
  data,
}: {
  data: FiscalizacaoGlobalPrivada[];
}) {
  return (
    <DataTable<FiscalizacaoGlobalPrivada>
      title="Visitas de fiscalização"
      data={data}
      getRowId={(fiscalizacao) => fiscalizacao.id}
      renderCardTitle={(fiscalizacao) => text(fiscalizacao.numero)}
      renderCardStatus={(fiscalizacao) =>
        label(RESULTADO_FISCALIZACAO_LABELS, fiscalizacao.resultado)
      }
      columns={[
        {
          id: "obra",
          header: "Obra",
          cell: (fiscalizacao) => (
            <ObraLink
              id={fiscalizacao.obraPrivadaId}
              codigo={fiscalizacao.obraCodigo}
              endereco={fiscalizacao.obraEndereco}
            />
          ),
        },
        {
          id: "numero",
          header: "Fiscalização",
          cell: (fiscalizacao) => text(fiscalizacao.numero),
        },
        {
          id: "data",
          header: "Data",
          cell: (fiscalizacao) => formatDate(fiscalizacao.dataFiscalizacao),
        },
        {
          id: "tipo",
          header: "Tipo",
          cell: (fiscalizacao) =>
            label(TIPO_FISCALIZACAO_LABELS, fiscalizacao.tipo),
        },
        {
          id: "resultado",
          header: "Resultado",
          cell: (fiscalizacao) =>
            label(RESULTADO_FISCALIZACAO_LABELS, fiscalizacao.resultado),
        },
        {
          id: "etapa",
          header: "Etapa",
          cell: (fiscalizacao) =>
            label(ANDAMENTO_LABELS, fiscalizacao.etapaConstatada),
        },
      ]}
    />
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
