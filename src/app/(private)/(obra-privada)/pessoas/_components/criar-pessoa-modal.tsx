"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useForm, useWatch } from "react-hook-form";
import { criarPessoaAction } from "@/core/actions/pessoa/create_pessoa_action";
import {
  createPessoaSchema,
  type CreatePessoaInput,
  type CreatePessoaOutput,
} from "@/core/schemas/pessoa/create_pessoa_schema";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { cn } from "@/core/ui/cn";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";

const steps = ["Dados", "Contato", "Endereço"] as const;

type StepIndex = 0 | 1 | 2;

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

function SelectForm({
  label,
  error,
  children,
  ...props
}: ComponentProps<"select"> & { label: string; error?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <select
        className="h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="text-xs font-normal text-(--cor-perigo)" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function CriarPessoaModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<StepIndex>(0);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const form = useForm<CreatePessoaInput, unknown, CreatePessoaOutput>({
    resolver: zodResolver(createPessoaSchema),
    defaultValues: {
      tipo: "FISICA",
      nome: "",
      nomeFantasia: "",
      documento: "",
      rg: "",
      orgaoExpedidor: "",
      email: "",
      telefone: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
    },
  });

  const tipo = useWatch({ control: form.control, name: "tipo" });
  const isJuridica = tipo === "JURIDICA";

  function resetForm() {
    form.reset({
      tipo: "FISICA",
      nome: "",
      nomeFantasia: "",
      documento: "",
      rg: "",
      orgaoExpedidor: "",
      email: "",
      telefone: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
    });
    setStep(0);
  }

  async function nextStep(event?: React.SyntheticEvent) {
    event?.preventDefault();
    const fields =
      step === 0
        ? (["tipo", "nome", "documento", "nomeFantasia", "rg", "orgaoExpedidor"] as const)
        : (["email", "telefone"] as const);
    const valid = await form.trigger(fields);
    if (valid) setStep((previous) => (previous + 1) as StepIndex);
  }

  function previousStep() {
    setStep((previous) => (previous - 1) as StepIndex);
  }

  function onSubmit(values: CreatePessoaOutput) {
    const parsed = createPessoaSchema.parse(values);
    startTransition(async () => {
      const result = await criarPessoaAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Pessoa criada com sucesso.");
      resetForm();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Modal.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Nova pessoa
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar pessoa</Modal.Title>
            <Modal.Description>
              Informe os dados da pessoa física ou jurídica.
            </Modal.Description>
          </Modal.Header>
          <ol className="flex items-center gap-2 px-5" aria-label="Etapas">
            {steps.map((label, index) => (
              <li key={label} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-bold",
                    index === step
                      ? "bg-foreground text-surface"
                      : index < step
                        ? "bg-surface-subtle text-foreground"
                        : "bg-surface-subtle text-muted",
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    index === step ? "text-foreground" : "text-muted",
                  )}
                >
                  {label}
                </span>
              </li>
            ))}
          </ol>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              {step === 0 ? (
                <div className="grid gap-4">
                  <SelectForm
                    label="Tipo"
                    {...form.register("tipo")}
                    error={form.formState.errors.tipo?.message}
                  >
                    <option value="FISICA">Pessoa física</option>
                    <option value="JURIDICA">Pessoa jurídica</option>
                  </SelectForm>
                  <InputForm
                    label={isJuridica ? "Razão social" : "Nome completo"}
                    required
                    {...form.register("nome")}
                    error={form.formState.errors.nome?.message}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputForm
                      label={isJuridica ? "CNPJ" : "CPF"}
                      required
                      inputMode="numeric"
                      placeholder={isJuridica ? "00.000.000/0000-00" : "000.000.000-00"}
                      {...form.register("documento")}
                      error={form.formState.errors.documento?.message}
                    />
                    <InputForm
                      label={isJuridica ? "Nome fantasia" : "Nome social"}
                      {...form.register("nomeFantasia")}
                      error={form.formState.errors.nomeFantasia?.message}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputForm
                      label="RG"
                      {...form.register("rg")}
                      error={form.formState.errors.rg?.message}
                    />
                    <InputForm
                      label="Órgão expedidor"
                      placeholder="Ex: SSP/CE"
                      {...form.register("orgaoExpedidor")}
                      error={form.formState.errors.orgaoExpedidor?.message}
                    />
                  </div>
                </div>
              ) : null}
              {step === 1 ? (
                <div className="grid gap-4">
                  <InputForm
                    label="E-mail"
                    type="email"
                    placeholder="nome@exemplo.com"
                    {...form.register("email")}
                    error={form.formState.errors.email?.message}
                  />
                  <InputForm
                    label="Telefone"
                    inputMode="tel"
                    placeholder="(00) 00000-0000"
                    {...form.register("telefone")}
                    error={form.formState.errors.telefone?.message}
                  />
                </div>
              ) : null}
              {step === 2 ? (
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputForm
                      label="CEP"
                      inputMode="numeric"
                      placeholder="00000-000"
                      {...form.register("cep")}
                      error={form.formState.errors.cep?.message}
                    />
                    <SelectForm
                      label="UF"
                      {...form.register("uf")}
                      error={form.formState.errors.uf?.message}
                    >
                      <option value="">Selecione</option>
                      {UFS.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </SelectForm>
                  </div>
                  <InputForm
                    label="Logradouro"
                    placeholder="Rua, avenida, travessa..."
                    {...form.register("logradouro")}
                    error={form.formState.errors.logradouro?.message}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputForm
                      label="Número"
                      {...form.register("numero")}
                      error={form.formState.errors.numero?.message}
                    />
                    <InputForm
                      label="Complemento"
                      {...form.register("complemento")}
                      error={form.formState.errors.complemento?.message}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputForm
                      label="Bairro"
                      {...form.register("bairro")}
                      error={form.formState.errors.bairro?.message}
                    />
                    <InputForm
                      label="Cidade"
                      {...form.register("cidade")}
                      error={form.formState.errors.cidade?.message}
                    />
                  </div>
                </div>
              ) : null}
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              <div className="ml-auto flex items-center gap-2">
                {step > 0 ? (
                  <Button type="button" variant="secondary" onClick={previousStep}>
                    <ChevronLeft aria-hidden="true" />
                    Voltar
                  </Button>
                ) : null}
                {step < 2 ? (
                  <Button type="button" onClick={nextStep}>
                    Continuar
                    <ChevronRight aria-hidden="true" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isPending}>
                    {isPending ? "Salvando..." : "Salvar"}
                  </Button>
                )}
              </div>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
