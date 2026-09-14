"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { criarFonteAction } from "@/core/actions/fontes/create_fonte_action";
import {
  criarFonteSchema,
  type CriarFonteInput,
} from "@/core/schemas/fontes/create_fonte_schema";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { TextareaForm } from "@/core/ui/molecules/textarea-form";

export function CriarFonteModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const form = useForm<CriarFonteInput>({
    resolver: zodResolver(criarFonteSchema),
    defaultValues: {
      nome: "",
      codigo: "",
      tipo: "",
      valorPrevisto: "",
      vigencia: "",
      descricao: "",
    },
  });

  function onSubmit(values: CriarFonteInput) {
    const parsed = criarFonteSchema.parse(values);
    startTransition(async () => {
      const result = await criarFonteAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Fonte criada com sucesso.");
      form.reset();
      setOpen(false);
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Nova fonte
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar fonte</Modal.Title>
            <Modal.Description>
              Informe os dados da fonte pagadora.
            </Modal.Description>
          </Modal.Header>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <InputForm
                label="Nome"
                required
                {...form.register("nome")}
                error={form.formState.errors.nome?.message}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputForm
                  label="Código"
                  {...form.register("codigo")}
                  error={form.formState.errors.codigo?.message}
                />
                <InputForm
                  label="Tipo"
                  placeholder="Ex: Tesouro, Convênio, Emenda"
                  {...form.register("tipo")}
                  error={form.formState.errors.tipo?.message}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InputForm
                  label="Valor previsto"
                  {...form.register("valorPrevisto")}
                  error={form.formState.errors.valorPrevisto?.message}
                />
                <InputForm
                  label="Vigência"
                  placeholder="Ex: 2024-2026"
                  {...form.register("vigencia")}
                  error={form.formState.errors.vigencia?.message}
                />
              </div>
              <TextareaForm
                label="Descrição"
                rows={3}
                {...form.register("descricao")}
                error={form.formState.errors.descricao?.message}
              />
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
