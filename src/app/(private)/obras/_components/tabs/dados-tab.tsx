"use client";

import { Body, Caption } from "@/core/ui/atoms/typography";
import type { Obra } from "@/core/schemas/obras/obra_schema";
import {
  TIPO_OBRA_LABELS,
  TIPO_OBRA_VALUES,
  type TipoObra,
} from "@/core/schemas/obras/tipo_obra";

const text = (value: unknown, fallback = "—") =>
  typeof value === "string" && value.trim() ? value : fallback;

const isTipoObra = (value: unknown): value is TipoObra =>
  typeof value === "string" &&
  (TIPO_OBRA_VALUES as readonly string[]).includes(value);

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function InfoCard({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <section
      data-slot="info-card"
      className="overflow-hidden rounded-app border border-border bg-surface"
    >
      <h3 className="border-b border-border px-4 py-3 font-display text-lg leading-6 font-semibold">
        {title}
      </h3>
      <dl className="m-0">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[minmax(120px,1fr)_1.3fr] gap-4 border-b border-border px-4 py-2.5 text-[13px] last:border-0"
          >
            <dt className="text-muted">{label}</dt>
            <dd className="m-0 font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function DadosTab({ obra }: { obra: Obra }) {
  const extra = obra as Obra & Record<string, unknown>;
  const orgao =
    typeof extra.orgao === "object" && extra.orgao !== null
      ? text((extra.orgao as { nome?: unknown }).nome)
      : text(extra.orgaoNome);

  return (
    <div role="tabpanel" className="grid gap-4 p-5">
      <div>
        <Body className="font-semibold">{text(obra.nome, "Obra sem nome")}</Body>
        <Caption>
          Código {text(obra.codigo)} · Tipo{" "}
          {isTipoObra(obra.tipo) ? TIPO_OBRA_LABELS[obra.tipo] : text(obra.tipo)}{" "}
          · Situação {text(obra.status)}
        </Caption>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <InfoCard
          title="Identificação"
          rows={[
            ["Código", text(obra.codigo)],
            ["Nome", text(obra.nome, "Obra sem nome")],
            [
              "Tipo",
              isTipoObra(obra.tipo)
                ? TIPO_OBRA_LABELS[obra.tipo]
                : text(obra.tipo),
            ],
            ["Situação", text(obra.status)],
            ["Órgão", orgao],
          ]}
        />
        <InfoCard
          title="Prazos"
          rows={[
            ["Início", formatDate(extra.dataInicio)],
            ["Prazo", formatDate(extra.dataPrazo ?? extra.dataFim)],
            ["Data pactuada", formatDate(extra.dataPactuada)],
            ["Descrição", text(extra.descricao)],
          ]}
        />
      </div>
    </div>
  );
}
