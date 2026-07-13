"use client";

import { useEffect, useMemo, useState } from "react";
import { rotuloUsuario, type UsuarioResumo } from "@/lib/ui/usuario-labels";

interface Responsavel {
  id: string;
  usuarioId: string;
  tipo: string;
}

const TIPO_LABEL: Record<string, string> = {
  RESPONSAVEL: "Responsável",
  CORRESPONSAVEL: "Corresponsável",
};

/** Painel de equipe da obra (RN-OBR-08/10): responsavel e corresponsaveis. */
export function PainelEquipe({
  obraId,
  usuarios,
}: {
  obraId: string;
  usuarios: UsuarioResumo[];
}) {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [tipo, setTipo] = useState("CORRESPONSAVEL");
  const [msg, setMsg] = useState<string | null>(null);
  const [v, setV] = useState(0);

  // Mapa usuarioId -> rotulo (inclui inativos, para nao "perder" o nome).
  const nomePorId = useMemo(() => {
    const mapa = new Map<string, string>();
    for (const u of usuarios) mapa.set(u.id, rotuloUsuario(u));
    return mapa;
  }, [usuarios]);

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

  // Usuarios ativos que ainda nao estao na equipe (evita duplicar).
  const idsNaEquipe = new Set(responsaveis.map((r) => r.usuarioId));
  const usuariosDisponiveis = usuarios.filter(
    (u) => u.ativo && !idsNaEquipe.has(u.id),
  );

  async function adicionar() {
    if (!usuarioId) {
      setMsg("Selecione um usuário.");
      return;
    }
    const r = await fetch(`/api/proxy/obras/${obraId}/equipe/responsaveis`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ usuarioId, tipo }),
    });
    if (r.ok) {
      setMsg("Adicionado.");
      setUsuarioId("");
      setV((n) => n + 1);
    } else {
      setMsg(await mensagemErro(r));
    }
  }

  async function remover(id: string) {
    const r = await fetch(
      `/api/proxy/obras/${obraId}/equipe/responsaveis/${id}`,
      { method: "DELETE" },
    );
    if (r.ok) {
      setMsg("Removido.");
      setV((n) => n + 1);
    } else {
      setMsg(await mensagemErro(r));
    }
  }

  return (
    <section style={{ display: "grid", gap: 8 }}>
      <h3>Equipe</h3>
      <ul>
        {responsaveis.map((r) => (
          <li key={r.id}>
            {TIPO_LABEL[r.tipo] ?? r.tipo}:{" "}
            {nomePorId.get(r.usuarioId) ?? r.usuarioId}
            {r.tipo !== "RESPONSAVEL" && (
              <button
                type="button"
                onClick={() => remover(r.id)}
                style={{ marginLeft: 8 }}
              >
                Remover
              </button>
            )}
          </li>
        ))}
        {responsaveis.length === 0 && <li>Nenhum membro cadastrado.</li>}
      </ul>
      <div style={{ display: "flex", gap: 8 }}>
        <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
          <option value="">Selecione o usuário</option>
          {usuariosDisponiveis.map((u) => (
            <option key={u.id} value={u.id}>
              {rotuloUsuario(u)}
            </option>
          ))}
        </select>
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="CORRESPONSAVEL">Corresponsável</option>
          <option value="RESPONSAVEL">Responsável</option>
        </select>
        <button type="button" onClick={adicionar}>
          Adicionar
        </button>
      </div>
      {msg && <small>{msg}</small>}
    </section>
  );
}

/** Extrai a mensagem de erro do backend (ex.: 409 RN-OBR-10). */
async function mensagemErro(r: Response): Promise<string> {
  try {
    const corpo = (await r.json()) as { message?: string | string[] };
    const m = corpo?.message;
    if (Array.isArray(m)) return m.join(", ");
    if (typeof m === "string") return m;
  } catch {
    /* corpo nao-JSON */
  }
  return `Erro ${r.status}`;
}
