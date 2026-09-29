"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import getLocalidadeAction from "@/core/actions/localidades/get_localidade_action";
import { atualizarLocalidadeAction } from "@/core/actions/localidades/update_localidade_action";
import { useToast } from "@/core/hooks/useToast";
import {
  criarLocalidadeSchema,
  type CriarLocalidadeInput,
} from "@/core/schemas/localidade/create_localidade_shema";
import { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import TipoLocalidade from "@/core/schemas/localidade/tipo_localidade_enum";
import { Button } from "@/core/ui/atoms/button";
import { Tooltip } from "@/core/ui/atoms/tooltip";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { SelectForm } from "./cadastro-fields";

const tipoLabels: Record<TipoLocalidade, string> = {
  [TipoLocalidade.BAIRRO]: "Bairro",
  [TipoLocalidade.DISTRITO]: "Distrito",
  [TipoLocalidade.REGIAO]: "Região",
  [TipoLocalidade.ZONA_RURAL]: "Zona rural",
};

export function LocalidadeDetalheModal({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [localidade, setLocalidade] = useState<LocalidadeSchema | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CriarLocalidadeInput>({
    resolver: zodResolver(criarLocalidadeSchema),
    defaultValues: {
      nome: "",
      uf: "",
      codigoIbge: "",
      tipo: undefined,
      municipio: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (!localidade) return;
    form.reset({
      nome: localidade.nome,
      uf: localidade.uf,
      codigoIbge: localidade.codigoIbge ?? "",
      tipo: localidade.tipo ?? undefined,
      municipio: localidade.municipio ?? "",
      observacoes: localidade.observacoes ?? "",
    });
  }, [form, localidade]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;
    startTransition(async () => {
      try {
        const data = await getLocalidadeAction(id);
        setLocalidade(data);
      } catch {
        toast.error("Não foi possível carregar a localidade.");
        setOpen(false);
      }
    });
  }

  function onSubmit(values: CriarLocalidadeInput) {
    if (!localidade) return;
    const parsed = criarLocalidadeSchema.parse(values);
    startTransition(async () => {
      const result = await atualizarLocalidadeAction(localidade.id, parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setLocalidade(result.data);
      toast.success("Localidade atualizada com sucesso.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Tooltip content="Editar localidade">
        <Button
          variant="secondary"
          size="iconSm"
          aria-label="Editar localidade"
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
            <Modal.Title>
              {localidade?.nome ?? "Carregando localidade"}
            </Modal.Title>
            <Modal.Description>
              Consulte ou edite a localidade sem sair da listagem.
            </Modal.Description>
          </Modal.Header>
          {!localidade ? (
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
                    label="UF"
                    required
                    maxLength={2}
                    {...form.register("uf")}
                    error={form.formState.errors.uf?.message}
                  />
                  <InputForm
                    label="Código IBGE"
                    {...form.register("codigoIbge")}
                    error={form.formState.errors.codigoIbge?.message}
                  />
                </div>
                <SelectForm
                  label="Tipo"
                  {...form.register("tipo")}
                  error={form.formState.errors.tipo?.message}
                >
                  <option value="">Selecione</option>
                  {Object.values(TipoLocalidade).map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipoLabels[tipo]}
                    </option>
                  ))}
                </SelectForm>
                <InputForm
                  label="Município"
                  {...form.register("municipio")}
                  error={form.formState.errors.municipio?.message}
                />
                <InputForm
                  label="Observações"
                  {...form.register("observacoes")}
                  error={form.formState.errors.observacoes?.message}
                />
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
