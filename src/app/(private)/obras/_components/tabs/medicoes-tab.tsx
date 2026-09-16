"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  criarMedicaoAction,
  listMedicoesAction,
} from "@/core/actions/cronograma/medicao_actions";
import { useToast } from "@/core/hooks/useToast";
import {
  criarMedicaoSchema,
  tipoMedicaoSchema,
  type CriarMedicaoInput,
  type Medicao,
} from "@/core/schemas/cronograma/medicao_schema";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { Body, Caption } from "@/core/ui/atoms/typography";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { cn } from "@/core/ui/cn";

const TIPO_MEDICAO_LABELS: Record<string, string> = {
  NORMAL: "Normal",
  RETIFICACAO: "Retificação",
  EXTRA: "Extra",
  REAJUSTAMENTO: "Reajustamento",
};

const steps = ["Tipo e data", "Fontes e valores", "Revisão"];

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function totalMedicao(medicao: Medicao) {
  const total = medicao.itens.reduce((sum, item) => sum + Number(item.valor || 0), 0);
  return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function MedicaoModal({ obraId, onSaved }: { obraId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const toast = useToast();
  const form = useForm<CriarMedicaoInput>({
    resolver: zodResolver(criarMedicaoSchema),
    defaultValues: {
      tipo: "NORMAL",
      dataMedicao: "",
      observacao: "",
      itens: [{ fonteId: "", valor: 0 }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "itens" });
  const itens = useWatch({ control: form.control, name: "itens" });
  const total = (itens ?? []).reduce((sum, item) => sum + Number(item?.valor || 0), 0);

  async function onSubmit(values: CriarMedicaoInput) {
    const res = await criarMedicaoAction(obraId, values);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Medição criada.");
    setOpen(false);
    setStep(0);
    form.reset();
    onSaved();
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" className="size-4" /> Nova medição
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-2xl">
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Nova medição</Modal.Title>
            <Modal.Description>Registre a medição por fonte de recurso.</Modal.Description>
          </Modal.Header>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold">
                    Tipo
                    <select {...form.register("tipo")} className="h-11 rounded-app border border-input bg-surface px-3 text-sm">
                      {tipoMedicaoSchema.options.map((t) => (
                        <option key={t} value={t}>
                          {TIPO_MEDICAO_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <InputForm label="Data" type="date" required {...form.register("dataMedicao")} error={form.formState.errors.dataMedicao?.message} />
                  <div className="sm:col-span-2">
                    <InputForm label="Observação" {...form.register("observacao")} />
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="grid gap-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid gap-2 sm:grid-cols-[1fr_160px_auto]">
                      <InputForm
                        label="Fonte (ID)"
                        required
                        {...form.register(`itens.${index}.fonteId` as const)}
                        error={form.formState.errors.itens?.[index]?.fonteId?.message}
                      />
                      <InputForm
                        label="Valor (R$)"
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        {...form.register(`itens.${index}.valor` as const, { valueAsNumber: true })}
                        error={form.formState.errors.itens?.[index]?.valor?.message}
                      />
                      <Button type="button" variant="ghost" size="sm" aria-label="Remover fonte" onClick={() => remove(index)} disabled={fields.length <= 1}>
                        <Trash2 aria-hidden="true" className="size-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="secondary" onClick={() => append({ fonteId: "", valor: 0 })}>
                    <Plus aria-hidden="true" className="size-4" /> Adicionar fonte
                  </Button>
                  {form.formState.errors.itens?.message && (
                    <Caption>{form.formState.errors.itens.message}</Caption>
                  )}
                </div>
              )}
              {step === 2 && (
                <Body>
                  Confira antes de salvar: {TIPO_MEDICAO_LABELS[form.watch("tipo")]} ·{" "}
                  {form.watch("dataMedicao") || "—"} · Total{" "}
                  {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.
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

export function MedicoesTab({ obraId }: { obraId: string }) {
  const toast = useToast();
  const [medicoes, setMedicoes] = useState<Medicao[]>([]);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    setLoading(true);
    const res = await listMedicoesAction(obraId);
    setLoading(false);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    setMedicoes(res.data);
  }, [obraId, toast]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  if (loading) return <Body className="p-5">Carregando medições...</Body>;

  if (medicoes.length === 0) {
    return (
      <div role="tabpanel" className="grid gap-4 p-5 text-center">
        <Body className="font-semibold">Nenhuma medição registrada</Body>
        <Caption>Registre a primeira medição desta obra por fonte de recurso.</Caption>
        <div className="flex justify-center">
          <MedicaoModal obraId={obraId} onSaved={recarregar} />
        </div>
      </div>
    );
  }

  return (
    <div role="tabpanel" className="p-5">
      <DataTable
        title="Medições"
        data={medicoes}
        getRowId={(row) => row.id}
        renderCardTitle={(row) => `Medição ${row.numero} · ${TIPO_MEDICAO_LABELS[row.tipo] ?? row.tipo}`}
        action={<MedicaoModal obraId={obraId} onSaved={recarregar} />}
        columns={[
          { id: "numero", header: "Nº", numeric: true, cell: (row) => String(row.numero) },
          { id: "data", header: "Data", cell: (row) => formatDate(row.dataMedicao) },
          { id: "tipo", header: "Tipo", cell: (row) => TIPO_MEDICAO_LABELS[row.tipo] ?? row.tipo },
          { id: "valor", header: "Valor", numeric: true, cell: (row) => totalMedicao(row) },
        ]}
      />
    </div>
  );
}
