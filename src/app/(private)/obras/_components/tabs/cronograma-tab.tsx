"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Gauge, MessageCircle, Pencil, Plus, Trash2, UserCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  assumirEstagioAction,
  atualizarAcompanhamentoAction,
  atualizarComentarioAction,
  atualizarEstagioAction,
  criarAcompanhamentoAction,
  criarComentarioAction,
  criarEstagioAction,
  excluirAcompanhamentoAction,
  excluirComentarioAction,
  excluirEstagioAction,
  listEstagiosAction,
} from "@/core/actions/cronograma/estagio_actions";
import { useToast } from "@/core/hooks/useToast";
import {
  atualizarAcompanhamentoSchema,
  atualizarComentarioSchema,
  criarAcompanhamentoSchema,
  criarComentarioSchema,
  criarEstagioSchema,
  type AtualizarAcompanhamentoInput,
  type AtualizarComentarioInput,
  type CriarAcompanhamentoInput,
  type CriarComentarioInput,
  type CriarEstagioInput,
  type Estagio,
  type EstagioAcompanhamento,
  type EstagioComentario,
} from "@/core/schemas/cronograma/estagio_schema";
import { Button } from "@/core/ui/atoms/button";
import { ActionButton } from "@/core/ui/molecules/action-button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { Body, Caption } from "@/core/ui/atoms/typography";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { TextareaForm } from "@/core/ui/molecules/textarea-form";
import { cn } from "@/core/ui/cn";

const steps = ["Etapa", "Período", "Revisão"];

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="flex flex-wrap gap-2">
      {steps.map((label, index) => (
        <li
          key={label}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-semibold",
            index === step
              ? "border-accent bg-accent-subtle text-accent-strong"
              : "border-border text-muted",
          )}
        >
          {index + 1}. {label}
        </li>
      ))}
    </ol>
  );
}

function EstagioModal({
  obraId,
  estagio,
  onSaved,
}: {
  obraId: string;
  estagio?: Estagio | null;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const toast = useToast();
  const form = useForm<CriarEstagioInput>({
    resolver: zodResolver(criarEstagioSchema),
    defaultValues: {
      nome: estagio?.nome ?? "",
      posicao: estagio?.posicao ?? 0,
      dataInicio:
        typeof estagio?.dataInicio === "string"
          ? estagio.dataInicio.slice(0, 10)
          : "",
      dataFim:
        typeof estagio?.dataFim === "string"
          ? estagio.dataFim.slice(0, 10)
          : "",
      responsavelUsuarioId: "",
    },
  });
  const etapaPreview = useWatch({ control: form.control });

  async function onSubmit(values: CriarEstagioInput) {
    const payload = {
      ...values,
      responsavelUsuarioId: values.responsavelUsuarioId || undefined,
    };
    const res = estagio
      ? await atualizarEstagioAction(obraId, estagio.id, payload)
      : await criarEstagioAction(obraId, payload);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(estagio ? "Etapa atualizada." : "Etapa criada.");
    setOpen(false);
    setStep(0);
    form.reset();
    onSaved();
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <ActionButton
          variant={estagio ? "ghost" : "primary"}
          icon={
            estagio ? (
              <Pencil aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <Plus aria-hidden="true" className="size-4 shrink-0" />
            )
          }
          label={estagio ? "Editar" : "Nova etapa"}
          tooltip={estagio ? `Editar etapa ${estagio.nome}` : "Cadastrar nova etapa"}
        />
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-2xl">
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>{estagio ? "Editar etapa" : "Nova etapa"}</Modal.Title>
            <Modal.Description>
              Etapas do cronograma físico da obra.
            </Modal.Description>
          </Modal.Header>
          <StepIndicator step={step} />
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              {step === 0 && (
                <InputForm
                  label="Nome da etapa"
                  required
                  {...form.register("nome")}
                  error={form.formState.errors.nome?.message}
                />
              )}
              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputForm
                    label="Início"
                    type="date"
                    {...form.register("dataInicio")}
                    error={form.formState.errors.dataInicio?.message}
                  />
                  <InputForm
                    label="Fim"
                    type="date"
                    {...form.register("dataFim")}
                    error={form.formState.errors.dataFim?.message}
                  />
                </div>
              )}
              {step === 2 && (
                <Body>
                  Confira os dados antes de salvar: {etapaPreview.nome || "—"} ·{" "}
                  {etapaPreview.dataInicio || "sem início"} →{" "}
                  {etapaPreview.dataFim || "sem fim"}.
                </Body>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              {step > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setStep(step - 1)}
                >
                  Voltar
                </Button>
              )}
              {step < steps.length - 1 ? (
                <Button type="button" onClick={() => setStep(step + 1)}>
                  Avançar
                </Button>
              ) : (
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              )}
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}

function AcompanhamentoModal({
  obraId,
  estagio,
  onSaved,
}: {
  obraId: string;
  estagio: Estagio;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<EstagioAcompanhamento | null>(null);
  const toast = useToast();
  const form = useForm<CriarAcompanhamentoInput | AtualizarAcompanhamentoInput>(
    {
      resolver: zodResolver(
        selected ? atualizarAcompanhamentoSchema : criarAcompanhamentoSchema,
      ),
      defaultValues: { percentual: 0, data: "", observacao: "" },
    },
  );

  function resetCreate() {
    setSelected(null);
    form.reset({ percentual: 0, data: "", observacao: "" });
  }

  async function onSubmit(
    values: CriarAcompanhamentoInput | AtualizarAcompanhamentoInput,
  ) {
    const payload = { ...values, observacao: values.observacao || undefined };
    const res = selected
      ? await atualizarAcompanhamentoAction(
          obraId,
          estagio.id,
          selected.id,
          payload,
        )
      : await criarAcompanhamentoAction(
          obraId,
          estagio.id,
          payload as CriarAcompanhamentoInput,
        );
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(
      selected ? "Acompanhamento atualizado." : "Acompanhamento registrado.",
    );
    setSelected(res.data);
    form.reset({
      percentual: res.data.percentual,
      data: res.data.data.slice(0, 10),
      observacao: res.data.observacao ?? "",
    });
    onSaved();
  }

  async function excluir() {
    if (!selected || !confirm("Excluir este acompanhamento?")) return;
    const res = await excluirAcompanhamentoAction(
      obraId,
      estagio.id,
      selected.id,
    );
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Acompanhamento excluído.");
    resetCreate();
    onSaved();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetCreate();
  }

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <ActionButton
          variant="secondary"
          icon={<Gauge aria-hidden="true" className="size-4 shrink-0" />}
          label="Medir"
          tooltip={`Registrar avanço de ${estagio.nome}`}
        />
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-2xl">
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>
              {selected ? "Editar acompanhamento" : "Registrar avanço"}
            </Modal.Title>
            <Modal.Description>{estagio.nome}</Modal.Description>
          </Modal.Header>
          {selected ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-app border border-border bg-surface-subtle p-3">
              <Caption>Acompanhamento selecionado: {selected.id}</Caption>
              <Button type="button" variant="ghost" onClick={resetCreate}>
                Novo acompanhamento
              </Button>
            </div>
          ) : null}
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputForm
                  label="Percentual executado"
                  type="number"
                  min={0}
                  max={100}
                  required={!selected}
                  {...form.register("percentual", { valueAsNumber: true })}
                  error={form.formState.errors.percentual?.message}
                />
                <InputForm
                  label="Data"
                  type="date"
                  required={!selected}
                  {...form.register("data")}
                  error={form.formState.errors.data?.message}
                />
                <InputForm
                  label="Observação"
                  containerClassName="sm:col-span-2"
                  {...form.register("observacao")}
                  error={form.formState.errors.observacao?.message}
                />
              </div>
              {selected ? (
                <Caption>Registro carregado: {selected.id}</Caption>
              ) : null}
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              {selected ? (
                <Button type="button" variant="destructive" onClick={excluir}>
                  Excluir
                </Button>
              ) : null}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}

function ComentarioModal({
  obraId,
  estagio,
  onSaved,
}: {
  obraId: string;
  estagio: Estagio;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<EstagioComentario | null>(null);
  const toast = useToast();
  const form = useForm<CriarComentarioInput | AtualizarComentarioInput>({
    resolver: zodResolver(
      selected ? atualizarComentarioSchema : criarComentarioSchema,
    ),
    defaultValues: { texto: "" },
  });

  function resetCreate() {
    setSelected(null);
    form.reset({ texto: "" });
  }

  async function onSubmit(
    values: CriarComentarioInput | AtualizarComentarioInput,
  ) {
    const res = selected
      ? await atualizarComentarioAction(obraId, estagio.id, selected.id, values)
      : await criarComentarioAction(obraId, estagio.id, values);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(
      selected ? "Comentário atualizado." : "Comentário registrado.",
    );
    setSelected(res.data);
    form.reset({ texto: res.data.texto });
    onSaved();
  }

  async function excluir() {
    if (!selected || !confirm("Excluir este comentário?")) return;
    const res = await excluirComentarioAction(obraId, estagio.id, selected.id);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Comentário excluído.");
    resetCreate();
    onSaved();
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) resetCreate();
  }

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <ActionButton
          variant="ghost"
          icon={<MessageCircle aria-hidden="true" className="size-4 shrink-0" />}
          label="Comentário"
          tooltip={`Comentar etapa ${estagio.nome}`}
        />
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-2xl">
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>
              {selected ? "Editar comentário" : "Novo comentário"}
            </Modal.Title>
            <Modal.Description>{estagio.nome}</Modal.Description>
          </Modal.Header>
          {selected ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-app border border-border bg-surface-subtle p-3">
              <Caption>Comentário selecionado: {selected.id}</Caption>
              <Button type="button" variant="ghost" onClick={resetCreate}>
                Novo comentário
              </Button>
            </div>
          ) : null}
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <TextareaForm
                label="Comentário"
                required
                rows={4}
                {...form.register("texto")}
                error={form.formState.errors.texto?.message}
              />
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              {selected ? (
                <Button type="button" variant="destructive" onClick={excluir}>
                  Excluir
                </Button>
              ) : null}
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}

export function CronogramaTab({ obraId }: { obraId: string }) {
  const toast = useToast();
  const [estagios, setEstagios] = useState<Estagio[]>([]);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    setLoading(true);
    const res = await listEstagiosAction(obraId);
    setLoading(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    setEstagios(res.data);
  }, [obraId, toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregar();
  }, [recarregar]);

  async function excluir(id: string) {
    if (!confirm("Excluir esta etapa?")) return;
    const res = await excluirEstagioAction(obraId, id);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Etapa excluída.");
    recarregar();
  }

  async function assumir(estagio: Estagio) {
    const res = await assumirEstagioAction(obraId, estagio.id);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Etapa assumida.");
    recarregar();
  }

  if (loading) return <Body className="p-5">Carregando cronograma...</Body>;

  if (estagios.length === 0) {
    return (
      <div role="tabpanel" className="mt-5 grid gap-4 text-center">
        <Body className="font-semibold">Nenhuma etapa cadastrada</Body>
        <Caption>
          Cadastre as etapas do cronograma físico para acompanhar a execução.
        </Caption>
        <div className="flex justify-center">
          <EstagioModal obraId={obraId} onSaved={recarregar} />
        </div>
      </div>
    );
  }

  return (
    <div role="tabpanel" className="mt-5">
      <DataTable
        title="Cronograma físico"
        data={estagios}
        getRowId={(row) => row.id}
        renderCardTitle={(row) => row.nome}
        action={<EstagioModal obraId={obraId} onSaved={recarregar} />}
        columns={[
          { id: "nome", header: "Etapa", cell: (row) => row.nome },
          {
            id: "inicio",
            header: "Início",
            cell: (row) => formatDate(row.dataInicio),
          },
          { id: "fim", header: "Fim", cell: (row) => formatDate(row.dataFim) },
          {
            id: "avanço",
            header: "Avanço",
            numeric: true,
            cell: (row) =>
              typeof row.percentualDireto === "number"
                ? `${row.percentualDireto}%`
                : "—",
          },
          {
            id: "responsavel",
            header: "Responsável",
            cell: (row) => (row.responsavelUsuarioId ? "Atribuído" : "—"),
          },
          {
            id: "acoes",
            header: "Ações",
            cell: (row) => (
              <span className="flex flex-wrap gap-2">
                <AcompanhamentoModal
                  obraId={obraId}
                  estagio={row}
                  onSaved={recarregar}
                />
                <ComentarioModal
                  obraId={obraId}
                  estagio={row}
                  onSaved={recarregar}
                />
                <ActionButton
                  variant="ghost"
                  icon={<UserCheck aria-hidden="true" className="size-4 shrink-0" />}
                  label="Assumir"
                  tooltip={`Assumir etapa ${row.nome}`}
                  onClick={() => assumir(row)}
                />
                <EstagioModal
                  obraId={obraId}
                  estagio={row}
                  onSaved={recarregar}
                />
                <ActionButton
                  variant="ghost"
                  icon={<Trash2 aria-hidden="true" className="size-4 shrink-0" />}
                  label="Excluir"
                  tooltip={`Excluir etapa ${row.nome}`}
                  onClick={() => excluir(row.id)}
                />
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
