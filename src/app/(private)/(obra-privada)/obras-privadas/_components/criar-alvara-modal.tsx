"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { Check, Loader2, Plus } from "lucide-react";
import { createAlvaraObraPrivadaAction } from "@/core/actions/obras-privadas/obra_privada_recursos_actions";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import { Modal } from "@/core/ui/molecules/modal";
import {
  SITUACAO_REGISTRO_ALVARA_LABELS,
  TIPO_ALVARA_LABELS,
  type AlvaraPrivado,
} from "@/core/schemas/obras-privadas/obra_privada_schema";
import {
  MOTIVO_ALVARA_VALUES,
  SITUACAO_REGISTRO_ALVARA_VALUES,
  TIPO_ALVARA_VALUES,
  USO_EDIFICACAO_VALUES,
  criarAlvaraFormularioSchema,
  type CriarAlvaraFormularioInput,
  type CriarAlvaraInput,
} from "@/core/schemas/obras-privadas/create_obra_privada_recursos_schema";
import {
  ACCEPT_ANEXO,
  categoriaPorMime,
} from "@/core/schemas/obras-privadas/obra_privada_arquivo_schema";

const MOTIVO_ALVARA_LABELS: Record<string, string> = {
  ORIGINAL: "Original",
  REVALIDACAO: "Revalidação",
  PRORROGACAO: "Prorrogação",
  SEGUNDA_VIA: "Segunda via",
};

const USO_EDIFICACAO_LABELS: Record<string, string> = {
  RESIDENCIAL_UNIFAMILIAR: "Residencial unifamiliar",
  RESIDENCIAL_MULTIFAMILIAR: "Residencial multifamiliar",
  COMERCIAL: "Comercial",
  INDUSTRIAL: "Industrial",
  MISTO: "Misto",
  OUTRO: "Outro",
};

type Props = {
  obraPrivadaId: string;
  alvarasAnteriores?: Array<{ id: string; numero?: string | null; ano?: number | null }>;
  triggerLabel?: string;
  onSuccess: () => void;
};

const initialValues = {
  ano: String(new Date().getFullYear()),
  tipo: "",
  numero: "",
  motivo: "",
  situacao: "",
  dataEmissao: "",
  dataValidade: "",
  alvaraAnteriorId: "",
  areaTerrenoM2: "",
  areaConstruidaAprovadaM2: "",
  uso: "",
  pavimentos: "",
  unidades: "",
  processoAdministrativo: "",
  observacoes: "",
} as unknown as CriarAlvaraFormularioInput;

const selectClassName =
  "h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-red-700">{message}</span>;
}

export function CriarAlvaraModal({
  obraPrivadaId,
  alvarasAnteriores = [],
  triggerLabel = "Novo alvará",
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const toast = useToast();
  const form = useForm<
    CriarAlvaraFormularioInput,
    unknown,
    CriarAlvaraInput
  >({
    resolver: zodResolver(criarAlvaraFormularioSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const close = () => {
    if (!submitting) {
      setOpen(false);
      setApiError("");
      setArquivo(null);
      setFileKey((key) => key + 1);
      form.reset(initialValues);
    }
  };

  function onArquivoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setArquivo(selected);
    if (selected) {
      form.setValue(
        "arquivo",
        {
          nomeOriginal: selected.name,
          categoria: categoriaPorMime(
            selected.type || "application/octet-stream",
          ),
          ...(selected.type ? { mimeType: selected.type } : {}),
        },
        { shouldValidate: true },
      );
    } else {
      form.setValue("arquivo", undefined);
    }
  }

  function removerArquivo() {
    setArquivo(null);
    setFileKey((key) => key + 1);
    form.setValue("arquivo", undefined);
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      return;
    }
    close();
  };

  function submit(data: CriarAlvaraInput) {
    setApiError("");
    setSubmitting(true);
    void createAlvaraObraPrivadaAction(obraPrivadaId, data, arquivo ?? undefined)
      .then((result) => {
        if (!result.success) throw new Error(result.error);
        const created = result.data as AlvaraPrivado;
        toast.success(
          `Alvará ${created.numero ?? ""}/${created.ano ?? ""} registrado com sucesso.`,
        );
        setOpen(false);
        setApiError("");
        setArquivo(null);
        setFileKey((key) => key + 1);
        form.reset(initialValues);
        onSuccess();
      })
      .catch((error) => {
        setApiError(
          error instanceof Error
            ? error.message
            : "Não foi possível registrar o alvará. Os dados foram preservados.",
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
                <Modal.Title className="text-2xl">Novo alvará</Modal.Title>
                <Modal.Description>
                  Registre um alvará para esta obra privada.
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
                Ano *
                <Input
                  inputMode="numeric"
                  placeholder="2026"
                  {...form.register("ano")}
                />
                <FieldError
                  message={form.formState.errors.ano?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Tipo *
                <select
                  className={selectClassName}
                  {...form.register("tipo")}
                >
                  <option value="">Selecione</option>
                  {TIPO_ALVARA_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {TIPO_ALVARA_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
                <FieldError
                  message={form.formState.errors.tipo?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Número
                <Input {...form.register("numero")} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Motivo
                <select
                  className={selectClassName}
                  {...form.register("motivo")}
                >
                  <option value="">Selecione</option>
                  {MOTIVO_ALVARA_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {MOTIVO_ALVARA_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Situação
                <select
                  className={selectClassName}
                  {...form.register("situacao")}
                >
                  <option value="">Selecione</option>
                  {SITUACAO_REGISTRO_ALVARA_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {SITUACAO_REGISTRO_ALVARA_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
              </label>
              {alvarasAnteriores.length > 0 ? (
                <label className="grid gap-1 text-sm font-medium">
                  Alvará anterior
                  <select
                    className={selectClassName}
                    {...form.register("alvaraAnteriorId")}
                  >
                    <option value="">Nenhum</option>
                    {alvarasAnteriores.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.numero ?? "Alvará"}/{item.ano ?? "—"}
                      </option>
                    ))}
                  </select>
                  <FieldError
                    message={
                      form.formState.errors.alvaraAnteriorId?.message
                    }
                  />
                </label>
              ) : null}
              <label className="grid gap-1 text-sm font-medium">
                Data de emissão
                <Input type="date" {...form.register("dataEmissao")} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Data de validade
                <Input type="date" {...form.register("dataValidade")} />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Área do terreno (m²)
                <Input
                  inputMode="decimal"
                  placeholder="250,00"
                  {...form.register("areaTerrenoM2")}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Área construída aprovada (m²)
                <Input
                  inputMode="decimal"
                  placeholder="180,50"
                  {...form.register("areaConstruidaAprovadaM2")}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Uso
                <select className={selectClassName} {...form.register("uso")}>
                  <option value="">Selecione</option>
                  {USO_EDIFICACAO_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {USO_EDIFICACAO_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Pavimentos
                <Input
                  inputMode="numeric"
                  placeholder="2"
                  {...form.register("pavimentos")}
                />
                <FieldError
                  message={form.formState.errors.pavimentos?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Unidades
                <Input
                  inputMode="numeric"
                  placeholder="1"
                  {...form.register("unidades")}
                />
                <FieldError
                  message={form.formState.errors.unidades?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Processo administrativo
                <Input {...form.register("processoAdministrativo")} />
              </label>
              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Arquivo (PDF ou imagem)
                <Input
                  key={fileKey}
                  type="file"
                  accept={ACCEPT_ANEXO}
                  onChange={onArquivoChange}
                />
                {arquivo ? (
                  <span className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                    {arquivo.name} — {(arquivo.size / 1024).toFixed(0)} KB
                    <button
                      type="button"
                      className="underline"
                      onClick={removerArquivo}
                    >
                      Remover
                    </button>
                  </span>
                ) : null}
                <FieldError
                  message={
                    form.formState.errors.arquivo
                      ? "Verifique o arquivo selecionado."
                      : undefined
                  }
                />
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
                    <Check className="size-4" /> Registrar alvará
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
