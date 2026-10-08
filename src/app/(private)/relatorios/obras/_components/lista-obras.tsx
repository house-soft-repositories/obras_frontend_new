"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import {
  corSemaforo,
  totalPaginas,
  type FiltroRelatorioObras,
  type ItemListaObras,
} from "@/core/schemas/relatorios/obras_relatorio_schema";
import { TIPO_OBRA_LABELS, tipoObraSchema } from "@/core/schemas/obras/tipo_obra";
import { ExportarRelatorioButton } from "./exportar-relatorio-button";

function texto(valor: unknown): string {
  return typeof valor === "string" && valor.trim() ? valor : "—";
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
  const paginas = totalPaginas(total, tamanho);

  function irParaPagina(destino: number) {
    const proxima = Math.min(Math.max(1, destino), paginas);
    const usp = new URLSearchParams(window.location.search);
    if (proxima <= 1) usp.delete("pagina");
    else usp.set("pagina", String(proxima));
    const qs = usp.toString();
    router.push(`/relatorios/obras${qs ? `?${qs}` : ""}`);
  }

  return (
    <>
      <DataTable<ItemListaObras>
        title="Obras"
        data={obras}
        getRowId={(obra) => obra.obraId}
        renderCardTitle={(obra) => texto(obra.nome)}
        renderCardStatus={(obra) => texto(obra.statusObra || undefined)}
        pageSize={Math.max(tamanho, obras.length, 1)}
        action={<ExportarRelatorioButton filtros={filtros} total={total} />}
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
    </>
  );
}
