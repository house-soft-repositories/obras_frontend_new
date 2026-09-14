"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { criarLocalidadeAction } from "@/core/actions/localidades/create_localidade_action";
import {
  criarLocalidadeSchema,
  type CriarLocalidadeInput,
} from "@/core/schemas/localidade/create_localidade_shema";
import TipoLocalidade from "@/core/schemas/localidade/tipo_localidade_enum";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { SelectForm } from "./cadastro-fields";

const tipoLabels: Record<TipoLocalidade, string> = {
  [TipoLocalidade.BAIRRO]: "Bairro",
  [TipoLocalidade.DISTRITO]: "Distrito",
  [TipoLocalidade.REGIAO]: "Região",
  [TipoLocalidade.ZONA_RURAL]: "Zona rural",
};

export function CriarLocalidadeModal() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const form = useForm<CriarLocalidadeInput>({
    resolver: zodResolver(criarLocalidadeSchema),
    defaultValues: {
      nome: "",
      uf: "",
      codigoIbge: "",
      municipio: "",
      observacoes: "",
    },
  });

  function onSubmit(values: CriarLocalidadeInput) {
    const parsed = criarLocalidadeSchema.parse(values);
    startTransition(async () => {
      const result = await criarLocalidadeAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Localidade criada com sucesso.");
      form.reset();
      setOpen(false);
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Nova localidade
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar localidade</Modal.Title>
            <Modal.Description>
              Informe os dados básicos da localidade.
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
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
