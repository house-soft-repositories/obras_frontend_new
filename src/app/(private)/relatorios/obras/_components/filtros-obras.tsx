"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import { Caption } from "@/core/ui/atoms/typography";
import { TIPO_OBRA_LABELS, TIPO_OBRA_VALUES } from "@/core/schemas/obras/tipo_obra";

export interface FiltroInicial {
  q: string;
  status: string;
  tipo: string;
  orgaoId: string;
}

const STATUS = ["EM_DESENVOLVIMENTO", "CONCLUIDO", "PARALISADO", "CANCELADO"];

export function FiltrosObras({
  inicial,
  orgaos,
}: {
  inicial: FiltroInicial;
  orgaos: Array<{ id: string; nome: string }>;
}) {
  const router = useRouter();
  const [q, setQ] = useState(inicial.q);
  const [status, setStatus] = useState(inicial.status);
  const [tipo, setTipo] = useState(inicial.tipo);
  const [orgaoId, setOrgaoId] = useState(inicial.orgaoId);

  function aplicar(event: React.FormEvent) {
    event.preventDefault();
    const usp = new URLSearchParams();
    if (q.trim()) usp.set("q", q.trim());
    if (status) usp.set("status", status);
    if (tipo) usp.set("tipo", tipo);
    if (orgaoId) usp.set("orgaoId", orgaoId);
    const qs = usp.toString();
    router.push(`/relatorios/obras${qs ? `?${qs}` : ""}`);
  }

  function limpar() {
    setQ("");
    setStatus("");
    setTipo("");
    setOrgaoId("");
    router.push("/relatorios/obras");
  }

  return (
    <form
      onSubmit={aplicar}
      aria-label="Filtros do relatório de obras"
      className="rounded-app border border-border bg-surface p-5 shadow-card"
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Busca textual
          <span className="relative block">
            <Search aria-hidden="true" className="absolute top-3.5 left-3 size-4 text-muted" />
            <Input
              className="pl-9"
              placeholder="Nome, código ou contrato…"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
          </span>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Status
          <select
            aria-label="Filtrar por status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-11 rounded-app border border-input bg-surface px-3 text-sm font-normal text-foreground"
          >
            <option value="">Todos</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Tipo
          <select
            aria-label="Filtrar por tipo"
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            className="h-11 rounded-app border border-input bg-surface px-3 text-sm font-normal text-foreground"
          >
            <option value="">Todos</option>
            {TIPO_OBRA_VALUES.map((value) => (
              <option key={value} value={value}>
                {TIPO_OBRA_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs font-semibold text-muted">
          Órgão
          <select
            aria-label="Filtrar por órgão"
            value={orgaoId}
            onChange={(event) => setOrgaoId(event.target.value)}
            className="h-11 rounded-app border border-input bg-surface px-3 text-sm font-normal text-foreground"
          >
            <option value="">Todos</option>
            {orgaos.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="submit">Aplicar filtros</Button>
        <Button type="button" variant="secondary" onClick={limpar}>
          Limpar
        </Button>
        <Caption>Filtros aplicados no servidor via URL.</Caption>
      </div>
    </form>
  );
}
