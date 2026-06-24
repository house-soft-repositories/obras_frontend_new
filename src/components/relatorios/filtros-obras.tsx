"use client";

import type { FiltroObras } from "@/lib/api/relatorios";

const STATUS = ["EM_ABERTO", "EM_DESENVOLVIMENTO", "CONCLUIDO", "PARALISADO", "CANCELADO"];

/**
 * Painel de filtros combinados (RN-REL-06..12). Cobre os 6 grupos do FiltroObras;
 * cada mudanca chama onChange (a pagina sincroniza com a URL).
 */
export function FiltrosObras({
  filtro,
  onChange,
}: {
  filtro: FiltroObras;
  onChange: (f: FiltroObras) => void;
}) {
  function set<K extends keyof FiltroObras>(campo: K, valor: FiltroObras[K]) {
    onChange({ ...filtro, [campo]: valor });
  }
  function toggleStatus(s: string) {
    const atual = filtro.statusObra ?? [];
    set("statusObra", atual.includes(s) ? atual.filter((x) => x !== s) : [...atual, s]);
  }

  return (
    <div style={{ display: "grid", gap: 8, border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input
          placeholder="Busca por nome (8.4.6)"
          value={filtro.buscaTextual ?? ""}
          onChange={(e) => set("buscaTextual", e.target.value)}
        />
        <input
          placeholder="Empresa executora (8.4.1)"
          value={filtro.empresaExecutora ?? ""}
          onChange={(e) => set("empresaExecutora", e.target.value)}
        />
        <input
          placeholder="Numero do contrato (8.4.1)"
          value={filtro.numeroContrato ?? ""}
          onChange={(e) => set("numeroContrato", e.target.value)}
        />
        <input
          placeholder="Responsavel (8.4.3)"
          value={filtro.responsavel ?? ""}
          onChange={(e) => set("responsavel", e.target.value)}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input
            type="checkbox"
            checked={filtro.prioritaria === "true"}
            onChange={(e) => set("prioritaria", e.target.checked ? "true" : undefined)}
          />
          Prioritaria
        </label>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#666" }}>Status (8.4.4):</span>
        {STATUS.map((s) => (
          <label key={s} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={(filtro.statusObra ?? []).includes(s)}
              onChange={() => toggleStatus(s)}
            />
            {s}
          </label>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#666" }}>% (8.4.4):</span>
        <input
          type="number" placeholder="min" style={{ width: 70 }}
          value={filtro.percentualMin ?? ""}
          onChange={(e) => set("percentualMin", e.target.value || undefined)}
        />
        <input
          type="number" placeholder="max" style={{ width: 70 }}
          value={filtro.percentualMax ?? ""}
          onChange={(e) => set("percentualMax", e.target.value || undefined)}
        />
        <span style={{ fontSize: 12, color: "#666" }}>Criada (8.4.5):</span>
        <input
          type="date"
          value={filtro.dataCriacaoDe ?? ""}
          onChange={(e) => set("dataCriacaoDe", e.target.value || undefined)}
        />
        <input
          type="date"
          value={filtro.dataCriacaoAte ?? ""}
          onChange={(e) => set("dataCriacaoAte", e.target.value || undefined)}
        />
      </div>
    </div>
  );
}
