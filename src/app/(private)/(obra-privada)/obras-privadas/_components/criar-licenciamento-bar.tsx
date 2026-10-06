"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CriarAlvaraModal } from "./criar-alvara-modal";
import { CriarHabiteSeModal } from "./criar-habite-se-modal";

export type ObraOpcao = {
  id: string;
  codigo?: string | null;
  endereco?: string | null;
};

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

export function CriarLicenciamentoBar({ obras }: Props) {
  const router = useRouter();
  const [obraId, setObraId] = useState(obras[0]?.id ?? "");
  const refresh = () => router.refresh();

  if (obras.length === 0) {
    return (
      <p className="rounded-app border border-dashed border-border bg-surface p-4 text-sm text-muted">
        Cadastre uma obra privada para registrar alvarás e habite-se.
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
          <CriarAlvaraModal obraPrivadaId={obraId} onSuccess={refresh} />
          <CriarHabiteSeModal obraPrivadaId={obraId} onSuccess={refresh} />
        </div>
      ) : null}
    </div>
  );
}
