"use client";

import { useState } from "react";
import {
  atualizarEstagio,
  construirPayloadEstagio,
  criarEstagio,
  ErroApi,
  MODOS_DURACAO_ESTAGIO,
  type Estagio,
  type FormularioEstagio,
} from "@/lib/api/cronograma";

function mensagemErro(e: unknown): string {
  if (e instanceof ErroApi) {
    const corpo = e.corpo as { message?: string | string[] };
    const msg = Array.isArray(corpo?.message)
      ? corpo.message.join(", ")
      : corpo?.message;
    return `Erro ${e.status}: ${msg ?? "falha"}`;
  }
  return "Falha de rede ao salvar";
}

const campo: React.CSSProperties = { display: "grid", gap: 2, fontSize: 14 };

export function EstagioForm({
  obraId,
  modo,
  estagio,
  estagioPaiId,
  precedentesDisponiveis,
  onSalvo,
  onCancelar,
}: {
  obraId: string;
  modo: "criar" | "editar";
  estagio?: Estagio;
  estagioPaiId?: string | null;
  precedentesDisponiveis: Estagio[];
  onSalvo: () => void;
  onCancelar: () => void;
}) {
  const [form, setForm] = useState<FormularioEstagio>({
    descricao: estagio?.descricao ?? "",
    ativo: estagio?.ativo ?? true,
    modoDuracao: estagio?.modoDuracao ?? "NAO_INFORMADO",
    dataInicio: estagio?.dataInicio ?? "",
    dataPrazo: estagio?.dataPrazo ?? "",
    totalDias: estagio?.totalDias != null ? String(estagio.totalDias) : "",
    estagioPrecedenteId: estagio?.estagioPrecedenteId ?? "",
    responsavelUsuarioId: estagio?.responsavelUsuarioId ?? "",
    latitude: estagio?.latitude ?? "",
    longitude: estagio?.longitude ?? "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const set = (k: keyof FormularioEstagio, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const diasCorridos = form.modoDuracao === "DIAS_CORRIDOS";

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (form.latitude?.trim()) {
      const lat = Number(form.latitude);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        setErro("Latitude deve estar entre -90 e 90");
        return;
      }
    }
    if (form.longitude?.trim()) {
      const lng = Number(form.longitude);
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        setErro("Longitude deve estar entre -180 e 180");
        return;
      }
    }
    if (diasCorridos) {
      const temDias = !!form.totalDias?.trim();
      const temInicio = !!form.dataInicio?.trim();
      const temPrazo = !!form.dataPrazo?.trim();
      if (!temPrazo && !(temInicio && temDias)) {
        setErro("Informe inicio + total de dias ou um prazo");
        return;
      }
    }
    setEnviando(true);
    try {
      const payload = construirPayloadEstagio({
        ...form,
        estagioPaiId: estagioPaiId ?? undefined,
      });
      if (modo === "criar") {
        await criarEstagio(obraId, payload);
      } else if (estagio) {
        await atualizarEstagio(obraId, estagio.id, payload);
      }
      onSalvo();
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      style={{
        display: "grid",
        gap: 8,
        maxWidth: 520,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 6,
        background: "#fafafa",
      }}
    >
      <strong>
        {modo === "criar"
          ? estagioPaiId
            ? "Nova subatividade"
            : "Nova etapa"
          : `Editar: ${estagio?.descricao}`}
      </strong>

      <label style={campo}>
        Descricao
        <input
          value={form.descricao}
          onChange={(e) => set("descricao", e.target.value)}
          required
        />
      </label>

      <label style={{ ...campo, gridAutoFlow: "column", justifyContent: "start", gap: 6, alignItems: "center" }}>
        <input
          type="checkbox"
          checked={form.ativo ?? true}
          onChange={(e) => set("ativo", e.target.checked)}
        />
        Ativo (entra na visao &quot;Ativas&quot; e no estagio atual)
      </label>

      <label style={campo}>
        Modo de duracao
        <select
          value={form.modoDuracao}
          onChange={(e) => set("modoDuracao", e.target.value)}
        >
          {MODOS_DURACAO_ESTAGIO.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </label>

      {diasCorridos && (
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <label style={campo}>
            Inicio
            <input
              type="date"
              value={form.dataInicio}
              onChange={(e) => set("dataInicio", e.target.value)}
            />
          </label>
          <label style={campo}>
            Total de dias
            <input
              type="number"
              min={1}
              value={form.totalDias}
              onChange={(e) => set("totalDias", e.target.value)}
              placeholder="ou prazo"
            />
          </label>
          <label style={campo}>
            Prazo
            <input
              type="date"
              value={form.dataPrazo}
              onChange={(e) => set("dataPrazo", e.target.value)}
              disabled={!!form.totalDias}
            />
          </label>
        </div>
      )}

      <label style={campo}>
        Estagio precedente
        <select
          value={form.estagioPrecedenteId}
          onChange={(e) => set("estagioPrecedenteId", e.target.value)}
        >
          <option value="">(nenhum)</option>
          {precedentesDisponiveis
            .filter((p) => p.id !== estagio?.id)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.descricao}
              </option>
            ))}
        </select>
      </label>

      <label style={campo}>
        Responsavel (usuario id) — vazio = voce
        <input
          value={form.responsavelUsuarioId}
          onChange={(e) => set("responsavelUsuarioId", e.target.value)}
          placeholder="uuid do responsavel"
        />
      </label>

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
        <label style={campo}>
          Latitude
          <input
            type="number"
            min={-90}
            max={90}
            step="any"
            value={form.latitude}
            onChange={(e) => set("latitude", e.target.value)}
          />
        </label>
        <label style={campo}>
          Longitude
          <input
            type="number"
            min={-180}
            max={180}
            step="any"
            value={form.longitude}
            onChange={(e) => set("longitude", e.target.value)}
          />
        </label>
      </div>

      {erro && <p style={{ color: "crimson", margin: 0 }}>{erro}</p>}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar"}
        </button>
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
