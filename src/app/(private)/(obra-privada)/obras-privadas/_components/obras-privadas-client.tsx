"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
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

type Option = { id: string; nome: string };
type Props = {
  obras: ObraPrivadaList;
  proprietarios: Option[];
  orgaos: Option[];
  localidades: Option[];
};

export function ObrasPrivadasClient({
  obras,
  proprietarios,
  orgaos,
  localidades,
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [situacaoAlvara, setSituacaoAlvara] = useState("");
  const [andamento, setAndamento] = useState("");

  function filtrar(event: React.FormEvent) {
    event.preventDefault();
    const usp = new URLSearchParams();
    if (q.trim()) usp.set("q", q.trim());
    if (situacaoAlvara) usp.set("situacaoAlvara", situacaoAlvara);
    if (andamento) usp.set("andamento", andamento);
    const qs = usp.toString();
    router.push(qs ? `/obras-privadas?${qs}` : "/obras-privadas");
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
      <nav className="mb-5 flex flex-wrap gap-2 text-sm">
        <Link className="rounded-full border border-border px-3 py-1 hover:underline" href="/obras-privadas/autos">
          Autos
        </Link>
        <Link className="rounded-full border border-border px-3 py-1 hover:underline" href="/obras-privadas/fiscalizacoes">
          Fiscalizações
        </Link>
        <Link className="rounded-full border border-border px-3 py-1 hover:underline" href="/obras-privadas/licenciamento">
          Licenciamento
        </Link>
        <Link className="rounded-full border border-border px-3 py-1 hover:underline" href="/obras-privadas/mapa">
          Mapa
        </Link>
      </nav>
      <form
        className="mb-5 flex flex-wrap items-end gap-3"
        onSubmit={filtrar}
      >
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
