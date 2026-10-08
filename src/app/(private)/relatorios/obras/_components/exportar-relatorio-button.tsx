"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { Modal } from "@/core/ui/molecules/modal";
import { useToast } from "@/core/hooks/useToast";
import { exportarObrasRelatorioAction } from "@/core/actions/relatorios/obras_relatorio_action";
import type { FiltroRelatorioObras } from "@/core/schemas/relatorios/obras_relatorio_schema";

function baixarBase64(base64: string, fileName: string, contentType: string) {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: contentType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Botão + modal de exportação da lista filtrada (CSV/PDF, até 10.000 registros). */
export function ExportarRelatorioButton({
  filtros,
  total,
}: {
  filtros: FiltroRelatorioObras;
  total: number;
}) {
  const toast = useToast();
  const [exportOpen, setExportOpen] = useState(false);
  const [exportando, setExportando] = useState<"CSV" | "PDF" | null>(null);

  async function exportar(formato: "CSV" | "PDF") {
    setExportando(formato);
    const result = await exportarObrasRelatorioAction({ ...filtros, formato });
    setExportando(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    baixarBase64(
      result.data.base64,
      result.data.fileName,
      result.data.contentType,
    );
    toast.success("Relatório gerado.");
    setExportOpen(false);
  }

  return (
    <Modal.Root open={exportOpen} onOpenChange={setExportOpen}>
      <Modal.Trigger asChild>
        <Button variant="secondary">
          <Download aria-hidden="true" />
          Exportar
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Exportar relatório</Modal.Title>
            <Modal.Description>
              Exporta a lista filtrada (até 10.000 registros) via GET
              /api/relatorios/obras/exportar.
            </Modal.Description>
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm text-muted">
              {total} obra(s) nos filtros atuais.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle">
              Fechar
            </Modal.Close>
            <Button
              disabled={exportando !== null}
              onClick={() => exportar("PDF")}
            >
              {exportando === "PDF" ? "Gerando…" : "Exportar PDF"}
            </Button>
            <Button
              disabled={exportando !== null}
              onClick={() => exportar("CSV")}
            >
              {exportando === "CSV" ? "Gerando…" : "Exportar CSV"}
            </Button>
          </Modal.Footer>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
