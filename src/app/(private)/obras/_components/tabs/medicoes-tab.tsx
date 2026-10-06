"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  atualizarMedicaoAction,
  criarMedicaoAction,
  excluirMedicaoAction,
  listMedicoesAction,
} from "@/core/actions/cronograma/medicao_actions";
import listOrgaosPaginationAction from "@/core/actions/orgaos/list_orgaos_pagination_action";
import { listOrcamentosAction } from "@/core/actions/obras/guias/orcamentos_actions";
import { useToast } from "@/core/hooks/useToast";
import {
  medicaoFormSchema,
  tipoMedicaoSchema,
  type AtualizarMedicaoInput,
  type Medicao,
  type MedicaoFormInput,
} from "@/core/schemas/cronograma/medicao_schema";
import type { OrgaoSchema } from "@/core/schemas/orgaos/orgao_schema";
import type { ObraOrcamentoReadModel } from "@/core/schemas/obras/orcamento_read_model_schema";
import { Button } from "@/core/ui/atoms/button";
import { ActionButton } from "@/core/ui/molecules/action-button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { InputMoney } from "@/core/ui/atoms/input-money";
import { Body, Caption } from "@/core/ui/atoms/typography";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { cn } from "@/core/ui/cn";

type OrcamentoOption = ObraOrcamentoReadModel;
type OrgaoOption = Pick<OrgaoSchema, "id" | "nome" | "sigla" | "ativo">;

const TIPO_MEDICAO_LABELS: Record<string, string> = {
  NORMAL: "Normal",
  RETIFICACAO: "Retificação",
  EXTRA: "Extra",
  REAJUSTAMENTO: "Reajustamento",
};

const steps = ["Dados básicos", "Orçamentos e valores", "Revisão"];

function formatCurrency(value: unknown) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function moneyValueToCents(value: unknown) {
  return Math.round(Number(value || 0) * 100);
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function totalMedicao(medicao: Medicao) {
  const total = medicao.fontes.reduce(
    (sum, item) => sum + Number(item.valor || 0),
    0,
  );
  return formatCurrency(total);
}

function medicaoDefaultValues(medicao?: Medicao | null): MedicaoFormInput {
  return {
    numero: medicao?.numero ?? ("" as unknown as number),
    tipo: medicao?.tipo ?? "NORMAL",
    dataMedicao:
      typeof medicao?.dataMedicao === "string"
        ? medicao.dataMedicao.slice(0, 10)
        : "",
    orgaoId: medicao?.orgaoId ?? "",
    observacoes: medicao?.observacoes ?? "",
    fontes: medicao?.fontes?.length
      ? medicao.fontes.map((item) => ({
          fonteId: item.fonteId,
          valor: Number(item.valor || 0),
        }))
      : [{ fonteId: "", valor: 0 }],
  };
}

function MedicaoModal({
  obraId,
  medicao,
  onSaved,
}: {
  obraId: string;
  medicao?: Medicao | null;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [orcamentos, setOrcamentos] = useState<OrcamentoOption[]>([]);
  const [orgaos, setOrgaos] = useState<OrgaoOption[]>([]);
  const [loadingOrcamentos, setLoadingOrcamentos] = useState(false);
  const [loadingOrgaos, setLoadingOrgaos] = useState(false);
  const toast = useToast();
  const form = useForm<MedicaoFormInput>({
    resolver: zodResolver(medicaoFormSchema),
    defaultValues: medicaoDefaultValues(medicao),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fontes",
  });
  const fontes = useWatch({ control: form.control, name: "fontes" });
  const medicaoPreview = useWatch({ control: form.control });
  const total = (fontes ?? []).reduce(
    (sum, item) => sum + Number(item?.valor || 0),
    0,
  );

  useEffect(() => {
    if (!open) return;
    form.reset(medicaoDefaultValues(medicao));
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingOrcamentos(true);
    setLoadingOrgaos(true);
    listOrcamentosAction(obraId)
      .then((items) => {
        if (active) setOrcamentos(items);
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar os orçamentos.");
      })
      .finally(() => {
        if (active) setLoadingOrcamentos(false);
      });
    listOrgaosPaginationAction({ page: 1, take: 50, order: "ASC" })
      .then((page) => {
        if (active) setOrgaos(page.data.filter((orgao) => orgao.ativo));
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar os órgãos.");
      })
      .finally(() => {
        if (active) setLoadingOrgaos(false);
      });
    return () => {
      active = false;
    };
  }, [form, medicao, obraId, open, toast]);

  async function onSubmit(values: MedicaoFormInput) {
    const fontesPayload = values.fontes.map((item) => ({
      fonteId: item.fonteId,
      valor: Number(item.valor || 0).toFixed(2),
    }));
    const payload = {
      numero: values.numero,
      tipo: values.tipo,
      dataMedicao: values.dataMedicao,
      orgaoId: values.orgaoId,
      observacoes: values.observacoes || undefined,
      fontes: fontesPayload,
    };
    const updatePayload: AtualizarMedicaoInput = {
      numero: values.numero,
      tipo: values.tipo,
      dataMedicao: values.dataMedicao,
      orgaoId: values.orgaoId,
      observacoes: values.observacoes || undefined,
      ...(form.formState.dirtyFields.fontes
        ? {
            fontes: fontesPayload,
          }
        : {}),
    };
    const res = medicao
      ? await atualizarMedicaoAction(obraId, medicao.id, updatePayload)
      : await criarMedicaoAction(obraId, payload);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(medicao ? "Medição atualizada." : "Medição criada.");
    setOpen(false);
    setStep(0);
    form.reset(medicaoDefaultValues(medicao));
    onSaved();
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <ActionButton
          variant={medicao ? "ghost" : "primary"}
          icon={
            medicao ? (
              <Pencil aria-hidden="true" className="size-4 shrink-0" />
            ) : (
              <Plus aria-hidden="true" className="size-4 shrink-0" />
            )
          }
          label={medicao ? "Editar" : "Nova medição"}
          tooltip={
            medicao
              ? `Editar medição ${medicao.numero}`
              : "Registrar nova medição"
          }
        />
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-2xl">
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>
              {medicao ? `Editar medição ${medicao.numero}` : "Nova medição"}
            </Modal.Title>
            <Modal.Description>
              Registre a medição por orçamento previsto.
            </Modal.Description>
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
                  <InputForm
                    label="Número"
                    type="number"
                    min={1}
                    required
                    {...form.register("numero", { valueAsNumber: true })}
                    error={form.formState.errors.numero?.message}
                  />
                  <label className="grid gap-2 text-sm font-semibold">
                    Tipo
                    <select
                      {...form.register("tipo")}
                      className="h-11 rounded-app border border-input bg-surface px-3 text-sm"
                    >
                      {tipoMedicaoSchema.options.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {TIPO_MEDICAO_LABELS[tipo]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <InputForm
                    label="Data"
                    type="date"
                    required
                    {...form.register("dataMedicao")}
                    error={form.formState.errors.dataMedicao?.message}
                  />
                  <label className="grid gap-2 text-sm font-semibold">
                    Órgão
                    <select
                      required
                      {...form.register("orgaoId")}
                      className="h-11 rounded-app border border-input bg-surface px-3 text-sm"
                      disabled={loadingOrgaos || orgaos.length === 0}
                    >
                      <option value="">
                        {loadingOrgaos ? "Carregando..." : "Selecione"}
                      </option>
                      {orgaos.map((orgao) => (
                        <option key={orgao.id} value={orgao.id}>
                          {orgao.sigla ? `${orgao.sigla} · ${orgao.nome}` : orgao.nome}
                        </option>
                      ))}
                    </select>
                    {form.formState.errors.orgaoId?.message && (
                      <Caption>{form.formState.errors.orgaoId.message}</Caption>
                    )}
                  </label>
                  <div className="sm:col-span-2">
                    <InputForm
                      label="Observações"
                      {...form.register("observacoes")}
                    />
                  </div>
                </div>
              )}
              {step === 1 && (
                <div className="grid gap-3">
                  {orcamentos.length === 0 && !loadingOrcamentos && (
                    <Caption>
                      Cadastre um orçamento antes de registrar medições.
                    </Caption>
                  )}
                  {fields.map((field, index) => {
                    const valorFieldName = `fontes.${index}.valor` as const;

                    return (
                      <div
                        key={field.id}
                        className="grid gap-2 sm:grid-cols-[1fr_160px_auto]"
                      >
                        <label className="grid gap-2 text-sm font-semibold">
                          Orçamento
                          <select
                            required
                            {...form.register(
                              `fontes.${index}.fonteId` as const,
                            )}
                            className="h-11 rounded-app border border-input bg-surface px-3 text-sm"
                            disabled={
                              loadingOrcamentos || orcamentos.length === 0
                            }
                          >
                            <option value="">
                              {loadingOrcamentos
                                ? "Carregando..."
                                : "Selecione"}
                            </option>
                            {orcamentos.map((orcamento) => (
                              <option
                                key={orcamento.orcamentoId}
                                value={orcamento.fonte.fonteId}
                              >
                                {orcamento.fonte.fonteNome} ·{" "}
                                {formatCurrency(orcamento.fonte.valor)}
                              </option>
                            ))}
                          </select>
                          {form.formState.errors.fontes?.[index]?.fonteId
                            ?.message && (
                            <Caption>
                              {
                                form.formState.errors.fontes[index]?.fonteId
                                  ?.message
                              }
                            </Caption>
                          )}
                        </label>
                        <label className="grid gap-2 text-sm font-semibold">
                          Valor
                          <InputMoney
                            valueInCents={moneyValueToCents(
                              fontes?.[index]?.valor,
                            )}
                            onBlur={() => void form.trigger(valorFieldName)}
                            onValueChange={({ valorInCents }) => {
                              form.setValue(
                                valorFieldName,
                                valorInCents / 100,
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                },
                              );
                            }}
                          />
                          {form.formState.errors.fontes?.[index]?.valor
                            ?.message && (
                            <Caption>
                              {
                                form.formState.errors.fontes[index]?.valor
                                  ?.message
                              }
                            </Caption>
                          )}
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Remover orçamento"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                        >
                          <Trash2 aria-hidden="true" className="size-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => append({ fonteId: "", valor: 0 })}
                  >
                    <Plus aria-hidden="true" className="size-4" /> Adicionar
                    orçamento
                  </Button>
                  {form.formState.errors.fontes?.message && (
                    <Caption>{form.formState.errors.fontes.message}</Caption>
                  )}
                </div>
              )}
              {step === 2 && (
                <Body>
                  Confira antes de salvar:{" "}
                  Nº {medicaoPreview.numero || "—"} ·{" "}
                  {TIPO_MEDICAO_LABELS[medicaoPreview.tipo ?? "NORMAL"]} ·{" "}
                  {medicaoPreview.dataMedicao || "—"} · Total{" "}
                  {formatCurrency(total)}.
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregar();
  }, [recarregar]);

  async function excluir(medicao: Medicao) {
    if (!confirm(`Excluir a medição ${medicao.numero}?`)) return;
    const res = await excluirMedicaoAction(obraId, medicao.id);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Medição excluída.");
    recarregar();
  }

  if (loading) return <Body className="p-5">Carregando medições...</Body>;

  if (medicoes.length === 0) {
    return (
      <div role="tabpanel" className="mt-5 grid gap-4 text-center">
        <Body className="font-semibold">Nenhuma medição registrada</Body>
        <Caption>
          Registre a primeira medição desta obra por orçamento previsto.
        </Caption>
        <div className="flex justify-center">
          <MedicaoModal obraId={obraId} onSaved={recarregar} />
        </div>
      </div>
    );
  }

  return (
    <div role="tabpanel" className="mt-5">
      <DataTable
        title="Medições"
        data={medicoes}
        getRowId={(row) => row.id}
        renderCardTitle={(row) =>
          `Medição ${row.numero} · ${TIPO_MEDICAO_LABELS[row.tipo] ?? row.tipo}`
        }
        action={<MedicaoModal obraId={obraId} onSaved={recarregar} />}
        columns={[
          {
            id: "numero",
            header: "Nº",
            numeric: true,
            cell: (row) => String(row.numero),
          },
          {
            id: "data",
            header: "Data",
            cell: (row) => formatDate(row.dataMedicao),
          },
          {
            id: "tipo",
            header: "Tipo",
            cell: (row) => TIPO_MEDICAO_LABELS[row.tipo] ?? row.tipo,
          },
          {
            id: "valor",
            header: "Valor",
            numeric: true,
            cell: (row) => totalMedicao(row),
          },
          {
            id: "acoes",
            header: "Ações",
            cell: (row) => (
              <span className="flex gap-2">
                <MedicaoModal
                  obraId={obraId}
                  medicao={row}
                  onSaved={recarregar}
                />
                <ActionButton
                  variant="ghost"
                  icon={<Trash2 aria-hidden="true" className="size-4 shrink-0" />}
                  label="Excluir"
                  tooltip={`Excluir medição ${row.numero}`}
                  onClick={() => excluir(row)}
                />
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
