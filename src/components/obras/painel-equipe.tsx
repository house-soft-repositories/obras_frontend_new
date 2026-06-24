"use client";

import { useEffect, useState } from "react";

interface Responsavel {
  id: string;
  usuarioId: string;
  tipo: string;
}

/** Painel de equipe da obra (RN-OBR-08/10): responsaveis e seguidores. */
export function PainelEquipe({ obraId }: { obraId: string }) {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [tipo, setTipo] = useState("CORRESPONSAVEL");
  const [msg, setMsg] = useState<string | null>(null);
  const [v, setV] = useState(0);

  useEffect(() => {
    let vivo = true;
    fetch(`/api/proxy/obras/${obraId}/equipe/responsaveis`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => vivo && setResponsaveis(d))
      .catch(() => vivo && setResponsaveis([]));
    return () => {
      vivo = false;
    };
  }, [obraId, v]);

  return (
    <section style={{ display: "grid", gap: 8 }}>
      <h3>Equipe</h3>
      <ul>
        {responsaveis.map((r) => (
          <li key={r.id}>
            {r.tipo}: {r.usuarioId}
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="usuario id"
          value={usuarioId}
          onChange={(e) => setUsuarioId(e.target.value)}
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="CORRESPONSAVEL">CORRESPONSAVEL</option>
          <option value="RESPONSAVEL">RESPONSAVEL</option>
        </select>
        <button
          type="button"
          onClick={async () => {
            const r = await fetch(
              `/api/proxy/obras/${obraId}/equipe/responsaveis`,
              {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ usuarioId, tipo }),
              },
            );
            setMsg(r.ok ? "Adicionado." : `Erro ${r.status}`);
            if (r.ok) {
              setUsuarioId("");
              setV((n) => n + 1);
            }
          }}
        >
          Adicionar
        </button>
      </div>
      {msg && <small>{msg}</small>}
    </section>
  );
}
