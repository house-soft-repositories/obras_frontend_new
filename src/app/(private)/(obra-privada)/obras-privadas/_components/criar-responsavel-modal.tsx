"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { createResponsavelObraPrivadaAction } from "@/core/actions/obras-privadas/obra_privada_recursos_actions";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import { Modal } from "@/core/ui/molecules/modal";
import { PAPEL_RESPONSAVEL_LABELS } from "@/core/schemas/obras-privadas/obra_privada_schema";
import {
  PAPEL_RESPONSAVEL_VALUES,
  TIPO_DOCUMENTO_RESPONSABILIDADE_VALUES,
  criarResponsavelObraPrivadaSchema,
  type CriarResponsavelObraPrivadaInput,
} from "@/core/schemas/obras-privadas/obra_privada_responsavel_schema";
import type { ProfissionalTecnico } from "@/core/schemas/profissionais-tecnicos/profissional_tecnico_schema";

type Props = { obraPrivadaId: string; profissionais: ProfissionalTecnico[]; onSuccess: () => void };
const selectClassName = "h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground";

export function CriarResponsavelModal({ obraPrivadaId, profissionais, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const toast = useToast();
  const form = useForm<CriarResponsavelObraPrivadaInput>({
    resolver: zodResolver(criarResponsavelObraPrivadaSchema),
    defaultValues: { profissionalTecnicoId: "", papel: "EXECUCAO", tipoDocumento: "ART", numeroDocumento: "", dataDocumento: "", dataInicio: "" },
  });

  function close() {
    setOpen(false);
    setApiError("");
    form.reset();
  }

  async function submit(input: CriarResponsavelObraPrivadaInput) {
    setApiError("");
    const result = await createResponsavelObraPrivadaAction(obraPrivadaId, input);
    if (!result.success) {
      setApiError(result.error);
      return;
    }
    toast.success("Responsável técnico vinculado com sucesso.");
    close();
    onSuccess();
  }

  return (
    <Modal.Root open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
      <Modal.Trigger asChild><Button type="button"><Plus className="size-4" /> Novo responsável</Button></Modal.Trigger>
      <Modal.Portal><Modal.Backdrop /><Modal.Popup className="max-w-2xl p-6">
        <form onSubmit={form.handleSubmit(submit)} className="grid gap-4" noValidate>
          <div className="flex items-start justify-between"><Modal.Header><Modal.Title className="text-2xl">Novo responsável técnico</Modal.Title><Modal.Description>Vincule um profissional à obra privada.</Modal.Description></Modal.Header><Modal.CloseIcon onClick={close} /></div>
          {apiError ? <p role="alert" className="rounded-app border border-red-300 bg-red-50 p-3 text-sm text-red-800">{apiError}</p> : null}
          <label className="grid gap-1 text-sm font-medium">Profissional técnico
            <select className={selectClassName} {...form.register("profissionalTecnicoId")}><option value="">Selecione</option>{profissionais.filter((p) => p.ativo).map((p) => <option key={p.id} value={p.id}>{p.nome} — {p.documento}</option>)}</select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1 text-sm font-medium">Papel<select className={selectClassName} {...form.register("papel")}>{PAPEL_RESPONSAVEL_VALUES.map((value) => <option key={value} value={value}>{PAPEL_RESPONSAVEL_LABELS[value]}</option>)}</select></label><label className="grid gap-1 text-sm font-medium">Documento<select className={selectClassName} {...form.register("tipoDocumento")}>{TIPO_DOCUMENTO_RESPONSABILIDADE_VALUES.map((value) => <option key={value} value={value}>{value}</option>)}</select></label></div>
          <label className="grid gap-1 text-sm font-medium">Número do documento<Input {...form.register("numeroDocumento")} /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1 text-sm font-medium">Data do documento<Input type="date" {...form.register("dataDocumento")} /></label><label className="grid gap-1 text-sm font-medium">Início<Input type="date" {...form.register("dataInicio")} /></label></div>
          <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={close}>Cancelar</Button><Button type="submit">Vincular responsável</Button></div>
        </form>
      </Modal.Popup></Modal.Portal>
    </Modal.Root>
  );
}
