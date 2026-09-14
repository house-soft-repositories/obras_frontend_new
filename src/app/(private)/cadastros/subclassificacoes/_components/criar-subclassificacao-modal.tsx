"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { criarSubclassificacaoAction } from "@/core/actions/cadastros/create_subclassificacao_action";
import { ClassificacaoSchema } from "@/core/schemas/cadastros/classificacao_schema";
import { criarSubclassificacaoSchema, type CriarSubclassificacaoInput } from "@/core/schemas/cadastros/create_subclassificacao_schema";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import * as React from "react";

function SelectField({ label, error, required, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-semibold text-foreground">{label}{required ? <span className="ml-1 text-[var(--cor-perigo)]">*</span> : null}</label>
      <select className="h-11 w-full rounded-app border border-input bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" {...props}>{children}</select>
      {error ? <p className="text-xs text-[var(--cor-perigo)]" role="alert">{error}</p> : null}
    </div>
  );
}

export function CriarSubclassificacaoModal({ classificacoes, defaultClassificacaoId }: { classificacoes: ClassificacaoSchema[]; defaultClassificacaoId?: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const form = useForm<CriarSubclassificacaoInput>({
    resolver: zodResolver(criarSubclassificacaoSchema),
    defaultValues: { classificacaoId: defaultClassificacaoId ?? "", nome: "" },
  });

  function onSubmit(values: CriarSubclassificacaoInput) {
    const parsed = criarSubclassificacaoSchema.parse(values);
    startTransition(async () => {
      const result = await criarSubclassificacaoAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Subclassificação criada com sucesso.");
      form.reset({ classificacaoId: parsed.classificacaoId, nome: "" });
      setOpen(false);
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Nova subclassificação
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar subclassificação</Modal.Title>
            <Modal.Description>Selecione a classificação e informe o nome.</Modal.Description>
          </Modal.Header>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <SelectField label="Classificação" required {...form.register("classificacaoId")} error={form.formState.errors.classificacaoId?.message}>
                <option value="">Selecione</option>
                {classificacoes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </SelectField>
              <InputForm label="Nome" required {...form.register("nome")} error={form.formState.errors.nome?.message} />
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              <Button type="submit" disabled={isPending}>{isPending ? "Salvando..." : "Salvar"}</Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
