"use client";

import { useEffect, useState } from "react";
import { rotuloEnum } from "@/lib/ui/obra-labels";

/** Helpers de proxy autenticado usados pelos paineis de guia (modo editar). */
async function get<T>(caminho: string): Promise<T> {
  const r = await fetch(`/api/proxy/${caminho}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function post(caminho: string, corpo: unknown): Promise<Response> {
  return fetch(`/api/proxy/${caminho}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(corpo),
  });
}

function useLista<T>(caminho: string, recarregar: number): T[] {
  const [itens, setItens] = useState<T[]>([]);
  useEffect(() => {
    let vivo = true;
    get<T[]>(caminho)
      .then((d) => vivo && setItens(d))
      .catch(() => vivo && setItens([]));
    return () => {
      vivo = false;
    };
  }, [caminho, recarregar]);
  return itens;
}

interface PainelProps {
  obraId: string;
}

export function PainelLocalizacao({ obraId }: PainelProps) {
  const [v, setV] = useState(0);
  const itens = useLista<{ id: string; localidade: string; uf: string }>(
    `obras/${obraId}/localizacoes`,
    v,
  );
  const [localidade, setLocalidade] = useState("");
  const [uf, setUf] = useState("");
  return (
    <section style={{ display: "grid", gap: 8 }}>
      <h3>Localização</h3>
      <ul>
        {itens.map((l) => (
          <li key={l.id}>
            {l.localidade} / {l.uf}
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Localidade"
          value={localidade}
          onChange={(e) => setLocalidade(e.target.value)}
        />
        <input
          placeholder="UF"
          maxLength={2}
          value={uf}
          onChange={(e) => setUf(e.target.value)}
        />
        <button
          type="button"
          onClick={async () => {
            await post(`obras/${obraId}/localizacoes`, { localidade, uf });
            setLocalidade("");
            setUf("");
            setV((n) => n + 1);
          }}
        >
          Adicionar
        </button>
      </div>
    </section>
  );
}

export function PainelTitularidade({ obraId }: PainelProps) {
  const [situacao, setSituacao] = useState("NAO_EXISTENTE");
  const [tipo, setTipo] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <section style={{ display: "grid", gap: 8 }}>
      <h3>Titularidade</h3>
      <select value={situacao} onChange={(e) => setSituacao(e.target.value)}>
        <option value="EXISTENTE">EXISTENTE</option>
        <option value="NAO_EXISTENTE">{rotuloEnum("NAO_EXISTENTE")}</option>
      </select>
      <input
        placeholder="Tipo (obrigatorio se EXISTENTE)"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
      />
      <button
        type="button"
        onClick={async () => {
          const r = await post(`obras/${obraId}/titularidade`, {
            situacao,
            tipo: tipo || undefined,
          });
          setMsg(r.ok ? "Salvo." : `Erro ${r.status}`);
        }}
      >
        Salvar
      </button>
      {msg && <small>{msg}</small>}
    </section>
  );
}

export function PainelLicenciamento({ obraId }: PainelProps) {
  const [v, setV] = useState(0);
  const itens = useLista<{ id: string; situacao: string; numero: string | null }>(
    `obras/${obraId}/licencas`,
    v,
  );
  const [situacao, setSituacao] = useState("NAO_EXISTENTE");
  const [tipo, setTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [validade, setValidade] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <section style={{ display: "grid", gap: 8 }}>
      <h3>Licenciamento</h3>
      <ul>
        {itens.map((l) => (
          <li key={l.id}>
            {rotuloEnum(l.situacao)} {l.numero ?? ""}
          </li>
        ))}
      </ul>
      <select value={situacao} onChange={(e) => setSituacao(e.target.value)}>
        <option value="EXISTENTE">EXISTENTE</option>
        <option value="NAO_EXISTENTE">{rotuloEnum("NAO_EXISTENTE")}</option>
      </select>
      <input placeholder="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} />
      <input
        placeholder="Numero"
        value={numero}
        onChange={(e) => setNumero(e.target.value)}
      />
      <input
        type="date"
        value={validade}
        onChange={(e) => setValidade(e.target.value)}
      />
      <button
        type="button"
        onClick={async () => {
          const r = await post(`obras/${obraId}/licencas`, {
            situacao,
            tipo: tipo || undefined,
            numero: numero || undefined,
            validade: validade || undefined,
          });
          if (r.ok) {
            setV((n) => n + 1);
            setMsg("Salvo.");
          } else {
            setMsg(`Erro ${r.status}`);
          }
        }}
      >
        Adicionar
      </button>
      {msg && <small>{msg}</small>}
    </section>
  );
}

export function PainelRecebimento({ obraId }: PainelProps) {
  const [v, setV] = useState(0);
  const itens = useLista<{ id: string; tipo: string; data: string | null }>(
    `obras/${obraId}/recebimentos`,
    v,
  );
  const [tipo, setTipo] = useState("PROVISORIO");
  const [data, setData] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <section style={{ display: "grid", gap: 8 }}>
      <h3>Recebimento</h3>
      <ul>
        {itens.map((r) => (
          <li key={r.id}>
            {r.tipo} {r.data ?? ""}
          </li>
        ))}
      </ul>
      <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="PROVISORIO">PROVISORIO</option>
        <option value="DEFINITIVO">DEFINITIVO</option>
        <option value="INAUGURACAO">INAUGURACAO</option>
      </select>
      <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
      <button
        type="button"
        onClick={async () => {
          const r = await post(`obras/${obraId}/recebimentos`, {
            tipo,
            data: data || undefined,
          });
          setMsg(r.ok ? "Salvo." : `Erro ${r.status} (recebimento ja existe?)`);
          if (r.ok) setV((n) => n + 1);
        }}
      >
        Adicionar
      </button>
      {msg && <small>{msg}</small>}
    </section>
  );
}
