"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import getFonteAction from "@/core/actions/fontes/get_fonte_action";
import { atualizarFonteAction } from "@/core/actions/fontes/update_fonte_action";
import { useToast } from "@/core/hooks/useToast";
import {
  atualizarFonteSchema,
  type AtualizarFonteInput,
} from "@/core/schemas/fontes/create_fonte_schema";
import { FonteSchema } from "@/core/schemas/fontes/fonte_schema";
import { Button } from "@/core/ui/atoms/button";
import { Tooltip } from "@/core/ui/atoms/tooltip";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { TextareaForm } from "@/core/ui/molecules/textarea-form";
import { CheckboxForm } from "./fonte-fields";

export function FonteDetalheModal({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [fonte, setFonte] = useState<FonteSchema | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<AtualizarFonteInput>({
    resolver: zodResolver(atualizarFonteSchema),
    defaultValues: {
      nome: "",
      codigo: "",
      tipo: "",
      valorPrevisto: "",
      vigencia: "",
      descricao: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (!fonte) return;
    form.reset({
      nome: fonte.nome,
      codigo: fonte.codigo ?? "",
      tipo: fonte.tipo ?? "",
      valorPrevisto: fonte.valorPrevisto ?? "",
      vigencia: fonte.vigencia ?? "",
      descricao: fonte.descricao ?? "",
      ativo: fonte.ativo,
    });
  }, [fonte, form]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;
    startTransition(async () => {
      try {
        const data = await getFonteAction(id);
        setFonte(data);
      } catch {
        toast.error("Não foi possível carregar a fonte.");
        setOpen(false);
      }
    });
  }

  function onSubmit(values: AtualizarFonteInput) {
    if (!fonte) return;
    startTransition(async () => {
      const result = await atualizarFonteAction(fonte.id, values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setFonte(result.data);
      toast.success("Fonte atualizada com sucesso.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Tooltip content="Editar fonte">
        <Button
          variant="secondary"
          size="iconSm"
          aria-label="Editar fonte"
          onClick={() => handleOpenChange(true)}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </Tooltip>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-2xl">
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>{fonte?.nome ?? "Carregando fonte"}</Modal.Title>
            <Modal.Description>
              Consulte, edite ou altere o status da fonte sem sair da listagem.
            </Modal.Description>
          </Modal.Header>
          {!fonte ? (
            <Modal.Body>
              <p className="text-sm text-muted">Carregando dados...</p>
            </Modal.Body>
          ) : (
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
                <CheckboxForm label="Ativo" {...form.register("ativo")} />
              </Modal.Body>
              <Modal.Footer>
                <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                  Cancelar
                </Modal.Close>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Salvando..." : "Salvar alterações"}
                </Button>
              </Modal.Footer>
            </form>
          )}
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
