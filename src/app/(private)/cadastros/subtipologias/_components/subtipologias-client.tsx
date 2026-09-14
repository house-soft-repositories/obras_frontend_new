"use client";

import { useState, useTransition } from "react";
import listSubtipologiasPaginationAction from "@/core/actions/cadastros/list_subtipologias_pagination_action";
import { TipologiaSchema } from "@/core/schemas/cadastros/tipologia_schema";
import { SubtipologiaSchema } from "@/core/schemas/cadastros/subtipologia_schema";
import PageMeta from "@/core/types/pagination/page_meta";
import { SubtipologiasTable } from "./subtipologias-table";

export function SubtipologiasClient({
  tipologias,
  initialData,
  initialMeta,
  initialTipologiaId,
}: {
  tipologias: TipologiaSchema[];
  initialData: SubtipologiaSchema[];
  initialMeta: PageMeta;
  initialTipologiaId: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string>(initialTipologiaId ?? "");
  const [data, setData] = useState<SubtipologiaSchema[]>(initialData);
  const [meta, setMeta] = useState<PageMeta>(initialMeta);
  const [isPending, startTransition] = useTransition();

  function handleChange(value: string) {
    setSelectedId(value);
    if (!value) {
      setData([]);
      return;
    }
    startTransition(async () => {
      const page = await listSubtipologiasPaginationAction({ tipologiaId: value, page: 1, order: "ASC", take: 10 });
      setData(page.data);
      setMeta(page.meta);
    });
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-2">
          <label htmlFor="tipologia-select" className="text-sm font-semibold text-foreground">Tipologia</label>
          <select
            id="tipologia-select"
            value={selectedId}
            onChange={(e) => handleChange(e.target.value)}
            className="h-11 min-w-[260px] rounded-app border border-input bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Selecione uma tipologia</option>
            {tipologias.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>
        {isPending ? <p className="text-sm text-muted">Carregando...</p> : null}
      </div>
      {selectedId ? <SubtipologiasTable data={data} meta={meta} /> : <p className="rounded-app border border-dashed border-border p-8 text-center text-sm text-muted">Selecione uma tipologia para visualizar as subtipologias.</p>}
    </>
  );
}
