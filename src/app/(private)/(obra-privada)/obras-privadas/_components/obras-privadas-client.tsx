"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Search } from "lucide-react";
import { exportarObrasPrivadasAction } from "@/core/actions/obras-privadas/download_obras_privadas_report_action";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import {
  ANDAMENTO_LABELS,
  ANDAMENTO_VALUES,
  SITUACAO_ALVARA_LABELS,
  SITUACAO_ALVARA_VALUES,
  type ObraPrivadaList,
} from "@/core/schemas/obras-privadas/obra_privada_schema";
import { CriarObraPrivadaModal } from "./criar-obra-privada-modal";
import { ObrasPrivadasTable } from "./obras-privadas-table";

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

type Option = { id: string; nome: string };
type Props = {
  obras: ObraPrivadaList;
  initialFilters: {
    q: string;
    situacaoAlvara: string;
    andamento: string;
  };
  proprietarios: Option[];
  orgaos: Option[];
  localidades: Option[];
};

export function ObrasPrivadasClient({
  obras,
  initialFilters,
  proprietarios,
  orgaos,
  localidades,
}: Props) {
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState(initialFilters.q);
  const [situacaoAlvara, setSituacaoAlvara] = useState(
    initialFilters.situacaoAlvara,
  );
  const [andamento, setAndamento] = useState(initialFilters.andamento);
  const [exportando, setExportando] = useState<"CSV" | "PDF" | null>(null);

  function filtrar(event: React.FormEvent) {
    event.preventDefault();
    const usp = new URLSearchParams();
    if (q.trim()) usp.set("q", q.trim());
    if (situacaoAlvara) usp.set("situacaoAlvara", situacaoAlvara);
    if (andamento) usp.set("andamento", andamento);
    const qs = usp.toString();
    router.push(qs ? `/obras-privadas?${qs}` : "/obras-privadas");
  }

  async function exportar(formato: "CSV" | "PDF") {
    setExportando(formato);
    const result = await exportarObrasPrivadasAction({
      formato,
      busca: q.trim() || undefined,
      situacaoAlvara: situacaoAlvara || undefined,
      andamento: andamento || undefined,
    });
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
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <section className="mb-8 flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Fiscalização urbana</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Obras privadas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Acompanhe alvarás, fiscalizações e habite-se das obras particulares
            do município.
          </p>
        </div>
        <CriarObraPrivadaModal
          proprietarios={proprietarios}
          orgaos={orgaos}
          localidades={localidades}
          onSuccess={() => router.refresh()}
        />
      </section>
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm">
        <Link
          className="rounded-full border border-border px-3 py-1 hover:underline"
          href="/obras-privadas/autos"
        >
          Autos
        </Link>
        <Link
          className="rounded-full border border-border px-3 py-1 hover:underline"
          href="/obras-privadas/fiscalizacoes"
        >
          Fiscalizações
        </Link>
        <Link
          className="rounded-full border border-border px-3 py-1 hover:underline"
          href="/obras-privadas/licenciamento"
        >
          Licenciamento
        </Link>
        <Link
          className="rounded-full border border-border px-3 py-1 hover:underline"
          href="/obras-privadas/mapa"
        >
          Mapa
        </Link>
        <span className="mx-1 hidden h-5 border-l border-border sm:block" />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={exportando !== null}
          onClick={() => exportar("CSV")}
        >
          <Download className="size-4" />{" "}
          {exportando === "CSV" ? "Gerando..." : "CSV"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={exportando !== null}
          onClick={() => exportar("PDF")}
        >
          <Download className="size-4" />{" "}
          {exportando === "PDF" ? "Gerando..." : "PDF"}
        </Button>
      </nav>
      <form className="mb-5 flex flex-wrap items-end gap-3" onSubmit={filtrar}>
        <label className="grid gap-1 text-sm font-medium">
          Buscar
          <span className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input
              className="pl-9"
              placeholder="Descrição, código ou endereço"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
          </span>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Alvará
          <select
            className="h-11 rounded-app border border-input bg-surface px-3"
            value={situacaoAlvara}
            onChange={(event) => setSituacaoAlvara(event.target.value)}
          >
            <option value="">Todos</option>
            {SITUACAO_ALVARA_VALUES.map((value) => (
              <option key={value} value={value}>
                {SITUACAO_ALVARA_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium">
          Andamento
          <select
            className="h-11 rounded-app border border-input bg-surface px-3"
            value={andamento}
            onChange={(event) => setAndamento(event.target.value)}
          >
            <option value="">Todos</option>
            {ANDAMENTO_VALUES.map((value) => (
              <option key={value} value={value}>
                {ANDAMENTO_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <Button variant="secondary" type="submit">
          Filtrar
        </Button>
      </form>
      {obras.data.length === 0 ? (
        <section className="rounded-app border border-dashed border-border p-12 text-center">
          <h2 className="font-display text-xl font-semibold">
            Nenhuma obra privada encontrada
          </h2>
          <p className="mt-2 text-sm text-muted">
            Ajuste os filtros ou cadastre a primeira obra privada.
          </p>
        </section>
      ) : (
        <ObrasPrivadasTable data={obras.data} />
      )}
      <footer className="mt-3 text-xs text-muted">
        Página {obras.meta.page} de {obras.meta.pageCount} ·{" "}
        {obras.meta.itemCount} registro(s)
      </footer>
    </main>
  );
}
