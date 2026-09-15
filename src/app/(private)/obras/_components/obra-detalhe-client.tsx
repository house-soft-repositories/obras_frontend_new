"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import { Eyebrow, Heading } from "@/core/ui/atoms/typography";
import { cn } from "@/core/ui/cn";
import { useToast } from "@/core/hooks/useToast";
import duplicarObraAction from "@/core/actions/obras/duplicar_obra_action";
import deleteObraAction from "@/core/actions/obras/delete_obra_action";
import { aplicarTagsAction } from "@/core/actions/obras/tags_actions";
import { criarObservacaoAction } from "@/core/actions/obras/observacoes_actions";
import {
  TIPO_OBRA_LABELS,
  TIPO_OBRA_VALUES,
  type TipoObra,
} from "@/core/schemas/obras/tipo_obra";
import type { Obra } from "@/core/schemas/obras/obra_schema";

type TabId =
  | "dados"
  | "cronograma"
  | "contrato"
  | "medicoes"
  | "financeiro"
  | "arquivos";

const TABS: Array<{ id: TabId; label: string }> = [
  { id: "dados", label: "Dados" },
  { id: "cronograma", label: "Cronograma" },
  { id: "contrato", label: "Contrato" },
  { id: "medicoes", label: "Medições" },
  { id: "financeiro", label: "Financeiro" },
  { id: "arquivos", label: "Arquivos" },
];

const STAGES = [
  {
    name: "Serviços preliminares e canteiro",
    owner: "Paulo Santos",
    target: 100,
    actual: 100,
  },
  {
    name: "Demolições e remoções",
    owner: "Paulo Santos",
    target: 100,
    actual: 100,
  },
  {
    name: "Estrutura e alvenaria",
    owner: "Paulo Santos",
    target: 100,
    actual: 100,
  },
  {
    name: "Instalações elétricas e hidráulicas",
    owner: "Carlos Mendes",
    target: 100,
    actual: 82,
  },
  {
    name: "Revestimentos e pintura",
    owner: "Paulo Santos",
    target: 60,
    actual: 12,
  },
  {
    name: "Cobertura e impermeabilização",
    owner: "Paulo Santos",
    target: 20,
    actual: 0,
  },
];

const ADITIVOS = [
  ["01/2024", "Valor", "18/09/2024", "R$ 380.000"],
  ["02/2024", "Prazo", "10/12/2024", "+90 dias"],
  ["03/2025", "Prazo e valor", "22/04/2025", "R$ 250.000"],
];

const MEDICOES = [
  ["1", "30/04/2024", "Normal", "R$ 620.000"],
  ["2", "31/07/2024", "Normal", "R$ 740.400"],
  ["3", "31/10/2024", "Normal", "R$ 810.000"],
  ["3", "28/02/2025", "Retificação", "R$ 424.000"],
];

const EMPENHOS = [
  ["2024NE000841", "FUNDEB", "20/02/2024", "R$ 3.000.000"],
  ["2024NE001102", "Tesouro Municipal", "20/02/2024", "R$ 1.200.000"],
  ["2025NE000233", "FINISA — BNDES", "05/05/2025", "R$ 630.000"],
];

const ARQUIVOS_INICIAIS = [
  "Contrato_Original.pdf",
  "Cronograma_Fisico.xlsx",
  "ART_Engenheiro.pdf",
];

const text = (value: unknown, fallback = "—") =>
  typeof value === "string" && value ? value : fallback;

const isTipoObra = (value: unknown): value is TipoObra =>
  typeof value === "string" &&
  (TIPO_OBRA_VALUES as readonly string[]).includes(value);

type ObraExtra = Obra & {
  orgao?: { nome?: string } | null;
  orgaoNome?: string | null;
};

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

function DataTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            {head.map((col) => (
              <th key={col} scope="col" className="px-4 py-3 font-semibold">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={`${row[0]}-${i}`}
              className="border-b border-border last:border-0"
            >
              {row.map((cell, j) => (
                <td
                  key={`${cell}-${j}`}
                  className={cn(
                    "px-4 py-3",
                    j === 0 && "font-mono text-xs text-muted",
                    j === row.length - 1 && "font-semibold tabular-nums",
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Progress({ value, label }: { value: number; label: string }) {
  return (
    <span
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="inline-block h-2 min-w-24 flex-1 overflow-hidden rounded-full bg-surface-subtle"
    >
      <span
        className="block h-full rounded-full bg-accent"
        style={{ width: `${value}%` }}
      />
    </span>
  );
}

export function ObraDetalheClient({ obra }: { obra: Obra }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<TabId>("dados");
  const [tag, setTag] = useState("");
  const [obs, setObs] = useState("");
  const [arquivos, setArquivos] = useState<string[]>(ARQUIVOS_INICIAIS);

  const extra = obra as ObraExtra;
  const codigo = text(obra.codigo);
  const nome = text(obra.nome, "Obra sem nome");
  const tipo = isTipoObra(obra.tipo)
    ? TIPO_OBRA_LABELS[obra.tipo]
    : text(obra.tipo);
  const status = text(obra.status);
  const orgao = text(extra.orgao?.nome ?? extra.orgaoNome, "—");

  const mutate = (action: () => Promise<unknown>, success: string) =>
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível concluir a operação.",
        );
      }
    });

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8">
      <Link
        href="/obras"
        className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Voltar para obras
      </Link>

      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>{codigo}</Eyebrow>
          <Heading className="mt-2 text-3xl sm:text-4xl">{nome}</Heading>
          <p className="mt-2 max-w-2xl text-sm leading-5 text-muted">
            {orgao} · {tipo}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex min-h-9 items-center rounded-full bg-accent px-3 text-xs font-semibold text-foreground">
            {status}
          </span>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() =>
              mutate(() => duplicarObraAction(obra.id), "Obra duplicada.")
            }
          >
            <Copy className="size-4" /> Duplicar
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => {
              if (confirm("Excluir esta obra?"))
                mutate(() => deleteObraAction(obra.id), "Obra excluída.");
            }}
          >
            <Trash2 className="size-4" /> Excluir
          </Button>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-app border border-border bg-surface shadow-card">
        <div className="overflow-x-auto">
          <div
            role="tablist"
            aria-label="Seções da obra"
            className="flex min-w-max border-b border-border"
          >
            {TABS.map((item) => {
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "-mb-px !min-h-11 !rounded-none !border-0 !border-b-2 !bg-transparent !px-4 !py-0 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
                    active
                      ? "!border-accent text-foreground"
                      : "!border-transparent text-muted hover:!border-transparent hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "dados" && (
          <div role="tabpanel" className="grid gap-4 p-5 sm:grid-cols-2">
            <InfoCard
              title="Identificação"
              rows={[
                ["Código", codigo],
                ["Órgão executor", orgao],
                ["Tipo", tipo],
                ["Status", status],
              ]}
            />
            <InfoCard
              title="Execução"
              rows={[
                ["Empresa", "Construtora Alfa Ltda"],
                ["Responsável", "Paulo Santos"],
                ["Data de início", "12/02/2024"],
                ["Prazo final", "18/12/2025"],
              ]}
            />
          </div>
        )}

        {tab === "cronograma" && (
          <div role="tabpanel" className="grid gap-2.5 p-5">
            {STAGES.map((stage) => (
              <div
                key={stage.name}
                className="grid w-full items-center gap-4 rounded-app border border-border bg-surface p-3.5 text-left sm:grid-cols-[1fr_150px_200px]"
              >
                <div className="min-w-0">
                  <span
                    className={cn(
                      "mr-2.5 inline-grid size-6 place-items-center rounded border border-border align-middle",
                      stage.actual === 100 &&
                        "border-accent bg-accent text-foreground",
                    )}
                  >
                    {stage.actual === 100 && <Check className="size-4" />}
                  </span>
                  <strong className="text-sm">{stage.name}</strong>
                  <div className="mt-1.5 ml-9 text-xs text-muted">
                    Responsável: {stage.owner}
                  </div>
                </div>
                <span className="text-xs whitespace-nowrap text-muted tabular-nums">
                  Meta {stage.target}%
                </span>
                <Progress
                  value={stage.actual}
                  label={`Realizado em ${stage.name}`}
                />
              </div>
            ))}
          </div>
        )}

        {tab === "contrato" && (
          <div role="tabpanel" className="grid gap-4 p-5 sm:grid-cols-2">
            <InfoCard
              title="Contrato CT-048/2024"
              rows={[
                ["Assinatura", "05/02/2024"],
                ["Ordem de serviço", "12/02/2024"],
                ["Prazo", "540 dias"],
                ["Vigência", "31/03/2026"],
              ]}
            />
            <InfoCard
              title="Valores e fontes"
              rows={[
                ["Contratado inicial", "R$ 4.200.000"],
                ["Aditivado", "R$ 630.000"],
                ["Total", "R$ 4.830.000"],
                ["Fontes vinculadas", "2"],
              ]}
            />
            <div className="overflow-hidden rounded-app border border-border sm:col-span-2">
              <DataTable
                head={["Aditivo", "Tipo", "Assinatura", "Impacto"]}
                rows={ADITIVOS}
              />
            </div>
          </div>
        )}

        {tab === "medicoes" && (
          <div role="tabpanel" className="p-5">
            <div className="overflow-hidden rounded-app border border-border">
              <DataTable
                head={["Nº", "Data", "Tipo", "Valor"]}
                rows={MEDICOES}
              />
            </div>
          </div>
        )}

        {tab === "financeiro" && (
          <div role="tabpanel" className="grid gap-4 p-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["Empenhado", "R$ 4.830.000"],
                ["Liquidado", "R$ 3.100.000"],
                ["Pago", "R$ 2.950.000"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="overflow-hidden rounded-app border border-border bg-surface"
                >
                  <div className="border-b border-border px-4 py-2 text-xs text-muted">
                    {label}
                  </div>
                  <div className="px-4 py-3 font-display text-xl font-semibold tabular-nums">
                    {value}
                  </div>
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-app border border-border">
              <DataTable
                head={["Empenho", "Fonte", "Data", "Valor"]}
                rows={EMPENHOS}
              />
            </div>
          </div>
        )}

        {tab === "arquivos" && (
          <div role="tabpanel" className="p-5">
            <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-app border-2 border-dashed border-border bg-surface-subtle px-4 py-6 text-center text-[13px] font-semibold text-muted">
              <span className="flex flex-col items-center gap-2">
                <Upload className="size-5" />
                Adicionar arquivo
              </span>
              <input
                type="file"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) setArquivos((prev) => [...prev, file.name]);
                  event.target.value = "";
                }}
              />
            </label>
            <div className="mt-4 overflow-hidden rounded-app border border-border">
              {arquivos.map((file) => (
                <div
                  key={file}
                  className="flex min-h-14 items-center gap-3 border-b border-border px-3.5 last:border-0"
                >
                  <FileText className="size-4 shrink-0 text-muted" />
                  <strong className="flex-1 text-[13px]">{file}</strong>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Baixar ${file}`}
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-app border border-border bg-surface p-6 shadow-card">
        <h2 className="font-display text-xl font-semibold">
          Tags e observações
        </h2>
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Aplicar tag"
            value={tag}
            onChange={(event) => setTag(event.target.value)}
          />
          <Button
            disabled={!tag || pending}
            onClick={() =>
              mutate(() => aplicarTagsAction(obra.id, tag), "Tag aplicada.")
            }
          >
            Adicionar
          </Button>
        </div>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder="Nova observação"
            value={obs}
            onChange={(event) => setObs(event.target.value)}
          />
          <Button
            disabled={!obs || pending}
            onClick={() =>
              mutate(
                () => criarObservacaoAction(obra.id, obs),
                "Observação adicionada.",
              )
            }
          >
            Registrar
          </Button>
        </div>
      </section>
    </main>
  );
}
