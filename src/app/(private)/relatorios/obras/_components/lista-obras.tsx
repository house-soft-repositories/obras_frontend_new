"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { Modal } from "@/core/ui/molecules/modal";
import { useToast } from "@/core/hooks/useToast";
import { exportarObrasRelatorioAction } from "@/core/actions/relatorios/obras_relatorio_action";
import {
  corSemaforo,
  totalPaginas,
  type FiltroRelatorioObras,
  type ItemListaObras,
} from "@/core/schemas/relatorios/obras_relatorio_schema";
import { TIPO_OBRA_LABELS, tipoObraSchema } from "@/core/schemas/obras/tipo_obra";

function texto(valor: unknown): string {
  return typeof valor === "string" && valor.trim() ? valor : "—";
}

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

export function ListaObras({
  obras,
  total,
  pagina,
  tamanho,
  filtros,
}: {
  obras: ItemListaObras[];
  total: number;
  pagina: number;
  tamanho: number;
  filtros: FiltroRelatorioObras;
}) {
  const router = useRouter();
  const toast = useToast();
  const [exportOpen, setExportOpen] = useState(false);
  const [exportando, setExportando] = useState<"CSV" | "PDF" | null>(null);

  const paginas = totalPaginas(total, tamanho);

  function irParaPagina(destino: number) {
    const proxima = Math.min(Math.max(1, destino), paginas);
    const usp = new URLSearchParams(window.location.search);
    if (proxima <= 1) usp.delete("pagina");
    else usp.set("pagina", String(proxima));
    const qs = usp.toString();
    router.push(`/relatorios/obras${qs ? `?${qs}` : ""}`);
  }

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
      <DataTable<ItemListaObras>
        title="Obras"
        data={obras}
        getRowId={(obra) => obra.obraId}
        renderCardTitle={(obra) => texto(obra.nome)}
        renderCardStatus={(obra) => texto(obra.statusObra || undefined)}
        pageSize={Math.max(tamanho, obras.length, 1)}
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
              <span className="flex items-center gap-2">
                <span
                  title={obra.semaforo ?? "sem status"}
                  aria-label={`Semáforo: ${obra.semaforo ?? "sem status"}`}
                  className="inline-block size-3 shrink-0 rounded-full"
                  style={{ background: corSemaforo(obra.semaforo) }}
                />
                <span>
                  <Link
                    href={`/obras/${obra.obraId}`}
                    className="font-semibold hover:underline"
                  >
                    {texto(obra.nome)}
                  </Link>
                  <span className="block text-xs text-muted">{texto(obra.codigo)}</span>
                </span>
              </span>
            ),
          },
          {
            id: "status",
            header: "Status",
            cell: (obra) => texto(obra.statusObra || undefined),
          },
          {
            id: "estagio",
            header: "Estágio",
            cell: (obra) => texto(obra.estagioAtualNome),
          },
          {
            id: "percentual",
            header: "% Realizado",
            numeric: true,
            cell: (obra) => `${Math.round(obra.percentualRealizado)}%`,
          },
          {
            id: "localidade",
            header: "Localidade",
            cell: (obra) => texto(obra.localidadeNome),
          },
          {
            id: "orgao",
            header: "Órgão",
            cell: (obra) => texto(obra.orgaoNome),
          },
          {
            id: "contrato",
            header: "Contrato",
            cell: (obra) => texto(obra.numeroContrato),
          },
          {
            id: "tipo",
            header: "Tipo",
            card: false,
            cell: (obra) => {
              const parsed = tipoObraSchema.safeParse(obra.tipo);
              return parsed.success ? TIPO_OBRA_LABELS[parsed.data] : texto(obra.tipo);
            },
          },
        ]}
      />
      <nav
        aria-label="Paginação do relatório"
        className="flex flex-wrap items-center justify-between gap-3 rounded-app border border-border bg-surface px-4 py-3 shadow-card"
      >
        <p className="text-xs leading-4 text-muted" aria-live="polite">
          Página {pagina} de {paginas} · {total} registro(s)
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Página anterior"
            disabled={pagina <= 1}
            onClick={() => irParaPagina(pagina - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Próxima página"
            disabled={pagina >= paginas}
            onClick={() => irParaPagina(pagina + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </nav>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Exportar relatório</Modal.Title>
            <Modal.Description>
              Exporta a lista filtrada (até 10.000 registros) via
              GET /api/relatorios/obras/exportar.
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
