"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CriarFiscalizacaoModal } from "./criar-fiscalizacao-modal";
import type { ObraOpcao } from "./criar-licenciamento-bar";

type Props = {
  obras: ObraOpcao[];
};

const selectClassName =
  "h-11 min-w-64 rounded-app border border-input bg-surface px-3 text-sm text-foreground";

function obraLabel(obra: ObraOpcao) {
  const codigo =
    typeof obra.codigo === "string" && obra.codigo.trim()
      ? obra.codigo
      : "Obra privada";
  const endereco =
    typeof obra.endereco === "string" && obra.endereco.trim()
      ? ` — ${obra.endereco}`
      : "";
  return `${codigo}${endereco}`;
}

export function CriarFiscalizacaoBar({ obras }: Props) {
  const router = useRouter();
  const [obraId, setObraId] = useState(obras[0]?.id ?? "");
  const refresh = () => router.refresh();

  if (obras.length === 0) {
    return (
      <p className="rounded-app border border-dashed border-border bg-surface p-4 text-sm text-muted">
        Cadastre uma obra privada para registrar fiscalizações.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-app border border-border bg-surface p-4">
      <label className="grid gap-1 text-sm font-medium">
        Obra privada
        <select
          className={selectClassName}
          value={obraId}
          onChange={(event) => setObraId(event.target.value)}
        >
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obraLabel(obra)}
            </option>
          ))}
        </select>
      </label>
      {obraId ? (
        <div className="flex flex-wrap gap-2" key={obraId}>
          <CriarFiscalizacaoModal obraPrivadaId={obraId} onSuccess={refresh} />
        </div>
      ) : null}
    </div>
  );
}
