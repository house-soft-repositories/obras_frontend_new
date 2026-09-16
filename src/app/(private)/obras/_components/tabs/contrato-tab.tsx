"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  listParalisacoesAction,
  reiniciarParalisacaoAction,
} from "@/core/actions/contratos/paralisacao_actions";
import { useToast } from "@/core/hooks/useToast";
import {
  criarAditivoSchema,
  criarContratoSchema,
  criarParalisacaoSchema,
  tipoAditivoSchema,
  type Aditivo,
  type Contrato,
  type CriarAditivoInput,
  type CriarContratoInput,
  type CriarParalisacaoInput,
  type Paralisacao,
  type PrazoFinal,
} from "@/core/schemas/contratos/contrato_schema";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { Body, Caption, Heading } from "@/core/ui/atoms/typography";
import { InputForm } from "@/core/ui/molecules/input-form";
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
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

function formatMoneyBRL(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num) || num === 0) return "—";
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function valoresResumo(valores: unknown): Array<[string, string]> {
  if (typeof valores !== "object" || valores === null) return [];
  return Object.entries(valores as Record<string, unknown>)
    .slice(0, 6)
    .map(([k, v]) => [k, typeof v === "string" || typeof v === "number" ? String(v) : "—"]);
}

const contratoSteps = ["Identificação", "Prazo", "Revisão"];

function ContratoModal({ obraId, onSaved }: { obraId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
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
      fontes: [{ fonteId: "", valor: "" }],
    },
  });

  async function onSubmit(values: CriarContratoInput) {
    const res = await criarContratoAction({ ...values, obraId });
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

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" className="size-4" /> Novo contrato
        </Button>
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              {step === 0 && (
                <div className="grid gap-4">
                  <InputForm label="Número" required {...form.register("numero")} error={form.formState.errors.numero?.message} />
                  <InputForm label="Empresa contratada (ID)" required {...form.register("empresaContratadaId")} error={form.formState.errors.empresaContratadaId?.message} />
                  <InputForm label="Objeto" {...form.register("objeto")} />
                </div>
              )}
              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputForm label="Data da OS" type="date" required {...form.register("dataOs")} error={form.formState.errors.dataOs?.message} />
                  <InputForm label="Assinatura" type="date" {...form.register("dataAssinatura")} />
                  <InputForm label="Fim da vigência" type="date" {...form.register("fimVigencia")} />
                  <InputForm label="Prazo em dias" type="number" {...form.register("prazoExecucaoDias", { valueAsNumber: true })} />
                </div>
              )}
              {step === 2 && (
                <Body>
                  Confira antes de salvar: contrato {form.watch("numero") || "—"} · OS{" "}
                  {form.watch("dataOs") || "—"}.
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
              {step < contratoSteps.length - 1 ? (
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

function AditivoModal({ obraId, contratoId, onSaved }: { obraId: string; contratoId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  const form = useForm<CriarAditivoInput>({
    resolver: zodResolver(criarAditivoSchema),
    defaultValues: { numero: "", tipo: "PRAZO", dataAssinatura: "", observacoes: "" },
  });

  async function onSubmit(values: CriarAditivoInput) {
    const res = await criarAditivoAction(obraId, contratoId, values);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Aditivo criado.");
    setOpen(false);
    form.reset();
    onSaved();
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button variant="secondary" size="sm">
          <Plus aria-hidden="true" className="size-4" /> Aditivo
        </Button>
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
                <select {...form.register("tipo")} className="h-11 rounded-app border border-input bg-surface px-3 text-sm">
                  {tipoAditivoSchema.options.map((t) => (
                    <option key={t} value={t}>
                      {TIPO_ADITIVO_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <InputForm label="Assinatura" type="date" {...form.register("dataAssinatura")} />
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
  const toast = useToast();
  const form = useForm<CriarParalisacaoInput>({
    resolver: zodResolver(criarParalisacaoSchema),
    defaultValues: { dataParalisacao: "", motivo: "", termoParalisacaoArquivoId: "" },
  });

  async function onSubmit(values: CriarParalisacaoInput) {
    const res = await criarParalisacaoAction(obraId, contratoId, values);
    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("Paralisação registrada.");
    setOpen(false);
    form.reset();
    onSaved();
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button variant="secondary" size="sm">
          <Plus aria-hidden="true" className="size-4" /> Paralisação
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Nova paralisação</Modal.Title>
            <Modal.Description>Registre a paralisação da execução.</Modal.Description>
          </Modal.Header>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <InputForm label="Data" type="date" required {...form.register("dataParalisacao")} error={form.formState.errors.dataParalisacao?.message} />
              <InputForm label="Motivo" required {...form.register("motivo")} error={form.formState.errors.motivo?.message} />
              <InputForm label="Termo (arquivo ID)" required {...form.register("termoParalisacaoArquivoId")} error={form.formState.errors.termoParalisacaoArquivoId?.message} />
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
      <div role="tabpanel" className="grid gap-4 p-5 text-center">
        <Body className="font-semibold">Nenhum contrato vinculado</Body>
        <Caption>Cadastre o contrato desta obra para gerir aditivos e paralisações.</Caption>
        <div className="flex justify-center">
          <ContratoModal obraId={obraId} onSaved={recarregar} />
        </div>
      </div>
    );
  }

  return (
    <div role="tabpanel" className="grid gap-4 p-5">
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
            id: "acoes",
            header: "Ações",
            cell: (row) => (
              <Button variant="ghost" size="sm" aria-label={`Excluir aditivo ${row.numero}`} onClick={() => excluirAditivo(row.id)}>
                <Trash2 aria-hidden="true" className="size-4" />
              </Button>
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
            cell: (row) =>
              !row.dataReinicio ? (
                <Button variant="secondary" size="sm" onClick={() => reiniciar(row.id)}>
                  Registrar reinício
                </Button>
              ) : (
                "—"
              ),
          },
        ]}
      />
    </div>
  );
}
