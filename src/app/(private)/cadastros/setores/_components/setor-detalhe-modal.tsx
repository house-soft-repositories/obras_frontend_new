"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import getSetorAction from "@/core/actions/setores/get_setor_action";
import { atualizarSetorAction } from "@/core/actions/setores/update_setor_action";
import { useToast } from "@/core/hooks/useToast";
import {
  setorPayloadSchema,
  type SetorPayloadInput,
} from "@/core/schemas/setores/create_setor_schema";
import { SetorSchema } from "@/core/schemas/setores/setor_schema";
import { Button } from "@/core/ui/atoms/button";
import { Tooltip } from "@/core/ui/atoms/tooltip";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { CheckboxForm } from "./cadastro-fields";

export function SetorDetalheModal({
  id,
  orgaoId,
  orgaoNome,
}: {
  id: string;
  orgaoId: string;
  orgaoNome: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [setor, setSetor] = useState<SetorSchema | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<SetorPayloadInput>({
    resolver: zodResolver(setorPayloadSchema),
    defaultValues: {
      nome: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (!setor) return;
    form.reset({
      nome: setor.nome,
      ativo: setor.ativo,
    });
  }, [form, setor]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;
    startTransition(async () => {
      try {
        const data = await getSetorAction(orgaoId, id);
        setSetor(data);
      } catch {
        toast.error("Não foi possível carregar o setor.");
        setOpen(false);
      }
    });
  }

  function onSubmit(values: SetorPayloadInput) {
    if (!setor) return;
    const parsed = setorPayloadSchema.parse(values);
    startTransition(async () => {
      const result = await atualizarSetorAction(orgaoId, setor.id, parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setSetor(result.data);
      toast.success("Setor atualizado com sucesso.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Tooltip content="Editar setor">
        <Button
          variant="secondary"
          size="iconSm"
          aria-label="Editar setor"
          onClick={() => handleOpenChange(true)}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </Tooltip>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>{setor?.nome ?? "Carregando setor"}</Modal.Title>
            <Modal.Description>
              Órgão: {orgaoNome}. Consulte ou edite sem sair da listagem.
            </Modal.Description>
          </Modal.Header>
          {!setor ? (
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
