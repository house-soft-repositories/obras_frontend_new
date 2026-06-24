"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { excluirObra, STATUS_OBRA, TIPOS_OBRA } from "@/lib/api/obras";
import {
  aplicarFiltro,
  type FiltrosObras,
} from "@/lib/api/obras-listagem";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import { DuplicarObraModal } from "@/components/obras/duplicar-obra-modal";

export interface ObraLinha {
  id: string;
  nome: string;
  tipo: string;
  status: string;
  prioritaria: boolean;
}

export interface ObrasListagemProps {
  itens: ObraLinha[];
  total: number;
  filtros: FiltrosObras;
  opcoes: { orgaos: OpcaoSelect[]; eixos: OpcaoSelect[]; tipologias: OpcaoSelect[] };
}

export function ObrasListagem({
  itens,
  total,
  filtros,
  opcoes,
}: ObrasListagemProps) {
  const router = useRouter();
  const [duplicar, setDuplicar] = useState<ObraLinha | null>(null);

  function mudar(chave: keyof FiltrosObras, valor: string) {
    router.push(`/obras?${aplicarFiltro(filtros, chave, valor)}`);
  }

  async function remover(id: string) {
    if (!confirm("Excluir esta obra?")) return;
    await excluirObra(id);
    router.refresh();
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p className="page-sub" style={{ margin: 0 }}>
          {total} obra(s) cadastrada(s)
        </p>
        <Link
          href="/obras/nova"
          className="btn-primario"
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "1rem" }}>＋</span> Nova obra
        </Link>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Buscar..."
          defaultValue={filtros.busca ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") mudar("busca", e.currentTarget.value);
          }}
        />
        <select
          value={filtros.status ?? ""}
          onChange={(e) => mudar("status", e.target.value)}
        >
          <option value="">status: todos</option>
          {STATUS_OBRA.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          value={filtros.tipo ?? ""}
          onChange={(e) => mudar("tipo", e.target.value)}
        >
          <option value="">tipo: todos</option>
          {TIPOS_OBRA.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          value={filtros.orgaoId ?? ""}
          onChange={(e) => mudar("orgaoId", e.target.value)}
        >
          <option value="">orgao: todos</option>
          {opcoes.orgaos.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
        <select
          value={filtros.eixoId ?? ""}
          onChange={(e) => mudar("eixoId", e.target.value)}
        >
          <option value="">eixo: todos</option>
          {opcoes.eixos.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
        <select
          value={filtros.tipologiaId ?? ""}
          onChange={(e) => mudar("tipologiaId", e.target.value)}
        >
          <option value="">tipologia: todas</option>
          {opcoes.tipologias.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
        <input
          placeholder="tag"
          defaultValue={filtros.tag ?? ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") mudar("tag", e.currentTarget.value);
          }}
        />
        <select
          value={filtros.acaoConveniada ?? ""}
          onChange={(e) => mudar("acaoConveniada", e.target.value)}
        >
          <option value="">conveniada: todas</option>
          <option value="NAO">NAO</option>
          <option value="FEDERAL">FEDERAL</option>
          <option value="ESTADUAL">ESTADUAL</option>
        </select>
        <label>
          <input
            type="checkbox"
            checked={filtros.prioritaria === "true"}
            onChange={(e) => mudar("prioritaria", e.target.checked ? "true" : "")}
          />{" "}
          prioritarias
        </label>
      </div>

      <div
        style={{
          background: "var(--cor-superficie)",
          border: "1px solid var(--cor-borda)",
          borderRadius: "var(--raio)",
          overflow: "hidden",
        }}
      >
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Acoes</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((o) => (
              <tr key={o.id}>
                <td style={{ fontWeight: 600 }}>
                  {o.prioritaria ? (
                    <span title="Prioritaria" style={{ color: "var(--sem-amarelo)" }}>
                      ★{" "}
                    </span>
                  ) : null}
                  {o.nome}
                </td>
                <td style={{ color: "var(--cor-texto-fraco)" }}>{o.tipo}</td>
                <td>
                  <span className={`chip ${chipDeStatus(o.status)}`}>
                    {rotuloStatus(o.status)}
                  </span>
                </td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <Link href={`/obras/${o.id}/editar`}>Detalhar</Link>{" "}
                  <button type="button" onClick={() => setDuplicar(o)}>
                    Duplicar
                  </button>{" "}
                  <button type="button" onClick={() => remover(o.id)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {duplicar && (
        <DuplicarObraModal
          obraId={duplicar.id}
          nomeOrigem={duplicar.nome}
          aoFechar={() => setDuplicar(null)}
        />
      )}
    </div>
  );
}

/** Mapeia o status da obra para a cor do chip (RN visual do design). */
function chipDeStatus(status: string): string {
  if (status === "CONCLUIDO") return "chip-verde";
  if (status === "PARALISADO") return "chip-vermelho";
  if (status === "EM_DESENVOLVIMENTO") return "chip-azul";
  return "chip-cinza";
}

/** Rotulo legivel (EM_DESENVOLVIMENTO -> "Em desenvolvimento"). */
function rotuloStatus(status: string): string {
  const t = status.replace(/_/g, " ").toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
}
