"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { criarProfissionalTecnicoAction } from "@/core/actions/profissionais-tecnicos/create_profissional_tecnico_action";
import {
  createProfissionalTecnicoSchema,
  type CreateProfissionalTecnicoInput,
  type CreateProfissionalTecnicoOutput,
} from "@/core/schemas/profissionais-tecnicos/create_profissional_tecnico_schema";
import type { PessoaType } from "@/core/schemas/pessoa/pessoa_schema";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";

const CONSELHOS = ["CREA", "CAU", "CFT"] as const;
const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
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
        className="h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
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

export function CriarProfissionalTecnicoModal({
  pessoas,
}: {
  pessoas: PessoaType[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<
    CreateProfissionalTecnicoInput,
    unknown,
    CreateProfissionalTecnicoOutput
  >({
    resolver: zodResolver(createProfissionalTecnicoSchema),
    mode: "onTouched",
    defaultValues: {
      pessoaId: "",
      conselho: "CREA",
      numeroRegistro: "",
      ufRegistro: "",
      titulo: "",
      ativo: true,
    },
  });

  function resetForm() {
    form.reset({
      pessoaId: "",
      conselho: "CREA",
      numeroRegistro: "",
      ufRegistro: "",
      titulo: "",
      ativo: true,
    });
  }

  function onSubmit(values: CreateProfissionalTecnicoOutput) {
    const parsed = createProfissionalTecnicoSchema.parse(values);
    startTransition(async () => {
      const result = await criarProfissionalTecnicoAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Profissional técnico cadastrado com sucesso.");
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
          Novo profissional
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar profissional técnico</Modal.Title>
            <Modal.Description>
              Vincule uma pessoa já cadastrada ao conselho profissional.
            </Modal.Description>
          </Modal.Header>
          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <Modal.Body>
              <SelectForm
                label="Pessoa"
                required
                {...form.register("pessoaId")}
                error={form.formState.errors.pessoaId?.message}
                disabled={pessoas.length === 0}
              >
                <option value="">
                  {pessoas.length === 0
                    ? "Nenhuma pessoa cadastrada"
                    : "Selecione"}
                </option>
                {pessoas.map((pessoa) => (
                  <option key={pessoa.id} value={pessoa.id}>
                    {pessoa.nome} — {pessoa.documento}
                  </option>
                ))}
              </SelectForm>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectForm
                  label="Conselho"
                  required
                  {...form.register("conselho")}
                  error={form.formState.errors.conselho?.message}
                >
                  {CONSELHOS.map((conselho) => (
                    <option key={conselho} value={conselho}>
                      {conselho}
                    </option>
                  ))}
                </SelectForm>
                <SelectForm
                  label="UF do registro"
                  {...form.register("ufRegistro")}
                  error={form.formState.errors.ufRegistro?.message}
                >
                  <option value="">Sem UF</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </SelectForm>
              </div>
              <InputForm
                label="Número do registro"
                required
                placeholder="Ex.: 5069884120"
                {...form.register("numeroRegistro")}
                error={form.formState.errors.numeroRegistro?.message}
              />
              <InputForm
                label="Título profissional"
                placeholder="Ex.: Eng. Civil, Arquiteta"
                {...form.register("titulo")}
                error={form.formState.errors.titulo?.message}
              />
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              <Button
                type="submit"
                disabled={isPending || pessoas.length === 0}
              >
                {isPending ? "Salvando..." : "Salvar profissional"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
