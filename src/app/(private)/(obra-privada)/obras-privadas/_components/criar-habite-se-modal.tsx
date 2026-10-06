"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { Check, Loader2, Plus } from "lucide-react";
import { createHabiteSeObraPrivadaAction } from "@/core/actions/obras-privadas/obra_privada_recursos_actions";
import listUsuariosPaginationAction from "@/core/actions/usuarios/list_usuarios_pagination_action";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import { InputDateIso } from "@/core/ui/atoms/input-date-iso";
import { Modal } from "@/core/ui/molecules/modal";
import {
  RESULTADO_HABITE_SE_LABELS,
} from "@/core/schemas/obras-privadas/obra_privada_schema";
import {
  RESULTADO_HABITE_SE_VALUES,
  criarHabiteSeFormularioSchema,
  type CriarHabiteSeFormularioInput,
  type CriarHabiteSeInput,
} from "@/core/schemas/obras-privadas/create_obra_privada_recursos_schema";
import {
  ACCEPT_ANEXO,
  categoriaPorMime,
} from "@/core/schemas/obras-privadas/obra_privada_arquivo_schema";

export type VistoriadorOpcao = {
  id: string;
  nome: string;
};

type Props = {
  obraPrivadaId: string;
  fiscalizacoes?: Array<{ id: string; numero?: string | null }>;
  vistoriadores?: VistoriadorOpcao[];
  triggerLabel?: string;
  onSuccess: () => void;
};

const initialValues: CriarHabiteSeFormularioInput = {
  numero: "",
  resultado: "" as unknown as CriarHabiteSeFormularioInput["resultado"],
  dataEmissao: "",
  parcial: false,
  descricaoParcial: "",
  dataVistoria: "",
  vistoriadorUsuarioId: "",
  fiscalizacaoId: "",
  areaConstruidaExecutadaM2: "",
  divergenciaProjeto: false,
  divergenciaDescricao: "",
  parecer: "",
};

const selectClassName =
  "h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <span className="text-xs text-red-700">{message}</span>;
}

export function CriarHabiteSeModal({
  obraPrivadaId,
  fiscalizacoes = [],
  vistoriadores: vistoriadoresIniciais = [],
  triggerLabel = "Novo habite-se",
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [vistoriadores, setVistoriadores] = useState<VistoriadorOpcao[]>(
    vistoriadoresIniciais,
  );
  const [carregandoVistoriadores, setCarregandoVistoriadores] = useState(false);
  const vistoriadoresCarregados = useRef(false);
  const toast = useToast();
  const form = useForm<
    CriarHabiteSeFormularioInput,
    unknown,
    CriarHabiteSeInput
  >({
    resolver: zodResolver(criarHabiteSeFormularioSchema),
    defaultValues: initialValues,
    mode: "onBlur",
  });
  const parcial = form.watch("parcial");
  const divergenciaProjeto = form.watch("divergenciaProjeto");
  const dataEmissao = form.watch("dataEmissao");
  const dataVistoria = form.watch("dataVistoria");

  useEffect(() => {
    if (vistoriadoresIniciais.length > 0) {
      setVistoriadores(vistoriadoresIniciais);
      return;
    }
  }, [vistoriadoresIniciais]);

  useEffect(() => {
    if (!open || vistoriadores.length > 0 || vistoriadoresCarregados.current) {
      return;
    }
    vistoriadoresCarregados.current = true;
    setCarregandoVistoriadores(true);
    listUsuariosPaginationAction({ page: 1, order: "ASC", take: 50 })
      .then((pagina) => {
        setVistoriadores(
          pagina.data
            .filter((usuario) => usuario.role !== "USER")
            .map((usuario) => ({
              id: usuario.id,
              nome: usuario.email
                ? `${usuario.name} — ${usuario.email}`
                : usuario.name,
            })),
        );
      })
      .catch(() => {
        vistoriadoresCarregados.current = false;
      })
      .finally(() => setCarregandoVistoriadores(false));
  }, [open, vistoriadores.length]);

  const close = () => {
    if (!submitting) {
      setOpen(false);
      setApiError("");
      setArquivo(null);
      setFileKey((key) => key + 1);
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

  function submit(data: CriarHabiteSeInput) {
    setApiError("");
    setSubmitting(true);
    void createHabiteSeObraPrivadaAction(
      obraPrivadaId,
      data,
      arquivo ?? undefined,
    )
      .then((result) => {
        if (!result.success) throw new Error(result.error);
        toast.success("Habite-se registrado com sucesso.");
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
            : "Não foi possível registrar o habite-se. Os dados foram preservados.",
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
                <Modal.Title className="text-2xl">Novo habite-se</Modal.Title>
                <Modal.Description>
                  Registre o habite-se desta obra privada.
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
                Número *
                <Input {...form.register("numero")} />
                <FieldError
                  message={form.formState.errors.numero?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Resultado *
                <select
                  className={selectClassName}
                  {...form.register("resultado")}
                >
                  <option value="">Selecione</option>
                  {RESULTADO_HABITE_SE_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {RESULTADO_HABITE_SE_LABELS[value] ?? value}
                    </option>
                  ))}
                </select>
                <FieldError
                  message={form.formState.errors.resultado?.message}
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Data de emissão
                <InputDateIso
                  value={dataEmissao ?? ""}
                  onBlur={() => void form.trigger("dataEmissao")}
                  onIsoChange={(iso) =>
                    form.setValue("dataEmissao", iso, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Data da vistoria
                <InputDateIso
                  value={dataVistoria ?? ""}
                  onBlur={() => void form.trigger("dataVistoria")}
                  onIsoChange={(iso) =>
                    form.setValue("dataVistoria", iso, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-4"
                  {...form.register("parcial")}
                />
                Habite-se parcial
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-4"
                  {...form.register("divergenciaProjeto")}
                />
                Há divergência do projeto
              </label>
              {parcial ? (
                <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                  Descrição da parcialidade
                  <Input {...form.register("descricaoParcial")} />
                </label>
              ) : null}
              {fiscalizacoes.length > 0 ? (
                <label className="grid gap-1 text-sm font-medium">
                  Fiscalização (vistoria)
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
              <label className="grid gap-1 text-sm font-medium">
                Vistoriador
                {vistoriadores.length > 0 || carregandoVistoriadores ? (
                  <select
                    className={selectClassName}
                    disabled={carregandoVistoriadores}
                    {...form.register("vistoriadorUsuarioId")}
                  >
                    <option value="">
                      {carregandoVistoriadores
                        ? "Carregando vistoriadores..."
                        : "Selecione"}
                    </option>
                    {vistoriadores.map((vistoriador) => (
                      <option key={vistoriador.id} value={vistoriador.id}>
                        {vistoriador.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    placeholder="UUID do vistoriador"
                    {...form.register("vistoriadorUsuarioId")}
                  />
                )}
                <FieldError
                  message={
                    form.formState.errors.vistoriadorUsuarioId?.message
                  }
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Área construída executada (m²)
                <Input
                  inputMode="decimal"
                  placeholder="175,20"
                  {...form.register("areaConstruidaExecutadaM2")}
                />
              </label>
              {divergenciaProjeto ? (
                <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                  Descrição da divergência
                  <Input {...form.register("divergenciaDescricao")} />
                </label>
              ) : null}
              <label className="grid gap-1 text-sm font-medium sm:col-span-2">
                Parecer
                <Input {...form.register("parecer")} />
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
                    <Check className="size-4" /> Registrar habite-se
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
