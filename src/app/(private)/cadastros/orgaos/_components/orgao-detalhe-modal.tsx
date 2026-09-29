"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import getOrgaoAction from "@/core/actions/orgaos/get_orgao_action";
import { atualizarOrgaoAction } from "@/core/actions/orgaos/update_orgao_action";
import { useToast } from "@/core/hooks/useToast";
import { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import {
  criarOrgaoSchema,
  type CriarOrgaoInput,
} from "@/core/schemas/orgaos/create_orgao_schema";
import { OrgaoSchema } from "@/core/schemas/orgaos/orgao_schema";
import TipoOrgao from "@/core/schemas/orgaos/tipo_orgao_enum";
import { Button } from "@/core/ui/atoms/button";
import { Tooltip } from "@/core/ui/atoms/tooltip";
import { InputForm } from "@/core/ui/molecules/input-form";
import { Modal } from "@/core/ui/molecules/modal";
import { CheckboxForm, SelectForm } from "./cadastro-fields";

const tipoLabels: Record<TipoOrgao, string> = {
  [TipoOrgao.SECRETARIA]: "Secretaria",
  [TipoOrgao.AUTARQUIA]: "Autarquia",
  [TipoOrgao.FUNDACAO]: "Fundação",
  [TipoOrgao.EMPRESA_PUBLICA]: "Empresa pública",
};

export function OrgaoDetalheModal({
  id,
  localidades,
}: {
  id: string;
  localidades: LocalidadeSchema[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [orgao, setOrgao] = useState<OrgaoSchema | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<CriarOrgaoInput>({
    resolver: zodResolver(criarOrgaoSchema),
    defaultValues: {
      localidadeId: "",
      nome: "",
      sigla: "",
      tipo: undefined,
      responsavel: "",
      email: "",
      telefone: "",
      ativo: true,
    },
  });

  useEffect(() => {
    if (!orgao) return;
    form.reset({
      localidadeId: orgao.localidadeId,
      nome: orgao.nome,
      sigla: orgao.sigla ?? "",
      tipo: orgao.tipo ?? undefined,
      responsavel: orgao.responsavel ?? "",
      email: orgao.email ?? "",
      telefone: orgao.telefone ?? "",
      ativo: orgao.ativo,
    });
  }, [form, orgao]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) return;
    startTransition(async () => {
      try {
        const data = await getOrgaoAction(id);
        setOrgao(data);
      } catch {
        toast.error("Não foi possível carregar o órgão.");
        setOpen(false);
      }
    });
  }

  function onSubmit(values: CriarOrgaoInput) {
    if (!orgao) return;
    const parsed = criarOrgaoSchema.parse(values);
    startTransition(async () => {
      const result = await atualizarOrgaoAction(orgao.id, parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setOrgao(result.data);
      toast.success("Órgão atualizado com sucesso.");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Tooltip content="Editar órgão">
        <Button
          variant="secondary"
          size="iconSm"
          aria-label="Editar órgão"
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
            <Modal.Title>{orgao?.nome ?? "Carregando órgão"}</Modal.Title>
            <Modal.Description>
              Consulte ou edite o órgão sem sair da listagem.
            </Modal.Description>
          </Modal.Header>
          {!orgao ? (
            <Modal.Body>
              <p className="text-sm text-muted">Carregando dados...</p>
            </Modal.Body>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <Modal.Body>
                <SelectForm
                  label="Localidade"
                  required
                  {...form.register("localidadeId")}
                  error={form.formState.errors.localidadeId?.message}
                >
                  <option value="">Selecione</option>
                  {localidades.map((localidade) => (
                    <option key={localidade.id} value={localidade.id}>
                      {localidade.nome} - {localidade.uf}
                    </option>
                  ))}
                </SelectForm>
                <InputForm
                  label="Nome"
                  required
                  {...form.register("nome")}
                  error={form.formState.errors.nome?.message}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputForm
                    label="Sigla"
                    {...form.register("sigla")}
                    error={form.formState.errors.sigla?.message}
                  />
                  <SelectForm
                    label="Tipo"
                    {...form.register("tipo")}
                    error={form.formState.errors.tipo?.message}
                  >
                    <option value="">Selecione</option>
                    {Object.values(TipoOrgao).map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipoLabels[tipo]}
                      </option>
                    ))}
                  </SelectForm>
                </div>
                <InputForm
                  label="Responsável"
                  {...form.register("responsavel")}
                  error={form.formState.errors.responsavel?.message}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputForm
                    label="E-mail"
                    type="email"
                    {...form.register("email")}
                    error={form.formState.errors.email?.message}
                  />
                  <InputForm
                    label="Telefone"
                    {...form.register("telefone")}
                    error={form.formState.errors.telefone?.message}
                  />
                </div>
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
