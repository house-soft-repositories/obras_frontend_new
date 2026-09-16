"use client";

import Link from "next/link";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { Modal } from "@/core/ui/molecules/modal";
import { lerOrgao, lerStatus } from "@/core/actions/relatorios/obras_relatorio_action";
import { TIPO_OBRA_LABELS, tipoObraSchema } from "@/core/schemas/obras/tipo_obra";
import type { Obra } from "@/core/schemas/obras/obra_schema";

function texto(valor: unknown): string {
  return typeof valor === "string" && valor.trim() ? valor : "—";
}

export function ListaObras({ obras }: { obras: Obra[] }) {
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <Modal.Root open={exportOpen} onOpenChange={setExportOpen}>
      <DataTable<Obra>
        title="Obras"
        data={obras}
        getRowId={(obra) => obra.id}
        renderCardTitle={(obra) => texto(obra.nome)}
        renderCardStatus={(obra) => texto(lerStatus(obra) || undefined)}
        pageSize={10}
        action={
          <Modal.Trigger asChild>
            <Button variant="secondary">
              <Download aria-hidden="true" />
              Exportar
            </Button>
          </Modal.Trigger>
        }
        columns={[
          {
            id: "nome",
            header: "Obra",
            cell: (obra) => (
              <span>
                <Link
                  href={`/obras/${obra.id}`}
                  className="font-semibold hover:underline"
                >
                  {texto(obra.nome)}
                </Link>
                <span className="block text-xs text-muted">{texto(obra.codigo)}</span>
              </span>
            ),
          },
          {
            id: "tipo",
            header: "Tipo",
            cell: (obra) => {
              const parsed = tipoObraSchema.safeParse(
                (obra as { tipo?: unknown }).tipo,
              );
              return parsed.success ? TIPO_OBRA_LABELS[parsed.data] : texto((obra as { tipo?: unknown }).tipo);
            },
          },
          {
            id: "status",
            header: "Status",
            cell: (obra) => texto(lerStatus(obra) || undefined),
          },
          {
            id: "orgao",
            header: "Órgão",
            cell: (obra) => texto(lerOrgao(obra).nome === "Sem órgão" ? undefined : lerOrgao(obra).nome),
          },
        ]}
      />
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Exportar relatório</Modal.Title>
            <Modal.Description>
              A exportação em PDF/CSV ainda depende do endpoint do backend
              (contrato legado: GET /relatorios/obras/exportar). Por enquanto,
              use a tabela filtrada nesta página.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm text-muted">
              {obras.length} obra(s) nos filtros atuais. TODO: ligar aos
              botões abaixo quando o backend expor a exportação.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle">
              Fechar
            </Modal.Close>
            <Button disabled title="Disponível após integração com o backend">
              Exportar PDF
            </Button>
            <Button disabled title="Disponível após integração com o backend">
              Exportar CSV
            </Button>
          </Modal.Footer>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
