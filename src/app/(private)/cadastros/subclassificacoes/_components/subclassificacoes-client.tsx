"use client";

import { useState, useTransition } from "react";
import listSubclassificacoesPaginationAction from "@/core/actions/cadastros/list_subclassificacoes_pagination_action";
import { ClassificacaoSchema } from "@/core/schemas/cadastros/classificacao_schema";
import { SubclassificacaoSchema } from "@/core/schemas/cadastros/subclassificacao_schema";
import PageMeta from "@/core/types/pagination/page_meta";
import { SubclassificacoesTable } from "./subclassificacoes-table";

export function SubclassificacoesClient({
  classificacoes,
  initialData,
  initialMeta,
  initialClassificacaoId,
}: {
  classificacoes: ClassificacaoSchema[];
  initialData: SubclassificacaoSchema[];
  initialMeta: PageMeta;
  initialClassificacaoId: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string>(initialClassificacaoId ?? "");
  const [data, setData] = useState<SubclassificacaoSchema[]>(initialData);
  const [meta, setMeta] = useState<PageMeta>(initialMeta);
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    setSelectedId(value);
    if (!value) {
      setData([]);
      return;
    }
    startTransition(async () => {
      const page = await listSubclassificacoesPaginationAction({ classificacaoId: value, page: 1, order: "ASC", take: 10 });
      setData(page.data);
      setMeta(page.meta);
    });
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-2">
          <label htmlFor="classificacao-select" className="text-sm font-semibold text-foreground">Classificação</label>
          <select
            id="classificacao-select"
            value={selectedId}
            onChange={(e) => handleChange(e.target.value)}
            className="h-11 min-w-[260px] rounded-app border border-input bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecione uma classificação</option>
            {classificacoes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        {isPending ? <p className="text-sm text-muted">Carregando...</p> : null}
      </div>
      {selectedId ? <SubclassificacoesTable data={data} meta={meta} /> : <p className="rounded-app border border-dashed border-border p-8 text-center text-sm text-muted">Selecione uma classificação para visualizar as subclassificações.</p>}
    </>
  );
}
