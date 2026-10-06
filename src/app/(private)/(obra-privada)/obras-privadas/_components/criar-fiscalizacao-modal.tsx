"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Loader2, Plus } from "lucide-react";
import { createFiscalizacaoObraPrivadaAction } from "@/core/actions/obras-privadas/obra_privada_recursos_actions";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import { Modal } from "@/core/ui/molecules/modal";
import {
  RESULTADO_FISCALIZACAO_LABELS,
  TIPO_FISCALIZACAO_LABELS,
} from "@/core/schemas/obras-privadas/obra_privada_schema";
import {
  ETAPA_OBRA_PRIVADA_VALUES,
  LOCAL_ENTULHO_VALUES,
  RESULTADO_FISCALIZACAO_VALUES,
  TIPO_FISCALIZACAO_VALUES,
  criarFiscalizacaoFormularioSchema,
  type CriarFiscalizacaoFormularioInput,
  type CriarFiscalizacaoInput,
} from "@/core/schemas/obras-privadas/create_obra_privada_recursos_schema";

const ETAPA_OBRA_LABELS: Record<string, string> = {
  NAO_INICIADA: "Não iniciada",
  FUNDACAO: "Fundação",
  ESTRUTURA: "Estrutura",
  ALVENARIA: "Alvenaria",
  COBERTURA: "Cobertura",
  INSTALACOES: "Instalações",
  ACABAMENTO: "Acabamento",
  CONCLUIDA: "Concluída",
};

const LOCAL_ENTULHO_LABELS: Record<string, string> = {
  VIA_PUBLICA: "Via pública",
  PASSEIO: "Passeio",
  TERRENO_VIZINHO: "Terreno vizinho",
  CANTEIRO: "Canteiro",
  AREA_PROTEGIDA: "Área protegida",
};

const BOOLEAN_OPTIONS = [
  { value: "", label: "Não informar" },
  { value: "true", label: "Sim" },
  { value: "false", label: "Não" },
];

type Props = {
  obraPrivadaId: string;
  triggerLabel?: string;
  onSuccess: () => void;
};

const initialValues: CriarFiscalizacaoFormularioInput = {
  tipo: "" as unknown as CriarFiscalizacaoFormularioInput["tipo"],
  dataFiscalizacao: "",
  resultado:
    "" as unknown as CriarFiscalizacaoFormularioInput["resultado"],
  etapaConstatada: "",
  constatacoes: "",
  providencias: "",
  latitude: "",
  longitude: "",
  entulhoHaIrregularidade: "",
  entulhoVolumeEstimadoM3: "",
  entulhoLocal: "",
  entulhoPossuiCacamba: "",
  entulhoPossuiPgrcc: "",
  entulhoDestinacao: "",
};

const selectClassName =
  "h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-red-700">{message}</span>;
}

export function CriarFiscalizacaoModal({
  obraPrivadaId,
  triggerLabel = "Nova fiscalização",
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const form = useForm<
    CriarFiscalizacaoFormularioInput,
    unknown,
    CriarFiscalizacaoInput
  >({
    resolver: zodResolver(criarFiscalizacaoFormularioSchema),
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

  function submit(data: CriarFiscalizacaoInput) {
    setApiError("");
    setSubmitting(true);
    void createFiscalizacaoObraPrivadaAction(obraPrivadaId, data)
      .then((result) => {
        if (!result.success) throw new Error(result.error);
        toast.success("Fiscalização registrada com sucesso.");
        setOpen(false);
        setApiError("");
        form.reset(initialValues);
        onSuccess();
      })
      .catch((error) => {
        setApiError(
          error instanceof Error
            ? error.message
            : "Não foi possível registrar a fiscalização. Os dados foram preservados.",
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
                <Modal.Title className="text-2xl">
                  Nova fiscalização
                </Modal.Title>
                <Modal.Description>
                  Registre uma visita de fiscalização nesta obra privada.
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
                  {TIPO_FISCALIZACAO_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {TIPO_FISCALIZACAO_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
                <FieldError
                  message={form.formState.errors.tipo?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Data da fiscalização *
                <Input
                  type="date"
                  {...form.register("dataFiscalizacao")}
                />
                <FieldError
                  message={form.formState.errors.dataFiscalizacao?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Resultado *
                <select
                  className={selectClassName}
                  {...form.register("resultado")}
                >
                  <option value="">Selecione</option>
                  {RESULTADO_FISCALIZACAO_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {RESULTADO_FISCALIZACAO_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
                <FieldError
                  message={form.formState.errors.resultado?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Etapa constatada
                <select
                  className={selectClassName}
                  {...form.register("etapaConstatada")}
                >
                  <option value="">Selecione</option>
                  {ETAPA_OBRA_PRIVADA_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {ETAPA_OBRA_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Constatações
                <Input {...form.register("constatacoes")} />
              </label>
              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Providências
                <Input {...form.register("providencias")} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Latitude
                <Input
                  inputMode="decimal"
                  placeholder="-3,7319"
                  {...form.register("latitude")}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Longitude
                <Input
                  inputMode="decimal"
                  placeholder="-38,5267"
                  {...form.register("longitude")}
                />
              </label>
            </div>
            <h3 className="mt-6 font-display text-lg font-semibold">
              Entulho
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium">
                Há irregularidade de entulho?
                <select
                  className={selectClassName}
                  {...form.register("entulhoHaIrregularidade")}
                >
                  {BOOLEAN_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Volume estimado (m³)
                <Input
                  inputMode="decimal"
                  placeholder="4,5"
                  {...form.register("entulhoVolumeEstimadoM3")}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Local do entulho
                <select
                  className={selectClassName}
                  {...form.register("entulhoLocal")}
                >
                  <option value="">Selecione</option>
                  {LOCAL_ENTULHO_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {LOCAL_ENTULHO_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Destinação do entulho
                <Input {...form.register("entulhoDestinacao")} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Possui caçamba?
                <select
                  className={selectClassName}
                  {...form.register("entulhoPossuiCacamba")}
                >
                  {BOOLEAN_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Possui PGRCC?
                <select
                  className={selectClassName}
                  {...form.register("entulhoPossuiPgrcc")}
                >
                  {BOOLEAN_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                    <Check className="size-4" /> Registrar fiscalização
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
