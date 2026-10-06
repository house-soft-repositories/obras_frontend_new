"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Loader2, Plus } from "lucide-react";
import { createAutoObraPrivadaAction } from "@/core/actions/obras-privadas/obra_privada_recursos_actions";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import { Modal } from "@/core/ui/molecules/modal";
import {
  SITUACAO_AUTO_INFRACAO_LABELS,
  TIPO_AUTO_INFRACAO_LABELS,
} from "@/core/schemas/obras-privadas/obra_privada_schema";
import {
  SITUACAO_AUTO_INFRACAO_VALUES,
  TIPO_AUTO_INFRACAO_VALUES,
  criarAutoFormularioSchema,
  type CriarAutoFormularioInput,
  type CriarAutoInput,
} from "@/core/schemas/obras-privadas/create_obra_privada_recursos_schema";

type Props = {
  obraPrivadaId: string;
  fiscalizacoes?: Array<{ id: string; numero?: string | null }>;
  triggerLabel?: string;
  onSuccess: () => void;
};

const initialValues: CriarAutoFormularioInput = {
  tipo: "" as unknown as CriarAutoFormularioInput["tipo"],
  dataEmissao: "",
  descricao: "",
  fiscalizacaoId: "",
  prazoDias: "",
  baseLegal: "",
  valorMulta: "",
  situacao: "",
  dataEncerramento: "",
  observacoes: "",
};

const selectClassName =
  "h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-red-700">{message}</span>;
}

export function CriarAutoModal({
  obraPrivadaId,
  fiscalizacoes = [],
  triggerLabel = "Novo auto",
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const form = useForm<CriarAutoFormularioInput, unknown, CriarAutoInput>({
    resolver: zodResolver(criarAutoFormularioSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const close = () => {
    if (!submitting) {
      setOpen(false);
      setApiError("");
      form.reset(initialValues);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      return;
    }
    close();
  };

  function submit(data: CriarAutoInput) {
    setApiError("");
    setSubmitting(true);
    void createAutoObraPrivadaAction(obraPrivadaId, data)
      .then((result) => {
        if (!result.success) throw new Error(result.error);
        toast.success("Auto registrado com sucesso.");
        setOpen(false);
        setApiError("");
        form.reset(initialValues);
        onSuccess();
      })
      .catch((error) => {
        setApiError(
          error instanceof Error
            ? error.message
            : "Não foi possível registrar o auto. Os dados foram preservados.",
        );
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Trigger asChild>
        <Button type="button">
          <Plus className="size-4" /> {triggerLabel}
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-h-[95vh] max-w-3xl overflow-y-auto p-5 sm:p-7">
          <form onSubmit={form.handleSubmit(submit)} noValidate>
            <div className="flex items-start justify-between gap-4">
              <Modal.Header>
                <Modal.Title className="text-2xl">Novo auto</Modal.Title>
                <Modal.Description>
                  Registre uma notificação, auto de infração, embargo,
                  interdição ou multa para esta obra.
                </Modal.Description>
              </Modal.Header>
              <Modal.CloseIcon onClick={close} />
            </div>
            {apiError ? (
              <p
                role="alert"
                className="mt-4 rounded-app border border-red-300 bg-red-50 p-3 text-sm text-red-800"
              >
                {apiError}
              </p>
            ) : null}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium">
                Tipo *
                <select
                  className={selectClassName}
                  {...form.register("tipo")}
                >
                  <option value="">Selecione</option>
                  {TIPO_AUTO_INFRACAO_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {TIPO_AUTO_INFRACAO_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
                <FieldError
                  message={form.formState.errors.tipo?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Data de emissão *
                <Input type="date" {...form.register("dataEmissao")} />
                <FieldError
                  message={form.formState.errors.dataEmissao?.message}
                />
              </label>
              {fiscalizacoes.length > 0 ? (
                <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                  Fiscalização vinculada
                  <select
                    className={selectClassName}
                    {...form.register("fiscalizacaoId")}
                  >
                    <option value="">Nenhuma</option>
                    {fiscalizacoes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.numero ?? item.id}
                      </option>
                    ))}
                  </select>
                  <FieldError
                    message={form.formState.errors.fiscalizacaoId?.message}
                  />
                </label>
              ) : null}
              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Descrição *
                <Input
                  placeholder="Descreva a irregularidade constatada"
                  {...form.register("descricao")}
                />
                <FieldError
                  message={form.formState.errors.descricao?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Prazo (dias)
                <Input
                  inputMode="numeric"
                  placeholder="15"
                  {...form.register("prazoDias")}
                />
                <FieldError
                  message={form.formState.errors.prazoDias?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Situação
                <select
                  className={selectClassName}
                  {...form.register("situacao")}
                >
                  <option value="">Selecione</option>
                  {SITUACAO_AUTO_INFRACAO_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {SITUACAO_AUTO_INFRACAO_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Base legal
                <Input {...form.register("baseLegal")} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Valor da multa (R$)
                <Input
                  inputMode="decimal"
                  placeholder="1500,00"
                  {...form.register("valorMulta")}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Data de encerramento
                <Input type="date" {...form.register("dataEncerramento")} />
              </label>
              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Observações
                <Input {...form.register("observacoes")} />
              </label>
            </div>
            <div className="mt-7 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={close}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Check className="size-4" /> Registrar auto
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
