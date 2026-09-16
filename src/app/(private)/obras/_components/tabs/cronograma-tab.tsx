"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  atualizarEstagioAction,
  criarAcompanhamentoAction,
  criarEstagioAction,
  excluirEstagioAction,
  listEstagiosAction,
} from "@/core/actions/cronograma/estagio_actions";
import { useToast } from "@/core/hooks/useToast";
import {
  criarAcompanhamentoSchema,
  criarEstagioSchema,
  type CriarAcompanhamentoInput,
  type CriarEstagioInput,
  type Estagio,
} from "@/core/schemas/cronograma/estagio_schema";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { Body, Caption } from "@/core/ui/atoms/typography";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
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
        typeof estagio?.dataInicio === "string" ? estagio.dataInicio.slice(0, 10) : "",
      dataFim: typeof estagio?.dataFim === "string" ? estagio.dataFim.slice(0, 10) : "",
      responsavelUsuarioId: "",
    },
  });

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
        <Button variant={estagio ? "ghost" : "primary"} size={estagio ? "sm" : "md"}>
          {estagio ? <Pencil aria-hidden="true" className="size-4" /> : <Plus aria-hidden="true" className="size-4" />}
          {estagio ? "Editar" : "Nova etapa"}
        </Button>
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
                  Confira os dados antes de salvar: {form.watch("nome") || "—"} ·{" "}
                  {form.watch("dataInicio") || "sem início"} →{" "}
                  {form.watch("dataFim") || "sem fim"}.
                </Body>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              {step > 0 && (
                <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
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
  const toast = useToast();
  const form = useForm<CriarAcompanhamentoInput>({
    resolver: zodResolver(criarAcompanhamentoSchema),
    defaultValues: { percentual: 0, data: "", observacao: "" },
  });

  async function onSubmit(values: CriarAcompanhamentoInput) {
    const res = await criarAcompanhamentoAction(obraId, estagio.id, values);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Acompanhamento registrado.");
    setOpen(false);
    form.reset();
    onSaved();
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button variant="secondary" size="sm">
          Medir
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Registrar avanço</Modal.Title>
            <Modal.Description>{estagio.nome}</Modal.Description>
          </Modal.Header>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <InputForm
                label="Percentual executado"
                type="number"
                min={0}
                max={100}
                required
                {...form.register("percentual", { valueAsNumber: true })}
                error={form.formState.errors.percentual?.message}
              />
              <InputForm
                label="Data"
                type="date"
                required
                {...form.register("data")}
                error={form.formState.errors.data?.message}
              />
              <InputForm
                label="Observação"
                {...form.register("observacao")}
                error={form.formState.errors.observacao?.message}
              />
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
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
    recarregar();
  }, [recarregar]);

  async function excluir(id: string) {
    const res = await excluirEstagioAction(obraId, id);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Etapa excluída.");
    recarregar();
  }

  if (loading) return <Body className="p-5">Carregando cronograma...</Body>;

  if (estagios.length === 0) {
    return (
      <div role="tabpanel" className="grid gap-4 p-5 text-center">
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
    <div role="tabpanel" className="p-5">
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
            id: "acoes",
            header: "Ações",
            cell: (row) => (
              <span className="flex gap-2">
                <AcompanhamentoModal obraId={obraId} estagio={row} onSaved={recarregar} />
                <EstagioModal obraId={obraId} estagio={row} onSaved={recarregar} />
                <Button variant="ghost" size="sm" aria-label={`Excluir ${row.nome}`} onClick={() => excluir(row.id)}>
                  <Trash2 aria-hidden="true" className="size-4" />
                </Button>
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
