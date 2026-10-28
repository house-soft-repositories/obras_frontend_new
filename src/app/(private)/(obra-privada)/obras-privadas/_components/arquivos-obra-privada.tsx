"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { getObraPrivadaArquivoDownloadUrlAction } from "@/core/actions/obras-privadas/obra_privada_arquivo_actions";
import { useToast } from "@/core/hooks/useToast";
import { ACCEPT_ANEXO } from "@/core/schemas/obras-privadas/obra_privada_arquivo_schema";
import type { ArquivoPrivado } from "@/core/schemas/obras-privadas/obra_privada_schema";
import { Button } from "@/core/ui/atoms/button";
import { DataTable } from "@/core/ui/atoms/data-table";
import { Input } from "@/core/ui/atoms/input";
import { anexarArquivo } from "./anexar-arquivo";

type Props = {
  obraPrivadaId: string;
  arquivos: ArquivoPrivado[];
  onSuccess: () => void;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const [date] = value.split("T");
  const parts = date.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
}

function formatSize(value?: number | string | null) {
  if (value == null) return "—";
  const bytes = Number(value);
  if (!Number.isFinite(bytes)) return String(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ArquivosObraPrivada({ obraPrivadaId, arquivos, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const toast = useToast();

  async function enviar(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setEnviando(true);
    try {
      await anexarArquivo({
        obraPrivadaId,
        vinculo: "OBRA",
        file,
        onEtapa: (etapa) => {
          if (etapa === "enviando") toast.info("Enviando arquivo...");
        },
      });
      toast.success("Arquivo anexado.");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível anexar o arquivo.");
    } finally {
      setEnviando(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function baixar(arquivoId: string) {
    const result = await getObraPrivadaArquivoDownloadUrlAction(arquivoId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    window.open(result.data.url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-app border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Arquivos</h2>
            <p className="mt-1 text-sm text-muted">Anexe imagens ou documentos da obra.</p>
          </div>
          <Button type="button" disabled={enviando} onClick={() => inputRef.current?.click()}>
            <Upload className="size-4" /> {enviando ? "Enviando..." : "Anexar arquivo"}
          </Button>
          <Input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ANEXO}
            className="hidden"
            onChange={(event) => void enviar(event.target.files)}
            disabled={enviando}
          />
        </div>
      </section>
      <DataTable<ArquivoPrivado>
        title="Arquivos anexados"
        data={arquivos}
        getRowId={(arquivo) => arquivo.id}
        renderCardTitle={(arquivo) => arquivo.nome ?? arquivo.nomeOriginal ?? "Arquivo"}
        renderCardStatus={(arquivo) => arquivo.categoria ?? "—"}
        columns={[
          {
            id: "nome",
            header: "Nome",
            cell: (arquivo) => arquivo.nome ?? arquivo.nomeOriginal ?? "—",
          },
          { id: "categoria", header: "Categoria", cell: (arquivo) => arquivo.categoria ?? "—" },
          { id: "tipo", header: "Tipo", cell: (arquivo) => arquivo.mimeType ?? "—" },
          { id: "tamanho", header: "Tamanho", cell: (arquivo) => formatSize(arquivo.tamanhoBytes) },
          { id: "capturado", header: "Capturado em", cell: (arquivo) => formatDate(arquivo.capturadoEm) },
          {
            id: "download",
            header: "",
            cell: (arquivo) => (
              <Button type="button" size="sm" variant="ghost" onClick={() => void baixar(arquivo.id)}>
                <Download className="size-4" /> Baixar
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
