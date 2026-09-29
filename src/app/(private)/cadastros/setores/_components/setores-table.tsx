"use client";

import { useRouter } from "next/navigation";
import { excluirSetorAction } from "@/core/actions/setores/delete_setor_action";
import { useToast } from "@/core/hooks/useToast";
import { DataTable } from "@/core/ui/atoms/data-table";
import { SetorWithOrgaoSchema } from "@/core/schemas/setores/setor_schema";
import PageMeta from "@/core/types/pagination/page_meta";
import { DeleteActionDialog } from "../../_components/delete-action-dialog";
import { SetorDetalheModal } from "./setor-detalhe-modal";

function ExcluirSetorButton({ setor }: { setor: SetorWithOrgaoSchema }) {
  const router = useRouter();
  const toast = useToast();

  async function onDelete() {
    const result = await excluirSetorAction(setor.orgao.id, setor.id);
    if (!result.success) {
      toast.error(result.error);
      return false;
    }
    toast.success("Setor excluído com sucesso.");
    router.refresh();
    return true;
  }

  return (
    <DeleteActionDialog
      ariaLabel={`Excluir setor ${setor.nome}`}
      title="Excluir setor"
      description={
        <>
          Tem certeza que deseja excluir o setor{" "}
          <strong className="font-semibold text-foreground">{setor.nome}</strong>
          ? Esta ação não pode ser desfeita.
        </>
      }
      tooltip="Excluir setor"
      onConfirm={onDelete}
    />
  );
}

export function SetoresTable({
  data,
  meta,
}: {
  data: SetorWithOrgaoSchema[];
  meta: PageMeta;
}) {
  return (
    <DataTable<SetorWithOrgaoSchema>
      title="Setores cadastrados"
      data={data}
      getRowId={(setor) => setor.id}
      renderCardTitle={(setor) => setor.nome}
      renderCardStatus={(setor) => (setor.ativo ? "Ativo" : "Inativo")}
      pageSize={meta.take}
      columns={[
        { id: "nome", header: "Nome", cell: (setor) => setor.nome },
        { id: "orgao", header: "Órgão", cell: (setor) => setor.orgao.nome },
        {
          id: "status",
          header: "Status",
          cell: (setor) => (setor.ativo ? "Ativo" : "Inativo"),
        },
        {
          id: "actions",
          header: "Ações",
          className: "w-0 whitespace-nowrap",
          cell: (setor) => (
            <div className="flex items-center gap-2">
              <SetorDetalheModal
                id={setor.id}
                orgaoId={setor.orgao.id}
                orgaoNome={setor.orgao.nome}
              />
              <ExcluirSetorButton setor={setor} />
            </div>
          ),
        },
      ]}
    />
  );
}
