"use client";

import { useRouter } from "next/navigation";
import { excluirLocalidadeAction } from "@/core/actions/localidades/delete_localidade_action";
import { useToast } from "@/core/hooks/useToast";
import { DataTable } from "@/core/ui/atoms/data-table";
import { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import PageMeta from "@/core/types/pagination/page_meta";
import { DeleteActionDialog } from "../../_components/delete-action-dialog";
import { LocalidadeDetalheModal } from "./localidade-detalhe-modal";

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

function ExcluirLocalidadeButton({
  localidade,
}: {
  localidade: LocalidadeSchema;
}) {
  const router = useRouter();
  const toast = useToast();

  async function onDelete() {
    const result = await excluirLocalidadeAction(localidade.id);
    if (!result.success) {
      toast.error(result.error);
      return false;
    }
    toast.success("Localidade excluída com sucesso.");
    router.refresh();
    return true;
  }

  return (
    <DeleteActionDialog
      ariaLabel={`Excluir localidade ${localidade.nome}`}
      title="Excluir localidade"
      description={
        <>
          Tem certeza que deseja excluir a localidade{" "}
          <strong className="font-semibold text-foreground">
            {localidade.nome}
          </strong>
          ? Esta ação não pode ser desfeita.
        </>
      }
      tooltip="Excluir localidade"
      onConfirm={onDelete}
    />
  );
}

export function LocalidadesTable({
  data,
  meta,
}: {
  data: LocalidadeSchema[];
  meta: PageMeta;
}) {
  return (
    <DataTable<LocalidadeSchema>
      title="Localidades cadastradas"
      data={data}
      getRowId={(localidade) => localidade.id}
      renderCardTitle={(localidade) => localidade.nome}
      pageSize={meta.take}
      columns={[
        { id: "nome", header: "Nome", cell: (localidade) => localidade.nome },
        { id: "uf", header: "UF", cell: (localidade) => localidade.uf },
        {
          id: "tipo",
          header: "Tipo",
          cell: (localidade) => localidade.tipo ?? "—",
        },
        {
          id: "municipio",
          header: "Município",
          cell: (localidade) => formatNullable(localidade.municipio),
        },
        {
          id: "codigoIbge",
          header: "Código IBGE",
          cell: (localidade) => formatNullable(localidade.codigoIbge),
        },
        {
          id: "actions",
          header: "Ações",
          className: "w-0 whitespace-nowrap",
          cell: (localidade) => (
            <div className="flex items-center gap-2">
              <LocalidadeDetalheModal id={localidade.id} />
              <ExcluirLocalidadeButton localidade={localidade} />
            </div>
          ),
        },
      ]}
    />
  );
}
