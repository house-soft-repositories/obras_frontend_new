"use client";

import { useRouter } from "next/navigation";
import { excluirFonteAction } from "@/core/actions/fontes/delete_fonte_action";
import { useToast } from "@/core/hooks/useToast";
import { DataTable } from "@/core/ui/atoms/data-table";
import { FonteSchema } from "@/core/schemas/fontes/fonte_schema";
import PageMeta from "@/core/types/pagination/page_meta";
import { DeleteActionDialog } from "../../_components/delete-action-dialog";
import { FonteDetalheModal } from "./fonte-detalhe-modal";
import { FontesStatusFilter } from "./fontes-status-filter";

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

function ExcluirFonteButton({ fonte }: { fonte: FonteSchema }) {
  const router = useRouter();
  const toast = useToast();

  async function onDelete() {
    const result = await excluirFonteAction(fonte.id);
    if (!result.success) {
      toast.error(result.error);
      return false;
    }
    toast.success("Fonte excluída com sucesso.");
    router.refresh();
    return true;
  }

  return (
    <DeleteActionDialog
      ariaLabel={`Excluir fonte ${fonte.nome}`}
      title="Excluir fonte"
      description={
        <>
          Tem certeza que deseja excluir a fonte{" "}
          <strong className="font-semibold text-foreground">
            {fonte.nome}
          </strong>
          ? Esta ação não pode ser desfeita.
        </>
      }
      tooltip="Excluir fonte"
      onConfirm={onDelete}
    />
  );
}

export function FontesTable({
  data,
  meta,
}: {
  data: FonteSchema[];
  meta: PageMeta;
}) {
  return (
    <DataTable<FonteSchema>
      title="Fontes cadastradas"
      data={data}
      getRowId={(fonte) => fonte.id}
      renderCardTitle={(fonte) => fonte.nome}
      renderCardStatus={(fonte) => (fonte.ativo ? "Ativo" : "Inativo")}
      pageSize={meta.take}
      toolbar={<FontesStatusFilter />}
      columns={[
        { id: "nome", header: "Nome", cell: (fonte) => fonte.nome },
        {
          id: "codigo",
          header: "Código",
          cell: (fonte) => formatNullable(fonte.codigo),
        },
        {
          id: "tipo",
          header: "Tipo",
          cell: (fonte) => formatNullable(fonte.tipo),
        },
        {
          id: "valorPrevisto",
          header: "Valor previsto",
          cell: (fonte) => formatNullable(fonte.valorPrevisto),
        },
        {
          id: "vigencia",
          header: "Vigência",
          cell: (fonte) => formatNullable(fonte.vigencia),
        },
        {
          id: "status",
          header: "Status",
          cell: (fonte) => (fonte.ativo ? "Ativo" : "Inativo"),
        },
        {
          id: "actions",
          header: "Ações",
          className: "w-0 whitespace-nowrap",
          cell: (fonte) => (
            <div className="flex items-center gap-2">
              <FonteDetalheModal id={fonte.id} />
              <ExcluirFonteButton fonte={fonte} />
            </div>
          ),
        },
      ]}
    />
  );
}
