"use client";

import { useEffect, useState } from "react";

interface Setor {
  id: string;
  nome: string;
  ativo: boolean;
}

/**
 * Gestao de setores aninhada na tela do orgao (E1-06 / RN-IDE-03): lista,
 * cria e ativa/desativa setores do orgao via /api/proxy/orgaos/:id/setores.
 *
 * `embutido`: quando o painel ja e aberto/fechado por fora (linha expansivel
 * da tabela de orgaos), renderiza o conteudo direto, sem o proprio toggle.
 */
export function OrgaoSetores({
  orgaoId,
  embutido = false,
}: {
  orgaoId: string;
  embutido?: boolean;
}) {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [nome, setNome] = useState("");
  const [abertoEstado, setAberto] = useState(false);
  const aberto = embutido || abertoEstado;
  const [erro, setErro] = useState<string | null>(null);
  const [v, setV] = useState(0);

  const base = `/api/proxy/orgaos/${orgaoId}/setores`;

  useEffect(() => {
    if (!aberto) return;
    let vivo = true;
    fetch(base, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => vivo && setSetores(d))
      .catch(() => vivo && setSetores([]));
    return () => {
      vivo = false;
    };
  }, [base, aberto, v]);

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (!nome.trim()) {
      setErro("Informe o nome do setor");
      return;
    }
    const r = await fetch(base, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nome }),
    });
    if (!r.ok) {
      setErro(`Falha ao criar setor (HTTP ${r.status})`);
      return;
    }
    setNome("");
    setV((n) => n + 1);
  }

  async function alternarAtivo(s: Setor) {
    setErro(null);
    const r = await fetch(`${base}/${s.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ativo: !s.ativo }),
    });
    if (!r.ok) {
      setErro(`Falha ao atualizar setor (HTTP ${r.status})`);
      return;
    }
    setV((n) => n + 1);
  }

  return (
    <div style={embutido ? undefined : { marginTop: 6 }}>
      {!embutido && (
        <button type="button" onClick={() => setAberto((a) => !a)}>
          {aberto ? "▾ Setores" : "▸ Setores"}
        </button>
      )}
      {aberto && (
        <div
          style={{
            marginTop: embutido ? 0 : 6,
            paddingLeft: embutido ? 0 : 12,
            borderLeft: embutido ? undefined : "2px solid #eee",
            display: "grid",
            gap: 6,
          }}
        >
          {setores.length === 0 && (
            <span style={{ color: "#888", fontSize: 13 }}>Nenhum setor.</span>
          )}
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {setores.map((s) => (
              <li
                key={s.id}
                style={{ display: "flex", gap: 8, alignItems: "center" }}
              >
                <span style={{ flex: 1, opacity: s.ativo ? 1 : 0.5 }}>
                  {s.nome}
                  {!s.ativo && " (inativo)"}
                </span>
                <button type="button" onClick={() => alternarAtivo(s)}>
                  {s.ativo ? "Desativar" : "Ativar"}
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={criar} style={{ display: "flex", gap: 6 }}>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Novo setor"
              required
              style={{ flex: 1 }}
            />
            <button type="submit">Adicionar</button>
          </form>
          {erro && <p style={{ color: "crimson", margin: 0 }}>{erro}</p>}
        </div>
      )}
    </div>
  );
}
