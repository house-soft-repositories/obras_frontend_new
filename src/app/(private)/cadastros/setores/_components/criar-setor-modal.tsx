"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { criarSetorAction } from "@/core/actions/setores/create_setor_action";
import { OrgaoSchema } from "@/core/schemas/orgaos/orgao_schema";
import {
  criarSetorSchema,
  type CriarSetorInput,
} from "@/core/schemas/setores/create_setor_schema";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { CheckboxForm, SelectForm } from "./cadastro-fields";

export function CriarSetorModal({ orgaos }: { orgaos: OrgaoSchema[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const form = useForm<CriarSetorInput>({
    resolver: zodResolver(criarSetorSchema),
    defaultValues: { orgaoId: "", nome: "", ativo: true },
  });

  function onSubmit(values: CriarSetorInput) {
    const parsed = criarSetorSchema.parse(values);
    startTransition(async () => {
      const result = await criarSetorAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Setor criado com sucesso.");
      form.reset();
      setOpen(false);
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Novo setor
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar setor</Modal.Title>
            <Modal.Description>
              Selecione o órgão e informe o nome do setor.
            </Modal.Description>
          </Modal.Header>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <SelectForm
                label="Órgão"
                required
                {...form.register("orgaoId")}
                error={form.formState.errors.orgaoId?.message}
              >
                <option value="">Selecione</option>
                {orgaos.map((orgao) => (
                  <option key={orgao.id} value={orgao.id}>
                    {orgao.nome}
                  </option>
                ))}
              </SelectForm>
              <InputForm
                label="Nome"
                required
                {...form.register("nome")}
                error={form.formState.errors.nome?.message}
              />
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
