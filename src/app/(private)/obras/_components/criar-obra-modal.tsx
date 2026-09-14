"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
} from "react-hook-form";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import createObraAction from "@/core/actions/obras/create_obra_action";
import listSubclassificacoesPaginationAction from "@/core/actions/cadastros/list_subclassificacoes_pagination_action";
import listSubtipologiasPaginationAction from "@/core/actions/cadastros/list_subtipologias_pagination_action";
import { useToast } from "@/core/hooks/useToast";
import { Modal } from "@/core/ui/molecules/modal";
import {
  criarObraFormularioSchema,
  type CriarObraFormularioInput,
  type CriarObraOutput,
} from "@/core/schemas/obras/create_obra_schema";
import {
  TIPO_OBRA_LABELS,
  TIPO_OBRA_VALUES,
} from "@/core/schemas/obras/tipo_obra";

type Option = { id: string; nome: string };
type Props = {
  orgaos: Option[];
  usuarios: Option[];
  setores: Option[];
  localidades: Option[];
  fontes: Option[];
  eixos: Option[];
  classificacoes: Option[];
  tipologias: Option[];
  onSuccess: () => void;
};
const steps = [
  "Identificação",
  "Organização",
  "Classificação",
  "Orçamentos",
  "Revisão",
];
const initialValues: CriarObraFormularioInput = {
  nome: "",
  tipo: "OBRA",
  descricao: "",
  responsavelUsuarioId: "",
  orgaoId: "",
  setorId: "",
  localidadeId: "",
  eixoId: "",
  classificacaoId: "",
  subclassificacaoId: "",
  tipologiaId: "",
  subtipologiaId: "",
  seguirAutomatico: false,
  orcamentos: [{ fonteId: "", valorCentavos: "" }],
};
const brl = (cents: string) =>
  (Number(cents || 0) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export function CriarObraModal({ onSuccess, ...options }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [apiError, setApiError] = useState("");
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [subclassificacoes, setSubclassificacoes] = useState<Option[]>([]);
  const [subtipologias, setSubtipologias] = useState<Option[]>([]);
  const toast = useToast();
  const form = useForm<CriarObraFormularioInput, unknown, CriarObraOutput>({
    resolver: zodResolver(criarObraFormularioSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orcamentos",
  });
  const watched = useWatch({ control: form.control });
  const totalCents = useMemo(
    () =>
      (watched.orcamentos ?? []).reduce(
        (sum, item) => sum + Number(item?.valorCentavos || 0),
        0,
      ),
    [watched.orcamentos],
  );
  const classificacaoId = useWatch({
    control: form.control,
    name: "classificacaoId",
  });
  const tipologiaId = useWatch({ control: form.control, name: "tipologiaId" });
  const tipo = useWatch({ control: form.control, name: "tipo" });
  useEffect(() => {
    if (!classificacaoId) {
      setSubclassificacoes([]);
      return;
    }
    setLoading(true);
    void listSubclassificacoesPaginationAction({
      classificacaoId,
      page: 1,
      take: 50,
      order: "ASC",
      apenasAtivos: true,
    })
      .then((result) =>
        setSubclassificacoes(
          result.data.map((item) => ({ id: item.id, nome: item.nome })),
        ),
      )
      .finally(() => setLoading(false));
  }, [classificacaoId]);
  useEffect(() => {
    if (!tipologiaId) {
      setSubtipologias([]);
      return;
    }
    setLoading(true);
    void listSubtipologiasPaginationAction({
      tipologiaId,
      page: 1,
      take: 50,
      order: "ASC",
      apenasAtivos: true,
    })
      .then((result) =>
        setSubtipologias(
          result.data.map((item) => ({ id: item.id, nome: item.nome })),
        ),
      )
      .finally(() => setLoading(false));
  }, [tipologiaId]);
  useEffect(() => {
    if (tipo !== "OBRA") {
      form.setValue("subclassificacaoId", "", { shouldValidate: true });
    }
  }, [form, tipo]);
  const close = () => {
    if (!pending) {
      setOpen(false);
      setStep(0);
      setApiError("");
      form.reset(initialValues);
    }
  };
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      return;
    }

    close();
  };
  const fieldsByStep: (keyof CriarObraFormularioInput)[][] = [
    ["nome", "tipo", "descricao"],
    [
      "responsavelUsuarioId",
      "orgaoId",
      "setorId",
      "localidadeId",
      "seguirAutomatico",
    ],
    [
      "eixoId",
      "classificacaoId",
      "subclassificacaoId",
      "tipologiaId",
      "subtipologiaId",
    ],
    ["orcamentos"],
    [],
  ];
  async function next() {
    const valid = await form.trigger(fieldsByStep[step]);
    if (valid) setStep((value) => value + 1);
  }
  function submitInvalid(errors: FieldErrors<CriarObraFormularioInput>) {
    const firstInvalidStep = fieldsByStep.findIndex((fields) =>
      fields.some((field) => Boolean(errors[field])),
    );

    if (firstInvalidStep >= 0) setStep(firstInvalidStep);
    setApiError("Confira os campos destacados antes de criar a obra.");
  }
  function submit(data: CriarObraOutput) {
    setApiError("");
    startTransition(async () => {
      try {
        const result = await createObraAction(data);
        if (!result.success) {
          throw new Error(result.error);
        }
        toast.success("Obra criada com sucesso.");
        close();
        onSuccess();
      } catch (error) {
        const code = error instanceof Error ? error.message : "";
        const map: Record<string, [number, string]> = {
          OBRA_INVALID_NOME: [0, "Confira o nome."],
          OBRA_INVALID_TIPO: [0, "Confira o tipo."],
          OBRA_INVALID_RESPONSAVEL: [1, "Confira o responsável."],
          OBRA_INVALID_ORGAO: [1, "Confira o órgão."],
          OBRA_INVALID_SUBCLASSIFICACAO: [2, "Confira a subclassificação."],
          OBRA_INVALID_ORCAMENTO: [3, "Confira os orçamentos."],
          OBRA_FONTE_INATIVA: [3, "Escolha uma fonte ativa."],
        };
        const mapped = map[code];
        if (mapped) setStep(mapped[0]);
        setApiError(
          mapped?.[1] ??
            "Não foi possível criar a obra. Os dados foram preservados.",
        );
      }
    });
  }
  const select = (
    name: keyof CriarObraFormularioInput,
    label: string,
    values: Option[],
  ) => (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <select
        className="h-11 rounded-app border border-input bg-surface px-3"
        {...form.register(name as never)}
      >
        <option value="">Selecione</option>
        {values.map((item) => (
          <option key={item.id} value={item.id}>
            {item.nome}
          </option>
        ))}
      </select>
      {form.formState.errors[name]?.message ? (
        <span className="text-xs text-red-700">
          {String(form.formState.errors[name]?.message)}
        </span>
      ) : null}
    </label>
  );
  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button>
          <Plus className="size-4" /> Nova obra
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-h-[95vh] max-w-4xl overflow-y-auto p-5 sm:p-7">
          <form onSubmit={form.handleSubmit(submit, submitInvalid)}>
            <div className="mb-6 flex items-center justify-between">
              <Modal.Header>
                <Modal.Title className="text-2xl">{steps[step]}</Modal.Title>
                <Modal.Description>Cadastre uma nova obra.</Modal.Description>
              </Modal.Header>
              <Modal.CloseIcon onClick={close} />
            </div>
            <div className="mb-7 grid grid-cols-5 gap-1">
              {steps.map((label, index) => (
                <div key={label}>
                  <div
                    className={`h-2 rounded-full ${index <= step ? "bg-primary" : "bg-border"}`}
                  />
                  <span className="hidden text-center text-[11px] text-muted sm:block">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            {apiError ? (
              <p
                className="mb-4 rounded-app border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {apiError}
              </p>
            ) : null}
            {step === 0 ? (
              <div className="grid gap-4">
                <label className="grid gap-1 text-sm font-medium">
                  Nome
                  <Input {...form.register("nome")} />
                  {form.formState.errors.nome?.message ? (
                    <span className="text-xs text-red-700">
                      {form.formState.errors.nome.message}
                    </span>
                  ) : null}
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Tipo
                  <select
                    className="h-11 rounded-app border border-input bg-surface px-3"
                    {...form.register("tipo")}
                  >
                    {TIPO_OBRA_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {TIPO_OBRA_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Descrição
                  <textarea
                    className="min-h-28 rounded-app border border-input bg-surface px-3 py-2"
                    {...form.register("descricao")}
                  />
                </label>
              </div>
            ) : null}
            {step === 1 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {select(
                  "responsavelUsuarioId",
                  "Responsável",
                  options.usuarios,
                )}
                {select("orgaoId", "Órgão", options.orgaos)}
                {select("setorId", "Setor", options.setores)}
                {select("localidadeId", "Localidade", options.localidades)}
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    {...form.register("seguirAutomatico")}
                  />{" "}
                  Seguir automaticamente
                </label>
              </div>
            ) : null}
            {step === 2 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {loading ? (
                  <p className="text-sm text-muted sm:col-span-2">
                    Carregando opções dependentes...
                  </p>
                ) : null}
                {select("eixoId", "Eixo", options.eixos)}
                {select(
                  "classificacaoId",
                  "Classificação",
                  options.classificacoes,
                )}
                {tipo === "OBRA" && classificacaoId
                  ? select(
                      "subclassificacaoId",
                      "Subclassificação",
                      subclassificacoes,
                    )
                  : null}
                {select("tipologiaId", "Tipologia", options.tipologias)}
                {select("subtipologiaId", "Subtipologia", subtipologias)}
              </div>
            ) : null}
            {step === 3 ? (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Fontes de orçamento</h3>
                  <span className="font-semibold text-primary">
                    Total: {brl(String(totalCents))}
                  </span>
                </div>
                {fields.map((field, index) => (
                  <div
                    className="grid gap-2 sm:grid-cols-[1fr_180px_auto]"
                    key={field.id}
                  >
                    {select(
                      `orcamentos.${index}.fonteId` as keyof CriarObraFormularioInput,
                      "Fonte",
                      options.fontes,
                    )}
                    <label className="grid gap-1 text-sm font-medium">
                      Valor
                      <Input
                        inputMode="decimal"
                        placeholder="R$ 0,00"
                        {...form.register(`orcamentos.${index}.valorCentavos`)}
                        onChange={(event) =>
                          form.setValue(
                            `orcamentos.${index}.valorCentavos`,
                            event.target.value.replace(/\D/g, ""),
                            { shouldValidate: true },
                          )
                        }
                        value={brl(
                          String(
                            watched.orcamentos?.[index]?.valorCentavos || "",
                          ),
                        )}
                      />
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={fields.length === 1}
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => append({ fonteId: "", valorCentavos: "" })}
                >
                  <Plus className="size-4" /> Adicionar fonte
                </Button>
              </div>
            ) : null}
            {step === 4 ? (
              <div className="grid gap-4 text-sm">
                <Review label="Nome" value={watched.nome ?? ""} />
                <Review
                  label="Tipo"
                  value={watched.tipo ? TIPO_OBRA_LABELS[watched.tipo] : "—"}
                />
                <Review label="Descrição" value={watched.descricao || "—"} />
                <Review
                  label="Responsável"
                  value={
                    options.usuarios.find(
                      (item) => item.id === watched.responsavelUsuarioId,
                    )?.nome ?? "—"
                  }
                />
                <Review
                  label="Órgão"
                  value={
                    options.orgaos.find((item) => item.id === watched.orgaoId)
                      ?.nome ?? "—"
                  }
                />
                <Review
                  label="Orçamentos"
                  value={`${fields.length} fonte(s) · ${brl(String(totalCents))}`}
                />
              </div>
            ) : null}
            <div className="mt-7 flex justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0 || pending}
                onClick={() => setStep((value) => value - 1)}
              >
                <ChevronLeft className="size-4" /> Voltar
              </Button>
              {step < 4 ? (
                <Button type="button" disabled={pending} onClick={next}>
                  Continuar <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="size-4" /> Criar obra
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
function Review({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-app border border-border p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
