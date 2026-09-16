"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useRef, useState, useTransition, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { criarEmpresaAction } from "@/core/actions/empresas/create_empresa_action";
import {
  criarEmpresaSchema,
  type CriarEmpresaInput,
  type CriarEmpresaOutput,
} from "@/core/schemas/empresas/create_empresa_schema";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { cn } from "@/core/ui/cn";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";

const steps = ["Empresa", "Contato", "Endereço"] as const;

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

export function CriarEmpresaModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<StepIndex>(0);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const form = useForm<CriarEmpresaInput, unknown, CriarEmpresaOutput>({
    resolver: zodResolver(criarEmpresaSchema),
    defaultValues: {
      razaoSocial: "",
      cnpj: "",
      nomeFantasia: "",
      responsavel: "",
      cargoResponsavel: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      telefones: [""],
    },
  });

  const telefoneId = useRef(0);
  const [telefones, setTelefones] = useState([{ id: telefoneId.current, value: "" }]);

  function addTelefone() {
    telefoneId.current += 1;
    setTelefones((atual) => [...atual, { id: telefoneId.current, value: "" }]);
  }

  function setTelefone(id: number, value: string) {
    setTelefones((atual) => atual.map((item) => (item.id === id ? { ...item, value } : item)));
  }

  function removeTelefone(id: number) {
    setTelefones((atual) => atual.filter((item) => item.id !== id));
  }

  function resetForm() {
    form.reset({
      razaoSocial: "",
      cnpj: "",
      nomeFantasia: "",
      responsavel: "",
      cargoResponsavel: "",
      email: "",
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: "",
      telefones: [""],
    });
    telefoneId.current = 0;
    setTelefones([{ id: 0, value: "" }]);
    setStep(0);
  }

  async function nextStep(event?: React.SyntheticEvent) {
    event?.preventDefault();
    const fieldsToValidate =
      step === 0
        ? (["razaoSocial", "cnpj", "nomeFantasia"] as const)
        : (["responsavel", "cargoResponsavel", "email"] as const);
    const valid = await form.trigger(fieldsToValidate);
    if (valid) setStep((previous) => (previous + 1) as StepIndex);
  }

  function previousStep() {
    setStep((previous) => (previous - 1) as StepIndex);
  }

  function onSubmit(values: CriarEmpresaOutput) {
    const parsed = criarEmpresaSchema.parse({
      ...values,
      telefones: telefones.map((item) => item.value),
    });
    startTransition(async () => {
      const result = await criarEmpresaAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Empresa criada com sucesso.");
      resetForm();
      setOpen(false);
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
          Nova empresa
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar empresa contratada</Modal.Title>
            <Modal.Description>
              Informe os dados da empresa contratada.
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
                  <InputForm
                    label="Razão social"
                    required
                    {...form.register("razaoSocial")}
                    error={form.formState.errors.razaoSocial?.message}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputForm
                      label="CNPJ"
                      required
                      inputMode="numeric"
                      placeholder="00.000.000/0000-00"
                      {...form.register("cnpj")}
                      error={form.formState.errors.cnpj?.message}
                    />
                    <InputForm
                      label="Nome fantasia"
                      {...form.register("nomeFantasia")}
                      error={form.formState.errors.nomeFantasia?.message}
                    />
                  </div>
                </div>
              ) : null}
              {step === 1 ? (
                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <InputForm
                      label="Responsável"
                      {...form.register("responsavel")}
                      error={form.formState.errors.responsavel?.message}
                    />
                    <InputForm
                      label="Cargo do responsável"
                      {...form.register("cargoResponsavel")}
                      error={form.formState.errors.cargoResponsavel?.message}
                    />
                  </div>
                  <InputForm
                    label="E-mail"
                    type="email"
                    placeholder="contato@empresa.com"
                    {...form.register("email")}
                    error={form.formState.errors.email?.message}
                  />
                  <div className="grid gap-3">
                    {telefones.map((telefone, index) => (
                      <div key={telefone.id} className="flex items-end gap-2">
                        <div className="flex-1">
                          <InputForm
                            label={index === 0 ? "Telefone" : `Telefone ${index + 1}`}
                            inputMode="tel"
                            placeholder="(00) 00000-0000"
                            value={telefone.value}
                            onChange={(event) => setTelefone(telefone.id, event.target.value)}
                          />
                        </div>
                        {telefones.length > 1 ? (
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            aria-label={`Remover telefone ${index + 1}`}
                            onClick={() => removeTelefone(telefone.id)}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={addTelefone}>
                      <Plus aria-hidden="true" />
                      Adicionar telefone
                    </Button>
                  </div>
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
