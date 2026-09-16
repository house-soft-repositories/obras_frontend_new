"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { Check, ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import { Modal } from "@/core/ui/molecules/modal";
import { useToast } from "@/core/hooks/useToast";
import createObraPrivadaAction from "@/core/actions/obras-privadas/create_obra_privada_action";
import {
  ANDAMENTO_VALUES,
  ANDAMENTO_LABELS,
  HABITE_SE_VALUES,
  HABITE_SE_LABELS,
} from "@/core/schemas/obras-privadas/obra_privada_schema";
import {
  criarObraPrivadaFormularioSchema,
  type CriarObraPrivadaFormularioInput,
  type CriarObraPrivadaOutput,
} from "@/core/schemas/obras-privadas/create_obra_privada_schema";

type Option = { id: string; nome: string };
type Props = {
  proprietarios: Option[];
  orgaos: Option[];
  localidades: Option[];
  onSuccess: () => void;
};

const steps = [
  "Proprietário",
  "Imóvel",
  "Localização",
  "Obra",
  "Revisão",
];

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

const initialValues: CriarObraPrivadaFormularioInput = {
  descricao: "",
  observacoes: "",
  proprietarioPessoaId: "",
  orgaoId: "",
  localidadeId: "",
  inscricaoImobiliaria: "",
  matriculaRgi: "",
  cartorio: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  uf: "",
  latitude: "",
  longitude: "",
  geoOrigem: "",
  andamento: "",
  habiteSe: "",
  dataInicio: "",
  dataPrevistaConclusao: "",
};

const selectClassName =
  "h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-red-700">{message}</span>;
}

export function CriarObraPrivadaModal({
  proprietarios,
  orgaos,
  localidades,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const form = useForm<
    CriarObraPrivadaFormularioInput,
    unknown,
    CriarObraPrivadaOutput
  >({
    resolver: zodResolver(criarObraPrivadaFormularioSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });
  const watched = form.watch();

  const close = () => {
    if (!submitting) {
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

  const fieldsByStep: (keyof CriarObraPrivadaFormularioInput)[][] = [
    ["proprietarioPessoaId"],
    ["inscricaoImobiliaria", "matriculaRgi", "cartorio"],
    [
      "cep",
      "logradouro",
      "numero",
      "complemento",
      "bairro",
      "uf",
      "localidadeId",
      "latitude",
      "longitude",
    ],
    [
      "descricao",
      "observacoes",
      "andamento",
      "habiteSe",
      "dataInicio",
      "dataPrevistaConclusao",
      "orgaoId",
    ],
    [],
  ];

  async function next() {
    const valid = await form.trigger(fieldsByStep[step]);
    if (valid) setStep((value) => value + 1);
  }

  function submitInvalid(errors: FieldErrors<CriarObraPrivadaFormularioInput>) {
    const firstInvalidStep = fieldsByStep.findIndex((fields) =>
      fields.some((field) => Boolean(errors[field])),
    );
    if (firstInvalidStep >= 0) setStep(firstInvalidStep);
    setApiError("Confira os campos destacados antes de criar a obra privada.");
  }

  function submit(data: CriarObraPrivadaOutput) {
    setApiError("");
    setSubmitting(true);
    void createObraPrivadaAction(data)
      .then((result) => {
        if (!result.success) throw new Error(result.error);
        toast.success("Obra privada criada com sucesso.");
        setOpen(false);
        setStep(0);
        setApiError("");
        form.reset(initialValues);
        onSuccess();
      })
      .catch((error) => {
        setApiError(
          error instanceof Error
            ? error.message
            : "Não foi possível criar a obra privada. Os dados foram preservados.",
        );
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button type="button">
          <Plus className="size-4" /> Nova obra privada
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-h-[95vh] max-w-4xl overflow-y-auto p-5 sm:p-7">
          <form
            onSubmit={form.handleSubmit(submit, submitInvalid)}
            noValidate
          >
            <div className="flex items-start justify-between gap-4">
              <Modal.Header>
                <Modal.Title className="text-2xl">{steps[step]}</Modal.Title>
                <Modal.Description>
                  Cadastre uma nova obra privada. Etapa {step + 1} de{" "}
                  {steps.length}.
                </Modal.Description>
              </Modal.Header>
              <Modal.CloseIcon onClick={close} />
            </div>
            <ol className="mt-4 flex flex-wrap gap-2">
              {steps.map((label, index) => (
                <li
                  key={label}
                  className={
                    index === step
                      ? "rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white"
                      : index < step
                        ? "rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary"
                        : "rounded-full bg-surface-subtle px-3 py-1 text-xs text-muted"
                  }
                >
                  {index + 1}. {label}
                </li>
              ))}
            </ol>
            {apiError ? (
              <p
                role="alert"
                className="mt-4 rounded-app border border-red-300 bg-red-50 p-3 text-sm text-red-800"
              >
                {apiError}
              </p>
            ) : null}
            {step === 0 ? (
              <div className="mt-5 grid gap-4">
                <label className="grid gap-1 text-sm font-medium">
                  Proprietário
                  <select
                    className={selectClassName}
                    {...form.register("proprietarioPessoaId")}
                  >
                    <option value="">Selecione</option>
                    {proprietarios.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome}
                      </option>
                    ))}
                  </select>
                  <FieldError
                    message={
                      form.formState.errors.proprietarioPessoaId?.message
                    }
                  />
                </label>
                <p className="text-sm text-muted">
                  O proprietário precisa estar cadastrado como pessoa. Cadastre
                  a pessoa primeiro caso ela ainda não apareça na lista.
                </p>
              </div>
            ) : null}
            {step === 1 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  Inscrição imobiliária
                  <Input {...form.register("inscricaoImobiliaria")} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Matrícula RGI
                  <Input {...form.register("matriculaRgi")} />
                </label>
                <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                  Cartório
                  <Input {...form.register("cartorio")} />
                </label>
              </div>
            ) : null}
            {step === 2 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium">
                  CEP
                  <Input
                    inputMode="numeric"
                    placeholder="00000-000"
                    {...form.register("cep")}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Localidade
                  <select
                    className={selectClassName}
                    {...form.register("localidadeId")}
                  >
                    <option value="">Selecione</option>
                    {localidades.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                  Logradouro
                  <Input {...form.register("logradouro")} />
                  <FieldError
                    message={form.formState.errors.logradouro?.message}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Número
                  <Input {...form.register("numero")} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Complemento
                  <Input {...form.register("complemento")} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Bairro
                  <Input {...form.register("bairro")} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  UF
                  <select className={selectClassName} {...form.register("uf")}>
                    <option value="">Selecione</option>
                    {UFS.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                  <FieldError message={form.formState.errors.uf?.message} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Latitude
                  <Input
                    inputMode="decimal"
                    placeholder="-3,7319"
                    {...form.register("latitude")}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Longitude
                  <Input
                    inputMode="decimal"
                    placeholder="-38,5267"
                    {...form.register("longitude")}
                  />
                </label>
              </div>
            ) : null}
            {step === 3 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                  Descrição da obra
                  <Input {...form.register("descricao")} />
                  <FieldError
                    message={form.formState.errors.descricao?.message}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                  Observações
                  <Input {...form.register("observacoes")} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Andamento
                  <select
                    className={selectClassName}
                    {...form.register("andamento")}
                  >
                    <option value="">Selecione</option>
                    {ANDAMENTO_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {ANDAMENTO_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Habite-se
                  <select
                    className={selectClassName}
                    {...form.register("habiteSe")}
                  >
                    <option value="">Selecione</option>
                    {HABITE_SE_VALUES.map((value) => (
                      <option key={value} value={value}>
                        {HABITE_SE_LABELS[value]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Data de início
                  <Input type="date" {...form.register("dataInicio")} />
                </label>
                <label className="grid gap-1 text-sm font-medium">
                  Previsão de conclusão
                  <Input
                    type="date"
                    {...form.register("dataPrevistaConclusao")}
                  />
                </label>
                <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                  Órgão responsável
                  <select
                    className={selectClassName}
                    {...form.register("orgaoId")}
                  >
                    <option value="">Selecione</option>
                    {orgaos.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nome}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}
            {step === 4 ? (
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <Review
                  label="Proprietário"
                  value={
                    proprietarios.find(
                      (item) => item.id === watched.proprietarioPessoaId,
                    )?.nome ?? "—"
                  }
                />
                <Review label="Descrição" value={watched.descricao || "—"} />
                <Review
                  label="Endereço"
                  value={
                    [watched.logradouro, watched.numero, watched.bairro]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                />
                <Review
                  label="UF"
                  value={watched.uf || "—"}
                />
                <Review
                  label="Inscrição imobiliária"
                  value={watched.inscricaoImobiliaria || "—"}
                />
                <Review
                  label="Matrícula RGI"
                  value={watched.matriculaRgi || "—"}
                />
                <Review
                  label="Andamento"
                  value={
                    watched.andamento
                      ? (ANDAMENTO_LABELS[watched.andamento] ?? watched.andamento)
                      : "—"
                  }
                />
                <Review
                  label="Habite-se"
                  value={
                    watched.habiteSe
                      ? (HABITE_SE_LABELS[watched.habiteSe] ?? watched.habiteSe)
                      : "—"
                  }
                />
                <Review
                  label="Data de início"
                  value={watched.dataInicio || "—"}
                />
                <Review
                  label="Previsão de conclusão"
                  value={watched.dataPrevistaConclusao || "—"}
                />
              </dl>
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
                      <Check className="size-4" /> Criar obra privada
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
