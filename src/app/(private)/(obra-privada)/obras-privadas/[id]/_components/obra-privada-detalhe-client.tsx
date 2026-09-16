"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Camera, FileText, Gavel, MapPin } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import {
  ANDAMENTO_LABELS,
  HABITE_SE_LABELS,
  SITUACAO_ALVARA_LABELS,
  type ObraPrivada,
} from "@/core/schemas/obras-privadas/obra_privada_schema";

type TabId = "dados" | "acompanhamento" | "fiscalizacoes" | "fotos" | "licenciamento";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "dados", label: "Dados" },
  { id: "acompanhamento", label: "Acompanhamento" },
  { id: "fiscalizacoes", label: "Fiscalizações" },
  { id: "fotos", label: "Fotos" },
  { id: "licenciamento", label: "Licenciamento" },
];

function text(value: unknown, fallback = "—") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function label(map: Record<string, string>, value: unknown) {
  return typeof value === "string" && value && map[value]
    ? map[value]
    : text(value);
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-app border border-border p-3">
      <dt className="text-xs text-muted">{rotulo}</dt>
      <dd className="mt-1 font-medium">{valor}</dd>
    </div>
  );
}

export function ObraPrivadaDetalheClient({ obra }: { obra: ObraPrivada }) {
  const [tab, setTab] = useState<TabId>("dados");
  const endereco = [obra.logradouro, obra.numero, obra.bairro]
    .filter((part) => typeof part === "string" && part.trim())
    .join(", ");

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/obras-privadas"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted"
      >
        <ArrowLeft className="size-4" /> Voltar para obras privadas
      </Link>
      <section className="rounded-app border border-border bg-surface p-6">
        <p className="text-sm text-muted">Obra privada {text(obra.codigo)}</p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
          {text(obra.descricao)}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
          <MapPin className="size-4" /> {endereco || "—"} · {text(obra.uf)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            {label(SITUACAO_ALVARA_LABELS, obra.situacaoAlvara)}
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            {label(ANDAMENTO_LABELS, obra.andamento)}
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            Habite-se: {label(HABITE_SE_LABELS, obra.habiteSe)}
          </span>
          {obra.autuada ? (
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-800">
              Autuada
            </span>
          ) : null}
          {obra.embargada ? (
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-800">
              Embargada
            </span>
          ) : null}
        </div>
      </section>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Abas da obra privada">
        {TABS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={tab === item.id ? "primary" : "secondary"}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
      {tab === "dados" ? (
        <section className="mt-5 rounded-app border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">Ficha da obra</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Campo rotulo="Código" valor={text(obra.codigo)} />
            <Campo rotulo="Proprietário" valor={text(obra.proprietarioNome)} />
            <Campo
              rotulo="Documento do proprietário"
              valor={text(obra.proprietarioDocumento)}
            />
            <Campo rotulo="Logradouro" valor={text(obra.logradouro)} />
            <Campo rotulo="Número" valor={text(obra.numero)} />
            <Campo rotulo="Bairro" valor={text(obra.bairro)} />
            <Campo rotulo="UF" valor={text(obra.uf)} />
            <Campo
              rotulo="Inscrição imobiliária"
              valor={text((obra as Record<string, unknown>).inscricaoImobiliaria)}
            />
            <Campo
              rotulo="Matrícula RGI"
              valor={text((obra as Record<string, unknown>).matriculaRgi)}
            />
          </dl>
        </section>
      ) : null}
      {tab === "acompanhamento" ? (
        <section className="mt-5 rounded-app border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">Acompanhamento</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Campo
              rotulo="Etapa atual"
              valor={text(obra.etapaAtual)}
            />
            <Campo
              rotulo="Andamento"
              valor={label(ANDAMENTO_LABELS, obra.andamento)}
            />
            <Campo
              rotulo="Última visita"
              valor={text(obra.ultimaVisitaEm)}
            />
          </dl>
          <p className="mt-4 text-sm text-muted">
            O histórico de etapas passa a ser registrado a partir das visitas
            de fiscalização.
          </p>
        </section>
      ) : null}
      {tab === "fiscalizacoes" ? (
        <section className="mt-5">
          <DataTable<{ id: string }>
            title="Visitas de fiscalização"
            data={[]}
            getRowId={(row) => row.id}
            renderCardTitle={() => "Visita"}
            columns={[
              { id: "data", header: "Data", cell: () => "—" },
              { id: "tipo", header: "Tipo", cell: () => "—" },
              { id: "resultado", header: "Resultado", cell: () => "—" },
            ]}
            action={
              <Button type="button" variant="secondary">
                <Gavel className="size-4" /> Nova visita
              </Button>
            }
          />
          <p className="mt-3 text-sm text-muted">
            Nenhuma visita registrada para esta obra até o momento.
          </p>
        </section>
      ) : null}
      {tab === "fotos" ? (
        <section className="mt-5 rounded-app border border-border bg-surface p-6 text-center">
          <Camera className="mx-auto size-8 text-muted" />
          <h2 className="mt-2 font-display text-xl font-semibold">
            Nenhuma foto anexada
          </h2>
          <p className="mt-2 text-sm text-muted">
            Registre o avanço da obra com fotos das visitas de fiscalização.
          </p>
          <Button type="button" variant="secondary" className="mt-4">
            Adicionar fotos
          </Button>
        </section>
      ) : null}
      {tab === "licenciamento" ? (
        <section className="mt-5 rounded-app border border-border bg-surface p-6">
          <h2 className="font-display text-xl font-semibold">Licenciamento</h2>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Campo
              rotulo="Situação do alvará"
              valor={label(SITUACAO_ALVARA_LABELS, obra.situacaoAlvara)}
            />
            <Campo
              rotulo="Habite-se"
              valor={label(HABITE_SE_LABELS, obra.habiteSe)}
            />
          </dl>
          <Button type="button" variant="secondary" className="mt-4">
            <FileText className="size-4" /> Ver alvarás
          </Button>
        </section>
      ) : null}
    </main>
  );
}
