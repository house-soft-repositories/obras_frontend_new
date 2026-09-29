"use client";

import { useRouter } from "next/navigation";
import { excluirOrgaoAction } from "@/core/actions/orgaos/delete_orgao_action";
import { useToast } from "@/core/hooks/useToast";
import { DataTable } from "@/core/ui/atoms/data-table";
import { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import { OrgaoSchema } from "@/core/schemas/orgaos/orgao_schema";
import PageMeta from "@/core/types/pagination/page_meta";
import { DeleteActionDialog } from "../../_components/delete-action-dialog";
import { OrgaoDetalheModal } from "./orgao-detalhe-modal";

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

function ExcluirOrgaoButton({ orgao }: { orgao: OrgaoSchema }) {
  const router = useRouter();
  const toast = useToast();

  async function onDelete() {
    const result = await excluirOrgaoAction(orgao.id);
    if (!result.success) {
      toast.error(result.error);
      return false;
    }
    toast.success("Órgão excluído com sucesso.");
    router.refresh();
    return true;
  }

  return (
    <DeleteActionDialog
      ariaLabel={`Excluir órgão ${orgao.nome}`}
      title="Excluir órgão"
      description={
        <>
          Tem certeza que deseja excluir o órgão{" "}
          <strong className="font-semibold text-foreground">{orgao.nome}</strong>
          ? Esta ação não pode ser desfeita.
        </>
      }
      tooltip="Excluir órgão"
      onConfirm={onDelete}
    />
  );
}

export function OrgaosTable({
  data,
  meta,
  localidades,
}: {
  data: OrgaoSchema[];
  meta: PageMeta;
  localidades: LocalidadeSchema[];
}) {
  return (
    <DataTable<OrgaoSchema>
      title="Órgãos cadastrados"
      data={data}
      getRowId={(orgao) => orgao.id}
      renderCardTitle={(orgao) => orgao.nome}
      renderCardStatus={(orgao) => (orgao.ativo ? "Ativo" : "Inativo")}
      pageSize={meta.take}
      columns={[
        { id: "nome", header: "Nome", cell: (orgao) => orgao.nome },
        {
          id: "sigla",
          header: "Sigla",
          cell: (orgao) => formatNullable(orgao.sigla),
        },
        {
          id: "tipo",
          header: "Tipo",
          cell: (orgao) => formatNullable(orgao.tipo),
        },
        {
          id: "responsavel",
          header: "Responsável",
          cell: (orgao) => formatNullable(orgao.responsavel),
        },
        {
          id: "status",
          header: "Status",
          cell: (orgao) => (orgao.ativo ? "Ativo" : "Inativo"),
        },
        {
          id: "actions",
          header: "Ações",
          className: "w-0 whitespace-nowrap",
          cell: (orgao) => (
            <div className="flex items-center gap-2">
              <OrgaoDetalheModal id={orgao.id} localidades={localidades} />
              <ExcluirOrgaoButton orgao={orgao} />
            </div>
          ),
        },
      ]}
    />
  );
}
