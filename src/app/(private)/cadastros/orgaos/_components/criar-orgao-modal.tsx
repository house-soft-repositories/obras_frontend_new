"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { criarOrgaoAction } from "@/core/actions/orgaos/create_orgao_action";
import { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import {
  criarOrgaoSchema,
  type CriarOrgaoInput,
} from "@/core/schemas/orgaos/create_orgao_schema";
import TipoOrgao from "@/core/schemas/orgaos/tipo_orgao_enum";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { CheckboxForm, SelectForm } from "./cadastro-fields";

const tipoLabels: Record<TipoOrgao, string> = {
  [TipoOrgao.SECRETARIA]: "Secretaria",
  [TipoOrgao.AUTARQUIA]: "Autarquia",
  [TipoOrgao.FUNDACAO]: "Fundação",
  [TipoOrgao.EMPRESA_PUBLICA]: "Empresa pública",
};

export function CriarOrgaoModal({
  localidades,
}: {
  localidades: LocalidadeSchema[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const form = useForm<CriarOrgaoInput>({
    resolver: zodResolver(criarOrgaoSchema),
    defaultValues: {
      localidadeId: "",
      nome: "",
      sigla: "",
      responsavel: "",
      email: "",
      telefone: "",
      ativo: true,
    },
  });

  function onSubmit(values: CriarOrgaoInput) {
    const parsed = criarOrgaoSchema.parse(values);
    startTransition(async () => {
      const result = await criarOrgaoAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Órgão criado com sucesso.");
      form.reset();
      setOpen(false);
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Novo órgão
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar órgão</Modal.Title>
            <Modal.Description>
              Vincule o órgão a uma localidade.
            </Modal.Description>
          </Modal.Header>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <SelectForm
                label="Localidade"
                required
                {...form.register("localidadeId")}
                error={form.formState.errors.localidadeId?.message}
              >
                <option value="">Selecione</option>
                {localidades.map((localidade) => (
                  <option key={localidade.id} value={localidade.id}>
                    {localidade.nome} - {localidade.uf}
                  </option>
                ))}
              </SelectForm>
              <InputForm
                label="Nome"
                required
                {...form.register("nome")}
                error={form.formState.errors.nome?.message}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputForm
                  label="Sigla"
                  {...form.register("sigla")}
                  error={form.formState.errors.sigla?.message}
                />
                <SelectForm
                  label="Tipo"
                  {...form.register("tipo")}
                  error={form.formState.errors.tipo?.message}
                >
                  <option value="">Selecione</option>
                  {Object.values(TipoOrgao).map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipoLabels[tipo]}
                    </option>
                  ))}
                </SelectForm>
              </div>
              <InputForm
                label="Responsável"
                {...form.register("responsavel")}
                error={form.formState.errors.responsavel?.message}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputForm
                  label="E-mail"
                  type="email"
                  {...form.register("email")}
                  error={form.formState.errors.email?.message}
                />
                <InputForm
                  label="Telefone"
                  {...form.register("telefone")}
                  error={form.formState.errors.telefone?.message}
                />
              </div>
              <CheckboxForm label="Ativo" {...form.register("ativo")} />
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
