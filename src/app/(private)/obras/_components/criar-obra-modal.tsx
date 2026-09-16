"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
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
import { Button } from "@/core/ui/atoms/button";
import { InputDate } from "@/core/ui/atoms/input-date";
import { Input } from "@/core/ui/atoms/input";
import createObraAction from "@/core/actions/obras/create_obra_action";
import { aplicarTagsAction } from "@/core/actions/obras/tags_actions";
import listSubclassificacoesPaginationAction from "@/core/actions/cadastros/list_subclassificacoes_pagination_action";
import listSubtipologiasPaginationAction from "@/core/actions/cadastros/list_subtipologias_pagination_action";
import { useToast } from "@/core/hooks/useToast";
import {
  formatMoneyFromCents,
  InputMoney,
} from "@/core/ui/atoms/input-money";
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
  "Detalhes",
  "Orçamentos",
  "Revisão",
];
const TIPO_FINANCIAMENTO_LABELS = {
  COM_OGU: "Com OGU",
  SEM_OGU: "Sem OGU",
  INVESTIMENTO_PRIVADO: "Investimento privado",
} as const;
const MODO_DURACAO_LABELS = {
  DEFINIDO_PELO_USUARIO: "Definido pelo usuário",
  ESTAGIO_ATUAL: "Estágio atual",
  TOTAL_ATIVIDADES: "Total de atividades",
  EXECUCAO_CONTRATO: "Execução do contrato",
} as const;
const ACAO_CONVENIADA_LABELS = {
  NAO: "Não",
  FEDERAL: "Federal",
  ESTADUAL: "Estadual",
} as const;
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
  tipoFinanciamento: "SEM_OGU",
  modoDuracao: "DEFINIDO_PELO_USUARIO",
  dataInicio: "",
  dataPrazo: "",
  acaoConveniada: "NAO",
  prioritaria: false,
  unidadeMedida: "",
  quantidade: "",
  programaPpa: "",
  secretario: "",
  dataPactuada: "",
  orcamentos: [{ fonteId: "", valorCentavos: 0 }],
};




export function CriarObraModal({ onSuccess, ...options }: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState("");
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
  const tipo = useWatch({ control: form.control, name: "tipo" });
  function carregarSubclassificacoes(classificacaoSelecionadaId: string) {
    form.setValue("subclassificacaoId", "", { shouldValidate: true });
    if (!classificacaoSelecionadaId) {
      setSubclassificacoes([]);
      return;
    }
    setLoading(true);
    void listSubclassificacoesPaginationAction({
      classificacaoId: classificacaoSelecionadaId,
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
  }
  function carregarSubtipologias(tipologiaSelecionadaId: string) {
    form.setValue("subtipologiaId", "", { shouldValidate: true });
    if (!tipologiaSelecionadaId) {
      setSubtipologias([]);
      return;
    }
    setLoading(true);
    void listSubtipologiasPaginationAction({
      tipologiaId: tipologiaSelecionadaId,
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
  }
  useEffect(() => {
    if (tipo !== "OBRA") {
      form.setValue("subclassificacaoId", "", { shouldValidate: true });
    }
  }, [form, tipo]);
  const close = () => {
    if (!submitting) {
      setOpen(false);
      setStep(0);
      setApiError("");
      setTags("");
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
    [
      "tipoFinanciamento",
      "modoDuracao",
      "dataInicio",
      "dataPrazo",
      "acaoConveniada",
      "prioritaria",
      "unidadeMedida",
      "quantidade",
      "programaPpa",
      "secretario",
      "dataPactuada",
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
    setSubmitting(true);
    void createObraAction(data)
      .then((result) => {
        if (!result.success) {
          throw new Error(result.error);
        }
        if (tags.trim() && result.data?.id) {
          return aplicarTagsAction(result.data.id, tags).then(() => result);
        }
        return result;
      })
      .then(() => {
        toast.success("Obra criada com sucesso.");
        setOpen(false);
        setStep(0);
        setApiError("");
        setTags("");
        form.reset(initialValues);
        onSuccess();
      })
      .catch((error) => {
        setApiError(
          error instanceof Error
            ? error.message
            : "Não foi possível criar a obra. Os dados foram preservados.",
        );
      })
      .finally(() => {
        setSubmitting(false);
      });
  }
  const select = (
    name: keyof CriarObraFormularioInput,
    label: string,
    values: Option[],
    onValueChange?: (value: string) => void,
  ) => (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <select
        className="h-11 rounded-app border border-input bg-surface px-3"
        {...form.register(name as never, {
          onChange: (event) => onValueChange?.(event.target.value),
        })}
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
  const enumSelect = <T extends string>(
    name: keyof CriarObraFormularioInput,
    label: string,
    labels: Record<T, string>,
  ) => (
    <label className="grid gap-1 text-sm font-medium">
      {label}
      <select
        className="h-11 rounded-app border border-input bg-surface px-3"
        {...form.register(name as never)}
      >
        {Object.entries(labels).map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel as string}
          </option>
        ))}
      </select>
    </label>
  );
  const orcamentoErrors = form.formState.errors.orcamentos;
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
            <div className="mb-7 grid grid-cols-6 gap-1">
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
                  carregarSubclassificacoes,
                )}
                {tipo === "OBRA" && classificacaoId
                  ? select(
                      "subclassificacaoId",
                      "Subclassificação",
                      subclassificacoes,
                    )
                  : null}
                {select(
                  "tipologiaId",
                  "Tipologia",
                  options.tipologias,
                  carregarSubtipologias,
                )}
                {select("subtipologiaId", "Subtipologia", subtipologias)}
              </div>
            ) : null}
            {step === 3 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {enumSelect(
                  "tipoFinanciamento",
                  "Financiamento",
                  TIPO_FINANCIAMENTO_LABELS,
                )}
                {enumSelect("modoDuracao", "Modo de duração", MODO_DURACAO_LABELS)}
                <label className="grid gap-1 text-sm font-medium">
                  Data início
                  <InputDate {...form.register("dataInicio")} />
                  {form.formState.errors.dataInicio?.message ? (
                    <span className="text-xs text-red-700">
                      {form.formState.errors.dataInicio.message}
                    </span>
                  ) : null}
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Data prazo
                  <InputDate {...form.register("dataPrazo")} />
                  {form.formState.errors.dataPrazo?.message ? (
                    <span className="text-xs text-red-700">
                      {form.formState.errors.dataPrazo.message}
                    </span>
                  ) : null}
                </label>
                {enumSelect("acaoConveniada", "Ação conveniada", ACAO_CONVENIADA_LABELS)}
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" {...form.register("prioritaria")} />
                  Prioritária
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Unidade de medida
                  <Input {...form.register("unidadeMedida")} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Quantidade
                  <Input inputMode="decimal" {...form.register("quantidade")} />
                  {form.formState.errors.quantidade?.message ? (
                    <span className="text-xs text-red-700">
                      {form.formState.errors.quantidade.message}
                    </span>
                  ) : null}
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Programa PPA
                  <Input {...form.register("programaPpa")} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Secretário(a)
                  <Input {...form.register("secretario")} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Data pactuada
                  <InputDate {...form.register("dataPactuada")} />
                  {form.formState.errors.dataPactuada?.message ? (
                    <span className="text-xs text-red-700">
                      {form.formState.errors.dataPactuada.message}
                    </span>
                  ) : null}
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Tags (vírgula/ponto-e-vírgula)
                  <Input value={tags} onChange={(event) => setTags(event.target.value)} />
                </label>
              </div>
            ) : null}
            {step === 4 ? (
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Fontes de orçamento</h3>
                  <span className="font-semibold text-primary">
                    Total: {formatMoneyFromCents(totalCents)}
                  </span>
                </div>
                {fields.map((field, index) => {
                  const valorFieldName =
                    `orcamentos.${index}.valorCentavos` as const;

                  return (
                  <div
                    className="grid gap-2 sm:grid-cols-[1fr_180px_auto]"
                    key={field.id}
                  >
                    <label className="grid gap-1 text-sm font-medium">
                      Fonte
                      <select
                        className="h-11 rounded-app border border-input bg-surface px-3"
                        {...form.register(`orcamentos.${index}.fonteId`)}
                      >
                        <option value="">Selecione</option>
                        {options.fontes.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nome}
                          </option>
                        ))}
                      </select>
                      {orcamentoErrors?.[index]?.fonteId?.message ? (
                        <span className="text-xs text-red-700">
                          {orcamentoErrors[index]?.fonteId?.message}
                        </span>
                      ) : null}
                    </label>
                    <label className="grid gap-1 text-sm font-medium">
                      Valor
                      <InputMoney
                        valueInCents={
                          watched.orcamentos?.[index]?.valorCentavos || ""
                        }
                        onBlur={() => void form.trigger(valorFieldName)}
                        onValueChange={({ valorInCents }) => {
                          form.setValue(
                            valorFieldName,
                            valorInCents,
                            { shouldDirty: true, shouldValidate: true },
                          );
                        }}
                      />
                      {orcamentoErrors?.[index]?.valorCentavos?.message ? (
                        <span className="text-xs text-red-700">
                          {orcamentoErrors[index]?.valorCentavos?.message}
                        </span>
                      ) : null}
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
                  );
                })}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => append({ fonteId: "", valorCentavos: 0 })}
                >
                  <Plus className="size-4" /> Adicionar fonte
                </Button>
              </div>
            ) : null}
            {step === 5 ? (
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
                  value={`${fields.length} fonte(s) · ${formatMoneyFromCents(totalCents)}`}
                />
                <Review
                  label="Financiamento"
                  value={TIPO_FINANCIAMENTO_LABELS[watched.tipoFinanciamento ?? "SEM_OGU"]}
                />
                <Review
                  label="Modo de duração"
                  value={MODO_DURACAO_LABELS[watched.modoDuracao ?? "DEFINIDO_PELO_USUARIO"]}
                />
                <Review label="Data início" value={watched.dataInicio || "—"} />
                <Review label="Data prazo" value={watched.dataPrazo || "—"} />
                <Review
                  label="Ação conveniada"
                  value={ACAO_CONVENIADA_LABELS[watched.acaoConveniada ?? "NAO"]}
                />
                <Review label="Prioritária" value={watched.prioritaria ? "Sim" : "Não"} />
                <Review label="Unidade de medida" value={watched.unidadeMedida || "—"} />
                <Review label="Quantidade" value={watched.quantidade || "—"} />
                <Review label="Programa PPA" value={watched.programaPpa || "—"} />
                <Review label="Secretário(a)" value={watched.secretario || "—"} />
                <Review label="Data pactuada" value={watched.dataPactuada || "—"} />
                <Review label="Tags" value={tags || "—"} />
              </div>
            ) : null}
            <div className="mt-7 flex justify-between gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={step === 0 || submitting}
                onClick={() => setStep((value) => value - 1)}
              >
                <ChevronLeft className="size-4" /> Voltar
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" disabled={submitting} onClick={next}>
                  Continuar <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
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
