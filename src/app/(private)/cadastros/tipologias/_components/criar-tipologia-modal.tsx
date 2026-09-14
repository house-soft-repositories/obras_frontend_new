"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { criarTipologiaAction } from "@/core/actions/cadastros/create_tipologia_action";
import { criarTipologiaSchema, type CriarTipologiaInput } from "@/core/schemas/cadastros/create_tipologia_schema";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";

export function CriarTipologiaModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const form = useForm<CriarTipologiaInput>({
    resolver: zodResolver(criarTipologiaSchema),
    defaultValues: { nome: "" },
  });

  function onSubmit(values: CriarTipologiaInput) {
    const parsed = criarTipologiaSchema.parse(values);
    startTransition(async () => {
      const result = await criarTipologiaAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Tipologia criada com sucesso.");
      form.reset();
      setOpen(false);
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Nova tipologia
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar tipologia</Modal.Title>
            <Modal.Description>Informe o nome da tipologia.</Modal.Description>
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
