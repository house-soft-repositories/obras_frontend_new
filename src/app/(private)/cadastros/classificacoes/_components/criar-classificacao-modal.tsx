"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { criarClassificacaoAction } from "@/core/actions/cadastros/create_classificacao_action";
import { criarClassificacaoSchema, type CriarClassificacaoInput } from "@/core/schemas/cadastros/create_classificacao_schema";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";

export function CriarClassificacaoModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const form = useForm<CriarClassificacaoInput>({
    resolver: zodResolver(criarClassificacaoSchema),
    defaultValues: { nome: "" },
  });

  function onSubmit(values: CriarClassificacaoInput) {
    const parsed = criarClassificacaoSchema.parse(values);
    startTransition(async () => {
      const result = await criarClassificacaoAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Classificação criada com sucesso.");
      form.reset();
      setOpen(false);
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Nova classificação
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar classificação</Modal.Title>
            <Modal.Description>Informe o nome da classificação.</Modal.Description>
          </Modal.Header>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <InputForm label="Nome" required {...form.register("nome")} error={form.formState.errors.nome?.message} />
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
