"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Download, Play, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  criarAditivoAction,
  excluirAditivoAction,
  listAditivosAction,
} from "@/core/actions/contratos/aditivo_actions";
import {
  criarContratoAction,
  getContratoDaObraAction,
  getPrazoFinalAction,
  getValoresContratoAction,
} from "@/core/actions/contratos/contrato_actions";
import {
  criarParalisacaoAction,
  iniciarUploadTermoParalisacaoAction,
  listParalisacoesAction,
  reiniciarParalisacaoAction,
} from "@/core/actions/contratos/paralisacao_actions";
import { getAttachmentDownloadUrlAction } from "@/core/actions/documentos/attachment_actions";
import listEmpresasPaginationAction from "@/core/actions/empresas/list_empresas_pagination_action";
import listFontesPaginationAction from "@/core/actions/fontes/list_fontes_pagination_action";
import { useToast } from "@/core/hooks/useToast";
import {
  criarAditivoSchema,
  criarContratoSchema,
  criarParalisacaoSchema,
  tipoAditivoSchema,
  tipoPrazoExecucaoSchema,
  type Aditivo,
  type Contrato,
  type CriarAditivoInput,
  type CriarContratoInput,
  type CriarParalisacaoInput,
  type Paralisacao,
  type PrazoFinal,
} from "@/core/schemas/contratos/contrato_schema";
import type { EmpresaSchema } from "@/core/schemas/empresas/empresa_schema";
import type { FonteSchema } from "@/core/schemas/fontes/fonte_schema";
import { Button } from "@/core/ui/atoms/button";
import { ActionButton } from "@/core/ui/molecules/action-button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { InputMoney } from "@/core/ui/atoms/input-money";
import { Body, Caption, Heading } from "@/core/ui/atoms/typography";
import { InputForm } from "@/core/ui/molecules/input-form";
import { DateForm } from "@/core/ui/molecules/date-form";
import { Modal } from "@/core/ui/molecules/modal";
import { cn } from "@/core/ui/cn";

const TIPO_ADITIVO_LABELS: Record<string, string> = {
  PRAZO: "Prazo",
  VALOR: "Valor",
  PRAZO_E_VALOR: "Prazo e valor",
  FONTE: "Fonte",
  OUTROS: "Outros",
};

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const [datePart] = value.split("T");
  const parts = datePart.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatMoneyBRL(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatAditivoPrazo(aditivo: Aditivo) {
  if (aditivo.tipoPrazoExecucao === "DIAS" && aditivo.prazoExecucaoDias) {
    return `${aditivo.prazoExecucaoDias} dias`;
  }
  if (aditivo.tipoPrazoExecucao === "DATA") {
    return formatDate(aditivo.prazoExecucaoData);
  }
  return formatDate(aditivo.vigenciaAditivada);
}

function totalAditivoFontes(aditivo: Aditivo) {
  return aditivo.fontes.reduce((total, fonte) => {
    const valor = Number(String(fonte.valor).replace(",", "."));
    return Number.isFinite(valor) ? total + valor : total;
  }, 0);
}

function diferencaEmDias(dataInicial: string, dataFinal: string): number | undefined {
  const dataIso = /^(\d{4})-(\d{2})-(\d{2})$/;
  const inicioParts = dataIso.exec(dataInicial);
  const fimParts = dataIso.exec(dataFinal);
  if (!inicioParts || !fimParts) return undefined;

  const inicio = Date.UTC(
    Number(inicioParts[1]),
    Number(inicioParts[2]) - 1,
    Number(inicioParts[3]),
  );
  const fim = Date.UTC(
    Number(fimParts[1]),
    Number(fimParts[2]) - 1,
    Number(fimParts[3]),
  );

  if (!Number.isFinite(inicio) || !Number.isFinite(fim) || fim < inicio) {
    return undefined;
  }

  return Math.round((fim - inicio) / 86_400_000);
}

const VALORES_CONTRATO_LABELS: Record<string, string> = {
  valorOriginal: "Valor original do contrato",
  valorAditivos: "Valor dos aditivos",
  valorTotal: "Valor total atualizado",
};

function valoresResumo(valores: unknown): Array<[string, string]> {
  if (typeof valores !== "object" || valores === null) return [];
  return Object.entries(valores as Record<string, unknown>)
    .slice(0, 6)
    .map(([key, value]) => [
      VALORES_CONTRATO_LABELS[key] ??
        key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (char) => char.toUpperCase()),
      formatMoneyBRL(value),
    ]);
}

const contratoSteps = ["Identificação", "Prazo e fontes", "Revisão"];

type EmpresaContratadaOption = Pick<
  EmpresaSchema,
  "id" | "razaoSocial" | "nomeFantasia" | "cnpj" | "ativo"
>;
type FonteOption = Pick<FonteSchema, "id" | "nome" | "codigo" | "valorPrevisto" | "ativo">;

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length !== 14) return value;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}

function EmpresaContratadaSelect({
  empresas,
  error,
  loading,
  ...props
}: React.ComponentProps<"select"> & {
  empresas: EmpresaContratadaOption[];
  error?: string;
  loading?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      Empresa contratada
      <select
        required
        aria-invalid={error ? true : undefined}
        className="h-11 rounded-app border border-input bg-surface px-3 text-sm"
        disabled={loading || empresas.length === 0}
        {...props}
      >
        <option value="">
          {loading ? "Carregando..." : "Selecione a empresa"}
        </option>
        {empresas.map((empresa) => (
          <option key={empresa.id} value={empresa.id}>
            {empresa.nomeFantasia || empresa.razaoSocial} · {formatCnpj(empresa.cnpj)}
          </option>
        ))}
      </select>
      {error ? <Caption>{error}</Caption> : null}
    </label>
  );
}

function moneyValueToCents(value: unknown) {
  return Math.round(Number(value || 0) * 100);
}

function ContratoModal({ obraId, onSaved }: { obraId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [empresas, setEmpresas] = useState<EmpresaContratadaOption[]>([]);
  const [fontes, setFontes] = useState<FonteOption[]>([]);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);
  const [loadingFontes, setLoadingFontes] = useState(false);
  const toast = useToast();
  const form = useForm<CriarContratoInput>({
    resolver: zodResolver(criarContratoSchema),
    defaultValues: {
      obraId,
      empresaContratadaId: "",
      numero: "",
      objeto: "",
      dataAssinatura: "",
      fimVigencia: "",
      dataOs: "",
      tipoPrazoExecucao: "DIAS",
      prazoExecucaoDias: undefined,
      prazoExecucaoData: "",
      fontes: [{ fonteId: "", valor: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fontes",
  });
  const fontesPreview = useWatch({ control: form.control, name: "fontes" });
  const contratoPreview = useWatch({ control: form.control });
  const dataOs = useWatch({ control: form.control, name: "dataOs" });
  useEffect(() => {
    if (
      contratoPreview.tipoPrazoExecucao !== "DIAS" ||
      !dataOs ||
      !contratoPreview.fimVigencia
    ) {
      return;
    }

    const prazoEmDias = diferencaEmDias(dataOs, contratoPreview.fimVigencia);
    if (prazoEmDias === undefined || contratoPreview.prazoExecucaoDias === prazoEmDias) {
      return;
    }

    form.setValue("prazoExecucaoDias", prazoEmDias, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [
    contratoPreview.fimVigencia,
    contratoPreview.prazoExecucaoDias,
    contratoPreview.tipoPrazoExecucao,
    dataOs,
    form,
  ]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingEmpresas(true);
    setLoadingFontes(true);
    listEmpresasPaginationAction({ page: 1, take: 50, order: "ASC" })
      .then((page) => {
        if (active) setEmpresas(page.data.filter((empresa) => empresa.ativo));
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar as empresas.");
      })
      .finally(() => {
        if (active) setLoadingEmpresas(false);
      });
    listFontesPaginationAction({ page: 1, take: 50, order: "ASC", ativo: true })
      .then((page) => {
        if (active) setFontes(page.data.filter((fonte) => fonte.ativo));
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar as fontes.");
      })
      .finally(() => {
        if (active) setLoadingFontes(false);
      });
    return () => {
      active = false;
    };
  }, [open, toast]);

  async function onSubmit(values: CriarContratoInput) {
    const res = await criarContratoAction({
      ...values,
      obraId,
      fontes: values.fontes.map((fonte) => ({
        fonteId: fonte.fonteId,
        valor: Number(fonte.valor || 0).toFixed(2),
      })),
    });
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Contrato criado.");
    setOpen(false);
    setStep(0);
    form.reset();
    onSaved();
  }

  const fieldsByStep = [
    ["numero", "empresaContratadaId"],
    ["dataOs", "fontes"],
    [],
  ] as const;

  async function nextStep() {
    if (step >= contratoSteps.length - 1) return;
    const valid = await form.trigger(fieldsByStep[step]);
    if (valid) {
      setStep((current) => Math.min(current + 1, contratoSteps.length - 1));
    }
  }

  function handleFooterAction() {
    if (step < contratoSteps.length - 1) {
      void nextStep();
      return;
    }

    void form.handleSubmit(onSubmit)();
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <ActionButton
          icon={<Plus aria-hidden="true" className="size-4 shrink-0" />}
          label="Novo contrato"
          tooltip="Cadastrar contrato da obra"
        />
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-2xl">
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Novo contrato</Modal.Title>
            <Modal.Description>Informe os dados do contrato da obra.</Modal.Description>
          </Modal.Header>
          <ol className="flex flex-wrap gap-2">
            {contratoSteps.map((label, index) => (
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
          <form
            onSubmit={(event) => event.preventDefault()}
            className="grid gap-4"
          >
            <Modal.Body>
              {step === 0 && (
                <div className="grid gap-4">
                  <InputForm label="Número" required {...form.register("numero")} error={form.formState.errors.numero?.message} />
                  <EmpresaContratadaSelect
                    empresas={empresas}
                    loading={loadingEmpresas}
                    {...form.register("empresaContratadaId")}
                    error={form.formState.errors.empresaContratadaId?.message}
                  />
                  <InputForm label="Objeto" {...form.register("objeto")} />
                </div>
              )}
              {step === 1 && (
                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-semibold">
                    Tipo de prazo de execução
                    <select
                      {...form.register("tipoPrazoExecucao")}
                      className="h-11 rounded-app border border-input bg-surface px-3 text-sm"
                    >
                      {tipoPrazoExecucaoSchema.options.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo === "DIAS" ? "Prazo em dias" : "Data final"}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DateForm
                      label="Data da OS"
                      required
                      value={contratoPreview.dataOs ?? ""}
                      onBlur={() => void form.trigger("dataOs")}
                      onIsoChange={(iso) =>
                        form.setValue("dataOs", iso, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      error={form.formState.errors.dataOs?.message}
                    />
                    <DateForm
                      label="Assinatura"
                      value={contratoPreview.dataAssinatura ?? ""}
                      onBlur={() => void form.trigger("dataAssinatura")}
                      onIsoChange={(iso) =>
                        form.setValue("dataAssinatura", iso, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      error={form.formState.errors.dataAssinatura?.message}
                    />
                    <DateForm
                      label="Fim da vigência"
                      value={contratoPreview.fimVigencia ?? ""}
                      onBlur={() => void form.trigger("fimVigencia")}
                      onIsoChange={(iso) =>
                        form.setValue("fimVigencia", iso, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      error={form.formState.errors.fimVigencia?.message}
                    />
                    {contratoPreview.tipoPrazoExecucao === "DIAS" ? (
                      <InputForm
                        label="Prazo em dias"
                        type="number"
                        min={1}
                        error={form.formState.errors.prazoExecucaoDias?.message}
                        {...form.register("prazoExecucaoDias", {
                          setValueAs: (value) =>
                            value === "" ? undefined : Number(value),
                        })}
                      />
                    ) : (
                      <DateForm
                        label="Data final da execução"
                        value={contratoPreview.prazoExecucaoData ?? ""}
                        onBlur={() => void form.trigger("prazoExecucaoData")}
                        onIsoChange={(iso) =>
                          form.setValue("prazoExecucaoData", iso, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        error={form.formState.errors.prazoExecucaoData?.message}
                      />
                    )}
                  </div>
                  <div className="grid gap-3">
                    <Caption className="font-semibold text-foreground">Fontes do contrato</Caption>
                    {fontes.length === 0 && !loadingFontes ? (
                      <Caption>Cadastre uma fonte ativa antes de criar contratos.</Caption>
                    ) : null}
                    {fields.map((field, index) => {
                      const valorFieldName = `fontes.${index}.valor` as const;

                      return (
                        <div
                          key={field.id}
                          className="grid gap-2 sm:grid-cols-[1fr_160px_auto]"
                        >
                          <label className="grid gap-2 text-sm font-semibold">
                            Fonte
                            <select
                              required
                              {...form.register(`fontes.${index}.fonteId` as const)}
                              className="h-11 rounded-app border border-input bg-surface px-3 text-sm"
                              disabled={loadingFontes}
                            >
                              <option value="">
                                {loadingFontes ? "Carregando..." : "Selecione"}
                              </option>
                              {fontes.map((fonte) => (
                                <option key={fonte.id} value={fonte.id}>
                                  {fonte.codigo ? `${fonte.codigo} · ${fonte.nome}` : fonte.nome}
                                  {fonte.valorPrevisto ? ` · ${formatMoneyBRL(fonte.valorPrevisto)}` : ""}
                                </option>
                              ))}
                            </select>
                            {form.formState.errors.fontes?.[index]?.fonteId?.message ? (
                              <Caption>
                                {form.formState.errors.fontes[index]?.fonteId?.message}
                              </Caption>
                            ) : null}
                          </label>
                          <label className="grid gap-2 text-sm font-semibold">
                            Valor
                            <InputMoney
                              valueInCents={moneyValueToCents(fontesPreview?.[index]?.valor)}
                              onBlur={() => void form.trigger(valorFieldName)}
                              onValueChange={({ valorInCents }) => {
                                form.setValue(valorFieldName, (valorInCents / 100).toFixed(2), {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                });
                              }}
                            />
                            {form.formState.errors.fontes?.[index]?.valor?.message ? (
                              <Caption>
                                {form.formState.errors.fontes[index]?.valor?.message}
                              </Caption>
                            ) : null}
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label="Remover fonte"
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
                      onClick={() => append({ fonteId: "", valor: "" })}
                    >
                      <Plus aria-hidden="true" className="size-4" /> Adicionar fonte
                    </Button>
                    {form.formState.errors.fontes?.message ? (
                      <Caption>{form.formState.errors.fontes.message}</Caption>
                    ) : null}
                  </div>
                </div>
              )}
              {step === 2 && (
                <Body>
                  Confira antes de salvar: contrato {contratoPreview.numero || "—"} · OS{" "}
                  {formatDate(contratoPreview.dataOs) || "—"} · {fontesPreview?.length ?? 0} fonte(s).
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
              <Button
                type="button"
                disabled={form.formState.isSubmitting}
                onClick={handleFooterAction}
              >
                {step < contratoSteps.length - 1
                  ? "Avançar"
                  : form.formState.isSubmitting
                    ? "Salvando..."
                    : "Salvar"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}

function AditivoModal({ obraId, contratoId, onSaved }: { obraId: string; contratoId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [fontes, setFontes] = useState<FonteOption[]>([]);
  const [loadingFontes, setLoadingFontes] = useState(false);
  const toast = useToast();
  const form = useForm<CriarAditivoInput>({
    resolver: zodResolver(criarAditivoSchema),
    defaultValues: {
      numero: "",
      tipo: "PRAZO",
      dataAssinatura: "",
      tipoPrazoExecucao: "DIAS",
      fontes: [{ fonteId: "", valor: "" }],
      observacoes: "",
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fontes",
  });
  const valoresAditivo = useWatch({ control: form.control });
  const fontesAditivo = useWatch({ control: form.control, name: "fontes" });
  const aditivoAmpliaPrazo =
    valoresAditivo.tipo === "PRAZO" || valoresAditivo.tipo === "PRAZO_E_VALOR";
  const aditivoTemValor =
    valoresAditivo.tipo === "VALOR" || valoresAditivo.tipo === "PRAZO_E_VALOR";

  useEffect(() => {
    if (!open) return;
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingFontes(true);
    listFontesPaginationAction({ page: 1, take: 50, order: "ASC", ativo: true })
      .then((page) => {
        if (active) setFontes(page.data.filter((fonte) => fonte.ativo));
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar as fontes.");
      })
      .finally(() => {
        if (active) setLoadingFontes(false);
      });
    return () => {
      active = false;
    };
  }, [open, toast]);

  async function onSubmit(values: CriarAditivoInput) {
    const res = await criarAditivoAction(obraId, contratoId, {
      ...values,
      fontes: values.fontes.map((fonte) => ({
        fonteId: fonte.fonteId,
        valor: Number(fonte.valor || 0).toFixed(2),
      })),
    });
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Aditivo criado.");
    setOpen(false);
    form.reset();
    onSaved();
  }

  function alterarTipoPrazo(tipo: "DIAS" | "DATA") {
    form.setValue("tipoPrazoExecucao", tipo, { shouldDirty: true });
    if (tipo === "DIAS") {
      form.setValue("prazoExecucaoData", "", { shouldDirty: true });
    } else {
      form.setValue("prazoExecucaoDias", undefined, { shouldDirty: true });
    }
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <ActionButton
          variant="secondary"
          icon={<Plus aria-hidden="true" className="size-4 shrink-0" />}
          label="Aditivo"
          tooltip="Registrar novo aditivo"
        />
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Novo aditivo</Modal.Title>
            <Modal.Description>Aditivo de prazo, valor ou ambos.</Modal.Description>
          </Modal.Header>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <InputForm label="Número" required {...form.register("numero")} error={form.formState.errors.numero?.message} />
              <label className="grid gap-2 text-sm font-semibold">
                Tipo
                <select
                  {...form.register("tipo")}
                  className="h-11 rounded-app border border-input bg-surface px-3 text-sm"
                >
                  {tipoAditivoSchema.options.map((t) => (
                    <option key={t} value={t}>
                      {TIPO_ADITIVO_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <DateForm
                label="Assinatura"
                required
                value={valoresAditivo.dataAssinatura ?? ""}
                onBlur={() => void form.trigger("dataAssinatura")}
                onIsoChange={(iso) =>
                  form.setValue("dataAssinatura", iso, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                error={form.formState.errors.dataAssinatura?.message}
              />
              {aditivoAmpliaPrazo ? (
                <>
                  <label className="grid gap-2 text-sm font-semibold">
                    Tipo de prazo
                    <select
                      value={valoresAditivo.tipoPrazoExecucao ?? "DIAS"}
                      onChange={(event) =>
                        alterarTipoPrazo(event.target.value as "DIAS" | "DATA")
                      }
                      className="h-11 rounded-app border border-input bg-surface px-3 text-sm"
                    >
                      <option value="DIAS">Prazo em dias</option>
                      <option value="DATA">Data final</option>
                    </select>
                    {form.formState.errors.tipoPrazoExecucao?.message ? (
                      <Caption>{form.formState.errors.tipoPrazoExecucao.message}</Caption>
                    ) : null}
                  </label>
                  {valoresAditivo.tipoPrazoExecucao !== "DATA" ? (
                    <InputForm
                      label="Prazo aditivado (dias)"
                      type="number"
                      min={1}
                      required
                      {...form.register("prazoExecucaoDias", {
                        setValueAs: (value) =>
                          value === "" ? undefined : Number(value),
                      })}
                      error={form.formState.errors.prazoExecucaoDias?.message}
                    />
                  ) : (
                    <DateForm
                      label="Data final do prazo aditivado"
                      required
                      value={valoresAditivo.prazoExecucaoData ?? ""}
                      onBlur={() => void form.trigger("prazoExecucaoData")}
                      onIsoChange={(iso) =>
                        form.setValue("prazoExecucaoData", iso, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      error={form.formState.errors.prazoExecucaoData?.message}
                    />
                  )}
                </>
              ) : null}
              {aditivoTemValor ? (
                <div className="grid gap-3">
                  <Caption className="font-semibold text-foreground">Fontes do aditivo</Caption>
                  {fields.map((field, index) => {
                    const valorFieldName = `fontes.${index}.valor` as const;
                    return (
                      <div key={field.id} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                        <label className="grid gap-2 text-sm font-semibold">
                          Fonte
                          <select
                            required
                            {...form.register(`fontes.${index}.fonteId` as const)}
                            className="h-11 rounded-app border border-input bg-surface px-3 text-sm"
                            disabled={loadingFontes}
                          >
                            <option value="">
                              {loadingFontes ? "Carregando..." : "Selecione"}
                            </option>
                            {fontes.map((fonte) => (
                              <option key={fonte.id} value={fonte.id}>
                                {fonte.codigo ? `${fonte.codigo} · ${fonte.nome}` : fonte.nome}
                              </option>
                            ))}
                          </select>
                          {form.formState.errors.fontes?.[index]?.fonteId?.message ? (
                            <Caption>{form.formState.errors.fontes[index]?.fonteId?.message}</Caption>
                          ) : null}
                        </label>
                        <label className="grid gap-2 text-sm font-semibold">
                          Valor
                          <InputMoney
                            valueInCents={moneyValueToCents(fontesAditivo?.[index]?.valor)}
                            onBlur={() => void form.trigger(valorFieldName)}
                            onValueChange={({ valorInCents }) => {
                              form.setValue(valorFieldName, (valorInCents / 100).toFixed(2), {
                                shouldDirty: true,
                                shouldValidate: true,
                              });
                            }}
                          />
                          {form.formState.errors.fontes?.[index]?.valor?.message ? (
                            <Caption>{form.formState.errors.fontes[index]?.valor?.message}</Caption>
                          ) : null}
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          aria-label="Remover fonte"
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
                    onClick={() => append({ fonteId: "", valor: "" })}
                  >
                    <Plus aria-hidden="true" className="size-4" /> Adicionar fonte
                  </Button>
                  {form.formState.errors.fontes?.message ? (
                    <Caption>{form.formState.errors.fontes.message}</Caption>
                  ) : null}
                </div>
              ) : null}
              <InputForm label="Observações" {...form.register("observacoes")} />
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

function ParalisacaoModal({ obraId, contratoId, onSaved }: { obraId: string; contratoId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [termoFile, setTermoFile] = useState<File | null>(null);
  const [uploadingTermo, setUploadingTermo] = useState(false);
  const toast = useToast();
  const form = useForm<CriarParalisacaoInput>({
    resolver: zodResolver(criarParalisacaoSchema),
    defaultValues: { dataParalisacao: "", motivo: "", termoParalisacaoArquivoId: "" },
  });
  const valoresParalisacao = useWatch({ control: form.control });

  function selecionarTermo(file: File | undefined) {
    if (!file) return;
    setTermoFile(file);
    form.clearErrors("termoParalisacaoArquivoId");
  }

  async function salvar() {
    const camposValidos = await form.trigger(["dataParalisacao", "motivo"]);
    if (!camposValidos) return;
    if (!termoFile) {
      form.setError("termoParalisacaoArquivoId", {
        type: "required",
        message: "Anexe o termo de paralisação.",
      });
      return;
    }

    setUploadingTermo(true);
    const mimeType = termoFile.type || "application/octet-stream";
    const started = await iniciarUploadTermoParalisacaoAction(contratoId, {
      nomeOriginal: termoFile.name,
      mimeType,
    });

    if (!started.success) {
      setUploadingTermo(false);
      toast.error(started.error);
      return;
    }

    try {
      const response = await fetch(started.data.urlUpload, {
        method: "PUT",
        body: termoFile,
        headers: { "Content-Type": mimeType },
      });
      if (!response.ok) throw new Error("Não foi possível enviar o termo.");
      form.setValue("termoParalisacaoArquivoId", started.data.attachmentId, {
        shouldDirty: true,
      });

      const res = await criarParalisacaoAction(obraId, contratoId, {
        ...form.getValues(),
        termoParalisacaoArquivoId: started.data.attachmentId,
      });
      if (!res.success) {
        toast.error(res.error);
        return;
      }

      toast.success("Paralisação registrada.");
      setOpen(false);
      setTermoFile(null);
      form.reset();
      onSaved();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar o termo.",
      );
    } finally {
      setUploadingTermo(false);
    }
  }

  return (
    <Modal.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setTermoFile(null);
          form.reset();
        }
      }}
    >
      <Modal.Trigger asChild>
        <ActionButton
          variant="secondary"
          icon={<Plus aria-hidden="true" className="size-4 shrink-0" />}
          label="Paralisação"
          tooltip="Registrar nova paralisação"
        />
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Nova paralisação</Modal.Title>
            <Modal.Description>Registre a paralisação da execução.</Modal.Description>
          </Modal.Header>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void salvar();
            }}
            className="grid gap-4"
          >
            <Modal.Body>
              <DateForm
                label="Data"
                required
                value={valoresParalisacao.dataParalisacao ?? ""}
                onBlur={() => void form.trigger("dataParalisacao")}
                onIsoChange={(iso) =>
                  form.setValue("dataParalisacao", iso, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                error={form.formState.errors.dataParalisacao?.message}
              />
              <InputForm label="Motivo" required {...form.register("motivo")} error={form.formState.errors.motivo?.message} />
              <label className="grid gap-2 text-sm font-semibold">
                Termo de paralisação <span className="text-danger">*</span>
                <input
                  type="file"
                  onChange={(event) => selecionarTermo(event.target.files?.[0])}
                  className="block min-h-11 w-full rounded-app border border-input bg-surface px-3 py-2 text-sm font-normal"
                />
                <Caption>
                  {uploadingTermo
                    ? "Enviando termo e salvando..."
                    : termoFile
                      ? `${termoFile.name} · pronto para envio`
                      : "Selecione o arquivo do termo."}
                </Caption>
                {form.formState.errors.termoParalisacaoArquivoId?.message ? (
                  <Caption>{form.formState.errors.termoParalisacaoArquivoId.message}</Caption>
                ) : null}
              </label>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              <Button
                type="submit"
                disabled={uploadingTermo}
              >
                {uploadingTermo ? "Enviando e salvando..." : "Salvar"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}

export function ContratoTab({ obraId }: { obraId: string }) {
  const toast = useToast();
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [aditivos, setAditivos] = useState<Aditivo[]>([]);
  const [paralisacoes, setParalisacoes] = useState<Paralisacao[]>([]);
  const [prazo, setPrazo] = useState<PrazoFinal | null>(null);
  const [valores, setValores] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  const recarregar = useCallback(async () => {
    setLoading(true);
    const res = await getContratoDaObraAction(obraId);
    if (!res.success) {
      setLoading(false);
      toast.error(res.error);
      return;
    }
    setContrato(res.data);
    if (res.data) {
      const [a, p, prazoRes, valoresRes] = await Promise.all([
        listAditivosAction(obraId, res.data.id),
        listParalisacoesAction(obraId, res.data.id),
        getPrazoFinalAction(res.data.id),
        getValoresContratoAction(res.data.id),
      ]);
      if (a.success) setAditivos(a.data);
      if (p.success) setParalisacoes(p.data);
      if (prazoRes.success) setPrazo(prazoRes.data);
      if (valoresRes.success) setValores(valoresRes.data);
    }
    setLoading(false);
  }, [obraId, toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recarregar();
  }, [recarregar]);

  async function reiniciar(paralisacaoId: string) {
    const hoje = new Date().toISOString().slice(0, 10);
    const res = await reiniciarParalisacaoAction(obraId, paralisacaoId, { dataReinicio: hoje });
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Reinício registrado.");
    recarregar();
  }

  async function baixarTermo(attachmentId: string) {
    const res = await getAttachmentDownloadUrlAction(attachmentId);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    const link = document.createElement("a");
    link.href = res.data.url;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function excluirAditivo(aditivoId: string) {
    if (!contrato) return;
    const res = await excluirAditivoAction(obraId, contrato.id, aditivoId);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Aditivo excluído.");
    recarregar();
  }

  if (loading) return <Body className="p-5">Carregando contrato...</Body>;

  if (!contrato) {
    return (
      <div role="tabpanel" className="mt-5 grid gap-4 text-center">
        <Body className="font-semibold">Nenhum contrato vinculado</Body>
        <Caption>Cadastre o contrato desta obra para gerir aditivos e paralisações.</Caption>
        <div className="flex justify-center">
          <ContratoModal obraId={obraId} onSaved={recarregar} />
        </div>
      </div>
    );
  }

  return (
    <div role="tabpanel" className="mt-5 grid gap-4">
      <section className="overflow-hidden rounded-app border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <Heading as="h3">Contrato {contrato.numero}</Heading>
          <Caption>
            OS {formatDate(contrato.dataOs)} · Prazo final{" "}
            {prazo ? formatDate(prazo.prazoFinal) : "—"} · Valor inicial{" "}
            {formatMoneyBRL(contrato.valorContratadoInicial)}
          </Caption>
        </div>
        <dl className="m-0">
          {[
            ["Objeto", typeof contrato.objeto === "string" && contrato.objeto ? contrato.objeto : "—"],
            ["Assinatura", formatDate(contrato.dataAssinatura)],
            ["Fim da vigência", formatDate(contrato.fimVigencia)],
            ...valoresResumo(valores),
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[minmax(120px,1fr)_1.3fr] gap-4 border-b border-border px-4 py-2.5 text-[13px] last:border-0">
              <dt className="text-muted">{label}</dt>
              <dd className="m-0 font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <DataTable
        title="Aditivos"
        data={aditivos}
        getRowId={(row) => row.id}
        renderCardTitle={(row) => `${row.numero} · ${TIPO_ADITIVO_LABELS[row.tipo] ?? row.tipo}`}
        action={contrato ? <AditivoModal obraId={obraId} contratoId={contrato.id} onSaved={recarregar} /> : undefined}
        columns={[
          { id: "numero", header: "Número", cell: (row) => row.numero },
          { id: "tipo", header: "Tipo", cell: (row) => TIPO_ADITIVO_LABELS[row.tipo] ?? row.tipo },
          { id: "assinatura", header: "Assinatura", cell: (row) => formatDate(row.dataAssinatura) },
          {
            id: "prazo",
            header: "Prazo",
            cell: (row) =>
              row.tipo === "PRAZO" || row.tipo === "PRAZO_E_VALOR"
                ? formatAditivoPrazo(row)
                : "—",
          },
          {
            id: "valor",
            header: "Valor",
            numeric: true,
            cell: (row) =>
              row.tipo === "VALOR" || row.tipo === "PRAZO_E_VALOR"
                ? formatMoneyBRL(totalAditivoFontes(row))
                : "—",
          },
          {
            id: "observacoes",
            header: "Observações",
            cell: (row) => row.observacoes || "—",
          },
          {
            id: "acoes",
            header: "Ações",
            cell: (row) => (
              <ActionButton
                variant="ghost"
                icon={<Trash2 aria-hidden="true" className="size-4 shrink-0" />}
                label="Excluir"
                tooltip={`Excluir aditivo ${row.numero}`}
                onClick={() => excluirAditivo(row.id)}
              />
            ),
          },
        ]}
      />

      <DataTable
        title="Paralisações"
        data={paralisacoes}
        getRowId={(row) => row.id}
        renderCardTitle={(row) => `${formatDate(row.dataParalisacao)} · ${row.motivo}`}
        action={contrato ? <ParalisacaoModal obraId={obraId} contratoId={contrato.id} onSaved={recarregar} /> : undefined}
        columns={[
          { id: "data", header: "Data", cell: (row) => formatDate(row.dataParalisacao) },
          { id: "motivo", header: "Motivo", cell: (row) => row.motivo },
          { id: "reinicio", header: "Reinício", cell: (row) => formatDate(row.dataReinicio) },
          {
            id: "acoes",
            header: "Ações",
            cell: (row) => (
              <div className="flex flex-wrap items-center gap-2">
                {row.termoParalisacaoArquivoId ? (
                  <ActionButton
                    variant="ghost"
                    icon={<Download aria-hidden="true" className="size-4 shrink-0" />}
                    label="Termo"
                    tooltip="Baixar termo de paralisação"
                    onClick={() => baixarTermo(row.termoParalisacaoArquivoId!)}
                  />
                ) : null}
                {!row.dataReinicio ? (
                  <ActionButton
                    variant="secondary"
                    icon={<Play aria-hidden="true" className="size-4 shrink-0" />}
                    label="Reinício"
                    tooltip={`Registrar reinício da paralisação de ${formatDate(row.dataParalisacao)}`}
                    onClick={() => reiniciar(row.id)}
                  />
                ) : null}
                {row.dataReinicio && !row.termoParalisacaoArquivoId ? "—" : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
