"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Copy, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { ActionButton } from "@/core/ui/molecules/action-button";
import { Input } from "@/core/ui/atoms/input";
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

  const executarAcao = (action: () => Promise<unknown>, success: string) =>
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
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/obras"
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted"
      >
        <ArrowLeft className="size-4" /> Voltar para obras
      </Link>

      <section className="rounded-app border border-border bg-surface p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted">Obra pública {codigo}</p>
            <h1 className="mt-1 font-display text-3xl font-bold tracking-tight">
              {nome}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <MapPin className="size-4" /> {orgao} · {tipo}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ActionButton
              variant="secondary"
              icon={<Copy aria-hidden="true" className="size-4 shrink-0" />}
              label="Duplicar"
              tooltip={`Duplicar ${nome}`}
              disabled={pending}
              onClick={() =>
                executarAcao(
                  () => duplicarObraAction(obra.id),
                  "Obra duplicada.",
                )
              }
            />
            <ActionButton
              variant="destructive"
              icon={<Trash2 aria-hidden="true" className="size-4 shrink-0" />}
              label="Excluir"
              tooltip={`Excluir ${nome}`}
              disabled={pending}
              onClick={() => {
                if (confirm("Excluir esta obra?"))
                  executarAcao(
                    () => deleteObraAction(obra.id),
                    "Obra excluída.",
                  );
              }}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            {status}
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            {tipo}
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            Órgão: {orgao}
          </span>
        </div>
      </section>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Abas da obra">
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

      {tab === "dados" && <DadosTab obra={obra} />}
      {tab === "cronograma" && <CronogramaTab obraId={obra.id} />}
      {tab === "contrato" && <ContratoTab obraId={obra.id} />}
      {tab === "medicoes" && <MedicoesTab obraId={obra.id} />}
      {tab === "financeiro" && <FinanceiroTab obraId={obra.id} />}
      {tab === "arquivos" && <ArquivosTab obraId={obra.id} />}

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
              executarAcao(() => aplicarTagsAction(obra.id, tag), "Tag aplicada.")
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
              executarAcao(
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
