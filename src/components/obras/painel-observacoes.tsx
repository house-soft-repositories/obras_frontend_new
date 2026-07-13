"use client";

import { useEffect, useState } from "react";

interface Observacao {
  id: string;
  texto: string;
  criadoEm: string;
}

/** Painel de observacoes da obra (RN-OBR-18): lista cronologica + nova nota. */
export function PainelObservacoes({ obraId }: { obraId: string }) {
  const [itens, setItens] = useState<Observacao[]>([]);
  const [texto, setTexto] = useState("");
  const [v, setV] = useState(0);

  useEffect(() => {
    let vivo = true;
    fetch(`/api/proxy/obras/${obraId}/observacoes`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => vivo && setItens(d))
      .catch(() => vivo && setItens([]));
    return () => {
      vivo = false;
    };
  }, [obraId, v]);

  return (
    <section style={{ display: "grid", gap: 8 }}>
      <h3>Observações</h3>
      <ol>
        {itens.map((o) => (
          <li key={o.id}>{o.texto}</li>
        ))}
      </ol>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Registrar observacao..."
      />
      <button
        type="button"
        onClick={async () => {
          const r = await fetch(`/api/proxy/obras/${obraId}/observacoes`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ texto }),
          });
          if (r.ok) {
            setTexto("");
            setV((n) => n + 1);
          }
        }}
      >
        Adicionar
      </button>
    </section>
  );
}
