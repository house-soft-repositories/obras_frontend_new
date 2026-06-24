"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export interface Campo {
  nome: string;
  label: string;
  tipo?: string;
  obrigatorio?: boolean;
}

/** Formulario generico de criacao que posta JSON via /api/proxy/<endpoint>. */
export function FormularioCriar({
  endpoint,
  campos,
  titulo,
}: {
  endpoint: string;
  campos: Campo[];
  titulo: string;
}) {
  const router = useRouter();
  const [valores, setValores] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const r = await fetch(`/api/proxy/${endpoint}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(valores),
      });
      if (!r.ok) {
        setErro(`Falha ao salvar (HTTP ${r.status})`);
        return;
      }
      setValores({});
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      style={{
        display: "grid",
        gap: "0.5rem",
        maxWidth: 420,
        marginTop: "1rem",
      }}
    >
      <h3>{titulo}</h3>
      {campos.map((c) => (
        <label key={c.nome} style={{ display: "grid", gap: "0.2rem" }}>
          {c.label}
          <input
            type={c.tipo ?? "text"}
            required={c.obrigatorio}
            value={valores[c.nome] ?? ""}
            onChange={(e) =>
              setValores((v) => ({ ...v, [c.nome]: e.target.value }))
            }
          />
        </label>
      ))}
      {erro && <p style={{ color: "crimson" }}>{erro}</p>}
      <button type="submit" disabled={enviando}>
        {enviando ? "Salvando..." : "Criar"}
      </button>
    </form>
  );
}
