"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Copy, Trash2 } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import { Eyebrow, Heading } from "@/core/ui/atoms/typography";
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
import { DadosTab } from "./tabs/dados-tab";
import { CronogramaTab } from "./tabs/cronograma-tab";
import { ContratoTab } from "./tabs/contrato-tab";
import { MedicoesTab } from "./tabs/medicoes-tab";
import { FinanceiroTab } from "./tabs/financeiro-tab";
import { ArquivosTab } from "./tabs/arquivos-tab";

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

const text = (value: unknown, fallback = "—") =>
  typeof value === "string" && value ? value : fallback;

const isTipoObra = (value: unknown): value is TipoObra =>
  typeof value === "string" &&
  (TIPO_OBRA_VALUES as readonly string[]).includes(value);

type ObraExtra = Obra & {
  orgao?: { nome?: string } | null;
  orgaoNome?: string | null;
};

export function ObraDetalheClient({ obra }: { obra: Obra }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [tab, setTab] = useState<TabId>("dados");
  const [tag, setTag] = useState("");
  const [obs, setObs] = useState("");

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
                  className={
                    active
                      ? "border-b-2 border-accent px-4 py-3 text-sm font-semibold text-foreground"
                      : "px-4 py-3 text-sm font-semibold text-muted hover:text-foreground"
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {tab === "dados" && <DadosTab obra={obra} />}
        {tab === "cronograma" && <CronogramaTab obraId={obra.id} />}
        {tab === "contrato" && <ContratoTab obraId={obra.id} />}
        {tab === "medicoes" && <MedicoesTab obraId={obra.id} />}
        {tab === "financeiro" && <FinanceiroTab obraId={obra.id} />}
        {tab === "arquivos" && <ArquivosTab obraId={obra.id} />}
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
