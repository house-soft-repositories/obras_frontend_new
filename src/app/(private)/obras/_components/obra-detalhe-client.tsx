"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition, type ReactNode } from "react";
import { ArrowLeft, Copy, MapPin, Trash2 } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { Chip } from "@/core/ui/atoms/chip";
import { ActionButton } from "@/core/ui/molecules/action-button";
import { Input } from "@/core/ui/atoms/input";
import { useToast } from "@/core/hooks/useToast";
import { AlertDialog } from "@/core/ui/molecules/alert-dialog";
import duplicarObraAction from "@/core/actions/obras/duplicar_obra_action";
import deleteObraAction from "@/core/actions/obras/delete_obra_action";
import { listTagsAction } from "@/core/actions/obras/tags_actions";
import {
  criarObservacaoAction,
  listObservacoesAction,
  type Observacao,
} from "@/core/actions/obras/observacoes_actions";
import {
  TIPO_OBRA_LABELS,
  TIPO_OBRA_VALUES,
  type TipoObra,
} from "@/core/schemas/obras/tipo_obra";
import type { Obra } from "@/core/schemas/obras/obra_schema";
import {
  statusObraChipVariant,
  statusObraLabel,
} from "@/core/utils/status-obra";
import {
  OBRA_TABS,
  obraTabHref,
  type ObraTabId,
} from "@/core/config/obra-tabs";
import { ObraStatusEditor } from "./obra-status-editor";

const text = (value: unknown, fallback = "—") =>
  typeof value === "string" && value ? value : fallback;

const isTipoObra = (value: unknown): value is TipoObra =>
  typeof value === "string" &&
  (TIPO_OBRA_VALUES as readonly string[]).includes(value);

type ObraExtra = Obra & {
  orgao?: { nome?: string } | null;
  orgaoNome?: string | null;
};

type Tag = { id: string; nome: string };

export function ObraDetalheClient({
  obra,
  activeTab,
  children,
}: {
  obra: Obra;
  activeTab: ObraTabId;
  children: ReactNode;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [obs, setObs] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [observacoes, setObservacoes] = useState<Observacao[]>([]);

  const tab = activeTab;
  const codigo = text(obra.codigo);
  const nome = text(obra.nome, "Obra sem nome");
  const tipo = isTipoObra(obra.tipo)
    ? TIPO_OBRA_LABELS[obra.tipo]
    : text(obra.tipo);
  const status = text(obra.status);
  const orgao = text(
    (obra as ObraExtra).orgao?.nome ?? (obra as ObraExtra).orgaoNome,
    "—",
  );

  useEffect(() => {
    let ativo = true;
    void Promise.all([listTagsAction(obra.id), listObservacoesAction(obra.id)])
      .then(([tagsAtuais, observacoesAtuais]) => {
        if (!ativo) return;
        setTags(tagsAtuais);
        setObservacoes(observacoesAtuais);
      })
      .catch(() => {
        if (ativo) toast.error("Não foi possível carregar os dados da obra.");
      });
    return () => {
      ativo = false;
    };
  }, [obra.id, toast]);

  function selecionarAba(nextTab: (typeof OBRA_TABS)[number]["id"]) {
    router.push(obraTabHref(obra.id, nextTab), { scroll: false });
  }

  const executarAcao = (action: () => Promise<unknown>, success: string) =>
    startTransition(async () => {
      try {
        await action();
        toast.success(success);
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
            <AlertDialog.Confirm
              title="Excluir obra?"
              description={`A obra ${nome} será excluída permanentemente.`}
              tone="danger"
              confirmLabel="Excluir"
              confirmingLabel="Excluindo..."
              tooltip={`Excluir ${nome}`}
              ariaLabel={`Excluir ${nome}`}
              icon={<Trash2 aria-hidden="true" className="size-5" />}
              trigger={
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending}
                  aria-label={`Excluir ${nome}`}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Excluir
                </Button>
              }
              onConfirm={async () => {
                const res = await deleteObraAction(obra.id);
                if (!res.success) {
                  toast.error(res.error);
                  return false;
                }
                toast.success("Obra excluída.");
                router.push("/obras");
              }}
            />
          </div>
        </div>
        <ObraStatusEditor
          key={`${obra.id}-${status}`}
          obraId={obra.id}
          status={status}
          onUpdated={() => router.refresh()}
        />
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Chip variant={statusObraChipVariant(status)}>
            {statusObraLabel(status)}
          </Chip>
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            {tipo}
          </span>
          <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium">
            Órgão: {orgao}
          </span>
          {tags.map((item) => (
            <Chip key={item.id} variant="cinza" className="text-xs">
              Tag: {item.nome}
            </Chip>
          ))}
        </div>
      </section>

      <nav
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Abas da obra"
        role="tablist"
      >
        {OBRA_TABS.map((item) => (
          <Button
            key={item.id}
            id={`obra-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            variant={tab === item.id ? "primary" : "secondary"}
            onClick={() => selecionarAba(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>

      <div role="tabpanel" aria-labelledby={`obra-tab-${tab}`} tabIndex={0}>
        {children}
      </div>

      <section className="mt-6 rounded-app border border-border bg-surface p-6 shadow-card">
        <h2 className="font-display text-xl font-semibold">Observações</h2>
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Nova observação"
            value={obs}
            onChange={(event) => setObs(event.target.value)}
          />
          <Button
            disabled={!obs || pending}
            onClick={() =>
              executarAcao(async () => {
                const observacao = await criarObservacaoAction(obra.id, obs);
                setObservacoes((current) => [observacao, ...current]);
                setObs("");
              }, "Observação adicionada.")
            }
          >
            Registrar
          </Button>
        </div>
        <div className="mt-5">
          <h3 className="text-sm font-semibold">Observações registradas</h3>
          {observacoes.length > 0 ? (
            <ul className="mt-2 grid gap-2">
              {observacoes.map((item) => (
                <li
                  key={item.id}
                  className="rounded-app border border-border bg-surface-subtle px-3 py-2 text-sm"
                >
                  {item.texto}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Nenhuma observação registrada.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
