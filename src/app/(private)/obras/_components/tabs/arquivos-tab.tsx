"use client";

import { Download, FileText, Trash2, Upload } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/core/ui/atoms/button";
import { Body, Caption } from "@/core/ui/atoms/typography";

// TODO(backend): /api/attachments possui upload/download/replace/delete, mas
// não expõe listagem por entidade (entityType/entityId). A listagem abaixo usa
// estado local vazio até o backend expor a listagem; nenhuma lista mockada é
// exibida.
export function ArquivosTab({ obraId }: { obraId: string }) {
  const toast = useToast();
  const [arquivos, setArquivos] = useState<string[]>([]);

  function aoSelecionar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    // Sem listagem no backend, mantém apenas referência local temporária.
    setArquivos((prev) => [...prev, file.name]);
    toast.error(
      `Arquivo "${file.name}" selecionado, mas o upload da obra ${obraId} depende da listagem por entidade no backend novo.`,
    );
  }

  return (
    <div role="tabpanel" className="p-5">
      <label className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-app border-2 border-dashed border-border bg-surface-subtle px-4 py-6 text-center text-[13px] font-semibold text-muted">
        <span className="flex flex-col items-center gap-2">
          <Upload className="size-5" />
          Adicionar arquivo
        </span>
        <input type="file" className="sr-only" onChange={aoSelecionar} />
      </label>
      {arquivos.length === 0 ? (
        <div className="mt-4 grid gap-2 text-center">
          <Body className="font-semibold">Nenhum arquivo vinculado</Body>
          <Caption>
            A listagem de anexos por obra ainda não existe no backend novo.
          </Caption>
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-app border border-border">
          {arquivos.map((file) => (
            <div key={file} className="flex min-h-14 items-center gap-3 border-b border-border px-3.5 last:border-0">
              <FileText className="size-4 shrink-0 text-muted" />
              <strong className="flex-1 text-[13px]">{file}</strong>
              <Button variant="ghost" size="sm" aria-label={`Baixar ${file}`} onClick={() => toast.error("Download indisponível sem listagem no backend novo.")}>
                <Download className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" aria-label={`Remover ${file}`} onClick={() => setArquivos((prev) => prev.filter((f) => f !== file))}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
