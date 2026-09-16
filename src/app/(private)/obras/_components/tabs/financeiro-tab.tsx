"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  atualizarEmpenhoAction,
  atualizarLiquidacaoAction,
  atualizarPagamentoAction,
  criarEmpenhoAction,
  criarLiquidacaoAction,
  criarPagamentoAction,
  deleteEmpenhoAction,
  deleteLiquidacaoAction,
  deletePagamentoAction,
  getVisaoFisicoFinanceiraAction,
  listEmpenhosAction,
  listLiquidacoesAction,
  listPagamentosAction,
} from "@/core/actions/financeiro/financeiro_actions";
import { useToast } from "@/core/hooks/useToast";
import {
  atualizarEmpenhoSchema,
  atualizarLiquidacaoSchema,
  atualizarPagamentoSchema,
  criarEmpenhoSchema,
  criarLiquidacaoSchema,
  criarPagamentoSchema,
  type AtualizarEmpenhoInput,
  type AtualizarEmpenhoFormInput,
  type AtualizarLiquidacaoInput,
  type AtualizarLiquidacaoFormInput,
  type AtualizarPagamentoInput,
  type AtualizarPagamentoFormInput,
  type CriarEmpenhoInput,
  type CriarEmpenhoFormInput,
  type CriarLiquidacaoInput,
  type CriarLiquidacaoFormInput,
  type CriarPagamentoInput,
  type CriarPagamentoFormInput,
  type Empenho,
  type Liquidacao,
  type Pagamento,
  type VisaoFisicoFinanceira,
} from "@/core/schemas/financeiro";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { Body, Caption } from "@/core/ui/atoms/typography";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";

type Recurso = "empenho" | "liquidacao" | "pagamento";

type FinanceiroState = {
  empenhos: Empenho[];
  liquidacoes: Liquidacao[];
  pagamentos: Pagamento[];
  visao: VisaoFisicoFinanceira | null;
};

const emptyState: FinanceiroState = {
  empenhos: [],
  liquidacoes: [],
  pagamentos: [],
  visao: null,
};

function asNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value.replace(",", ".")) || 0;
  return 0;
}

function formatCurrency(value: unknown) {
  return asNumber(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatPercent(value: unknown) {
  return `${asNumber(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "—";
}

function alertaPagamento(data: unknown) {
  if (typeof data !== "object" || data === null) return null;
  const value =
    "alerta" in data ? data.alerta : "warning" in data ? data.warning : null;
  return typeof value === "string" && value ? value : null;
}

function numeroLancamento(row: { numero?: string | null; numeroOrdemBancaria?: string | null }) {
  return row.numero ?? row.numeroOrdemBancaria ?? null;
}

export function FinanceiroTab({ obraId }: { obraId: string }) {
  const toast = useToast();
  const [state, setState] = useState<FinanceiroState>(emptyState);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [empenhos, liquidacoes, pagamentos, visao] = await Promise.all([
      listEmpenhosAction(obraId),
      listLiquidacoesAction(obraId),
      listPagamentosAction(obraId),
      getVisaoFisicoFinanceiraAction(obraId),
    ]);

    const firstError = [empenhos, liquidacoes, pagamentos, visao].find(
      (res) => !res.success,
    );
    if (firstError?.error) toast.error(firstError.error);

    setState({
      empenhos: empenhos.success ? empenhos.data : [],
      liquidacoes: liquidacoes.success ? liquidacoes.data : [],
      pagamentos: pagamentos.success ? pagamentos.data : [],
      visao: visao.success ? visao.data : null,
    });
    setLoading(false);
  }, [obraId, toast]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeout);
  }, [load]);

  const totais = useMemo(
    () => ({
      empenhado: state.empenhos.reduce(
        (sum, item) => sum + asNumber(item.valor),
        0,
      ),
      liquidado: state.liquidacoes.reduce(
        (sum, item) => sum + asNumber(item.valor),
        0,
      ),
      pago: state.pagamentos.reduce(
        (sum, item) => sum + asNumber(item.valor),
        0,
      ),
    }),
    [state],
  );

  return (
    <div role="tabpanel" className="grid gap-5 p-5" data-obra-id={obraId}>
      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {(
          [
            "contratado",
            "aditivado",
            "medido",
            "empenhado",
            "liquidado",
            "pago",
          ] as const
        ).map((key) => {
          const item = state.visao?.[key];
          return (
            <div
              key={key}
              className="overflow-hidden rounded-app border border-border bg-surface"
            >
              <div className="border-b border-border px-4 py-2 text-xs font-semibold text-muted capitalize">
                {key}
              </div>
              <div className="grid gap-1 px-4 py-3">
                <span className="font-display text-lg font-semibold tabular-nums">
                  {item
                    ? formatCurrency(item.valor)
                    : key in totais
                      ? formatCurrency(totais[key as keyof typeof totais])
                      : "—"}
                </span>
                <span className="text-xs text-muted">
                  {item ? formatPercent(item.percentual) : "—"}
                </span>
              </div>
            </div>
          );
        })}
      </section>

      {loading ? (
        <Caption>Carregando lançamentos financeiros...</Caption>
      ) : null}

      <LancamentosSection
        recurso="empenho"
        title="Empenhos"
        rows={state.empenhos}
        toolbar={<EmpenhoModal obraId={obraId} onSaved={load} />}
        onDelete={async (id) => deleteEmpenhoAction(obraId, id)}
        renderEdit={(item) => (
          <EmpenhoModal obraId={obraId} registro={item} onSaved={load} />
        )}
        onSaved={load}
      />
      <LancamentosSection
        recurso="liquidacao"
        title="Liquidações"
        rows={state.liquidacoes}
        toolbar={
          <LiquidacaoModal
            obraId={obraId}
            empenhos={state.empenhos}
            onSaved={load}
          />
        }
        onDelete={async (id) => deleteLiquidacaoAction(obraId, id)}
        renderEdit={(item) => (
          <LiquidacaoModal
            obraId={obraId}
            registro={item}
            empenhos={state.empenhos}
            onSaved={load}
          />
        )}
        onSaved={load}
      />
      <LancamentosSection
        recurso="pagamento"
        title="Pagamentos"
        rows={state.pagamentos}
        toolbar={
          <PagamentoModal
            obraId={obraId}
            liquidacoes={state.liquidacoes}
            onSaved={load}
          />
        }
        onDelete={async (id) => deletePagamentoAction(obraId, id)}
        renderEdit={(item) => (
          <PagamentoModal
            obraId={obraId}
            registro={item}
            liquidacoes={state.liquidacoes}
            onSaved={load}
          />
        )}
        onSaved={load}
      />
    </div>
  );
}

function LancamentosSection<
  T extends {
    id: string;
    valor: string | number;
    numero?: string | null;
    numeroOrdemBancaria?: string | null;
    fonteId: string;
  },
>({
  title,
  rows,
  toolbar,
  onDelete,
  renderEdit,
  onSaved,
  recurso,
}: {
  title: string;
  rows: T[];
  toolbar: React.ReactNode;
  onDelete: (id: string) => Promise<{ success: boolean; error: string | null }>;
  renderEdit: (item: T) => React.ReactNode;
  onSaved: () => void;
  recurso: Recurso;
}) {
  const toast = useToast();
  const dateKey =
    recurso === "empenho"
      ? "dataEmpenho"
      : recurso === "liquidacao"
        ? "dataLiquidacao"
        : "dataPagamento";

  async function remove(id: string) {
    if (!confirm(`Excluir este registro de ${title.toLowerCase()}?`)) return;
    const res = await onDelete(id);
    if (!res.success) {
      toast.error(res.error ?? "Não foi possível excluir.");
      return;
    }
    toast.success("Registro excluído.");
    onSaved();
  }

  return (
    <section className="grid gap-3 rounded-app border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Body className="font-semibold">{title}</Body>
          <Caption>{rows.length} registro(s)</Caption>
        </div>
        {toolbar}
      </div>
      <DataTable
        title={title}
        data={rows}
        getRowId={(row) => row.id}
        renderCardTitle={(row) => text(numeroLancamento(row))}
        renderCardStatus={(row) => formatCurrency(row.valor)}
        columns={[
          { id: "numero", header: "Número", cell: (row) => text(numeroLancamento(row)) },
          {
            id: "data",
            header: "Data",
            cell: (row) =>
              formatDate((row as Record<string, unknown>)[dateKey]),
          },
          { id: "fonte", header: "Fonte", cell: (row) => row.fonteId },
          {
            id: "valor",
            header: "Valor",
            numeric: true,
            cell: (row) => formatCurrency(row.valor),
          },
          {
            id: "actions",
            header: "Ações",
            cell: (row) => (
              <div className="flex justify-end gap-2">
                {renderEdit(row)}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => void remove(row.id)}
                >
                  <Trash2 className="size-4" /> Excluir
                </Button>
              </div>
            ),
            numeric: true,
          },
        ]}
      />
    </section>
  );
}

function EmpenhoModal({
  obraId,
  registro,
  onSaved,
}: {
  obraId: string;
  registro?: Empenho;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const form = useForm<
    CriarEmpenhoFormInput | AtualizarEmpenhoFormInput,
    unknown,
    CriarEmpenhoInput | AtualizarEmpenhoInput
  >({
    resolver: zodResolver(
      registro ? atualizarEmpenhoSchema : criarEmpenhoSchema,
    ),
    defaultValues: {
      fonteId: registro?.fonteId ?? "",
      valor: registro?.valor ?? "",
      numero: registro?.numero ?? "",
      tipo: registro?.tipo ?? "ORDINARIO",
      dataEmpenho: registro?.dataEmpenho?.slice(0, 10) ?? "",
      observacoes: registro?.observacoes ?? registro?.observacao ?? "",
    },
  });

  async function onSubmit(values: CriarEmpenhoInput | AtualizarEmpenhoInput) {
    const res = registro
      ? await atualizarEmpenhoAction(
          obraId,
          registro.id,
          values as AtualizarEmpenhoInput,
        )
      : await criarEmpenhoAction(obraId, values as CriarEmpenhoInput);
    if (!res.success) return toast.error(res.error);
    toast.success(registro ? "Empenho atualizado." : "Empenho criado.");
    setOpen(false);
    form.reset();
    onSaved();
  }

  return (
    <LancamentoModal
      title={registro ? "Editar empenho" : "Novo empenho"}
      open={open}
      setOpen={setOpen}
      trigger={
        registro ? (
          <>
            <Edit2 className="size-4" /> Editar
          </>
        ) : (
          <>
            <Plus className="size-4" /> Novo empenho
          </>
        )
      }
      onSubmit={form.handleSubmit(onSubmit)}
      submitting={form.formState.isSubmitting}
    >
      <SelectField
        label="Tipo"
        {...form.register("tipo")}
        error={form.formState.errors.tipo?.message}
      >
        <option value="ORDINARIO">Ordinário</option>
        <option value="ESTIMATIVO">Estimativo</option>
        <option value="GLOBAL">Global</option>
      </SelectField>
      <CommonFields
        form={form}
        dateName="dataEmpenho"
        dateLabel="Data do empenho"
      />
    </LancamentoModal>
  );
}

function LiquidacaoModal({
  obraId,
  registro,
  empenhos,
  onSaved,
}: {
  obraId: string;
  registro?: Liquidacao;
  empenhos: Empenho[];
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const form = useForm<
    CriarLiquidacaoFormInput | AtualizarLiquidacaoFormInput,
    unknown,
    CriarLiquidacaoInput | AtualizarLiquidacaoInput
  >({
    resolver: zodResolver(
      registro ? atualizarLiquidacaoSchema : criarLiquidacaoSchema,
    ),
    defaultValues: {
      empenhoId: registro?.empenhoId ?? "",
      fonteId: registro?.fonteId ?? "",
      valor: registro?.valor ?? "",
      numero: registro?.numero ?? "",
      dataLiquidacao: registro?.dataLiquidacao?.slice(0, 10) ?? "",
      observacoes: registro?.observacoes ?? registro?.observacao ?? "",
    },
  });

  async function onSubmit(
    values: CriarLiquidacaoInput | AtualizarLiquidacaoInput,
  ) {
    const res = registro
      ? await atualizarLiquidacaoAction(
          obraId,
          registro.id,
          values as AtualizarLiquidacaoInput,
        )
      : await criarLiquidacaoAction(obraId, values as CriarLiquidacaoInput);
    if (!res.success) return toast.error(res.error);
    toast.success(registro ? "Liquidação atualizada." : "Liquidação criada.");
    setOpen(false);
    form.reset();
    onSaved();
  }

  return (
    <LancamentoModal
      title={registro ? "Editar liquidação" : "Nova liquidação"}
      open={open}
      setOpen={setOpen}
      trigger={
        registro ? (
          <>
            <Edit2 className="size-4" /> Editar
          </>
        ) : (
          <>
            <Plus className="size-4" /> Nova liquidação
          </>
        )
      }
      onSubmit={form.handleSubmit(onSubmit)}
      submitting={form.formState.isSubmitting}
    >
      <SelectField
        label="Empenho"
        {...form.register("empenhoId")}
        error={form.formState.errors.empenhoId?.message}
      >
        <option value="">Selecione</option>
        {empenhos.map((item) => (
          <option key={item.id} value={item.id}>
            {item.numero || item.id} · {formatCurrency(item.valor)}
          </option>
        ))}
      </SelectField>
      <CommonFields
        form={form}
        dateName="dataLiquidacao"
        dateLabel="Data da liquidação"
      />
    </LancamentoModal>
  );
}

function PagamentoModal({
  obraId,
  registro,
  liquidacoes,
  onSaved,
}: {
  obraId: string;
  registro?: Pagamento;
  liquidacoes: Liquidacao[];
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const form = useForm<
    CriarPagamentoFormInput | AtualizarPagamentoFormInput,
    unknown,
    CriarPagamentoInput | AtualizarPagamentoInput
  >({
    resolver: zodResolver(
      registro ? atualizarPagamentoSchema : criarPagamentoSchema,
    ),
    defaultValues: {
      liquidacaoId: registro?.liquidacaoId ?? "",
      empenhoId: registro?.empenhoId ?? "",
      fonteId: registro?.fonteId ?? "",
      valor: registro?.valor ?? "",
      numeroOrdemBancaria: registro?.numeroOrdemBancaria ?? registro?.numero ?? "",
      dataOrdemBancaria:
        registro?.dataOrdemBancaria?.slice(0, 10) ??
        registro?.dataPagamento?.slice(0, 10) ??
        "",
      observacoes: registro?.observacoes ?? registro?.observacao ?? "",
    },
  });

  async function onSubmit(
    values: CriarPagamentoInput | AtualizarPagamentoInput,
  ) {
    const selectedLiquidacao = liquidacoes.find(
      (item) => item.id === values.liquidacaoId,
    );
    const payload = {
      ...values,
      empenhoId: values.empenhoId || selectedLiquidacao?.empenhoId || "",
    };
    const res = registro
      ? await atualizarPagamentoAction(
          obraId,
          registro.id,
          payload as AtualizarPagamentoInput,
        )
      : await criarPagamentoAction(obraId, payload as CriarPagamentoInput);
    if (!res.success) return toast.error(res.error);
    const alerta = alertaPagamento(res.data);
    toast.success(registro ? "Pagamento atualizado." : "Pagamento criado.");
    if (alerta) toast.warning(alerta);
    setOpen(false);
    form.reset();
    onSaved();
  }

  return (
    <LancamentoModal
      title={registro ? "Editar pagamento" : "Novo pagamento"}
      open={open}
      setOpen={setOpen}
      trigger={
        registro ? (
          <>
            <Edit2 className="size-4" /> Editar
          </>
        ) : (
          <>
            <Plus className="size-4" /> Novo pagamento
          </>
        )
      }
      onSubmit={form.handleSubmit(onSubmit)}
      submitting={form.formState.isSubmitting}
    >
      <SelectField
        label="Liquidação"
        {...form.register("liquidacaoId")}
        error={form.formState.errors.liquidacaoId?.message}
      >
        <option value="">Selecione</option>
        {liquidacoes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.numero || item.id} · {formatCurrency(item.valor)}
          </option>
        ))}
      </SelectField>
      <CommonFields
        form={form}
        dateName="dataOrdemBancaria"
        dateLabel="Data do pagamento"
        numberName="numeroOrdemBancaria"
        numberLabel="Ordem bancária"
      />
    </LancamentoModal>
  );
}

function LancamentoModal({
  title,
  open,
  setOpen,
  trigger,
  onSubmit,
  submitting,
  children,
}: {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: React.ReactNode;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  submitting: boolean;
  children: React.ReactNode;
}) {
  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button
          type="button"
          size={title.startsWith("Editar") ? "sm" : undefined}
          variant={title.startsWith("Editar") ? "secondary" : undefined}
        >
          {trigger}
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-xl">
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
            <Modal.Description>
              Informe fonte, valor e data do lançamento.
            </Modal.Description>
          </Modal.Header>
          <form onSubmit={onSubmit} className="grid gap-4">
            <Modal.Body>
              <div className="grid gap-4 sm:grid-cols-2">{children}</div>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Salvando..." : "Salvar"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}

function CommonFields({
  form,
  dateName,
  dateLabel,
  numberName = "numero",
  numberLabel = "Número",
}: {
  form: ReturnType<typeof useForm>;
  dateName: string;
  dateLabel: string;
  numberName?: string;
  numberLabel?: string;
}) {
  const errors = form.formState.errors as Record<string, { message?: string }>;
  return (
    <>
      <InputForm
        label="Fonte (ID)"
        required
        {...form.register("fonteId")}
        error={errors.fonteId?.message}
      />
      <InputForm
        label="Valor"
        required
        inputMode="decimal"
        placeholder="0,00"
        {...form.register("valor")}
        error={errors.valor?.message}
      />
      <InputForm
        label={numberLabel}
        required
        {...form.register(numberName)}
        error={errors[numberName]?.message}
      />
      <InputForm
        label={dateLabel}
        type="date"
        required
        {...form.register(dateName)}
        error={errors[dateName]?.message}
      />
      <div className="sm:col-span-2">
        <InputForm
          label="Observação"
          {...form.register("observacoes")}
          error={errors.observacoes?.message}
        />
      </div>
    </>
  );
}

function SelectField({
  label,
  error,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      <select
        {...props}
        className="h-11 rounded-app border border-input bg-surface px-3 text-sm"
      >
        {children}
      </select>
      {error ? (
        <span className="text-xs font-medium text-danger">{error}</span>
      ) : null}
    </label>
  );
}
