"use client";

import { useState } from "react";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import {
  aditivoMostraFontes,
  aditivoMostraPrazo,
  aditivoMostraVigencia,
  aditivoSomenteBasico,
  construirPayloadAditivo,
  criarAditivo,
  ErroApi,
  TIPOS_ADITIVO,
  TIPOS_PRAZO_EXECUCAO,
  validarAditivo,
  type FormularioAditivo,
  type TipoAditivo,
} from "@/lib/api/contratos";
import { FontesEditor } from "./fontes-editor";

function mensagemErro(e: unknown): string {
  if (e instanceof ErroApi) {
    const corpo = e.corpo as { message?: string | string[] };
    const msg = Array.isArray(corpo?.message)
      ? corpo.message.join(", ")
      : corpo?.message;
    return `Erro ${e.status}: ${msg ?? "falha"}`;
  }
  return "Falha de rede";
}

const VAZIO: FormularioAditivo = {
  numero: "",
  tipo: "PRAZO",
  tipoPrazoExecucao: "DIAS",
  fontes: [{ fonteId: "", valor: "" }],
};

/**
 * Formulario de Aditivo com campos condicionais por TipoAditivo (RN-CON-06/07) e
 * alerta nao bloqueante de lacuna (RN-CON-08) devolvido pelo backend.
 */
export function AditivoForm({
  contratoId,
  opcoesFonte,
  onSalvo,
  onCancelar,
}: {
  contratoId: string;
  opcoesFonte: OpcaoSelect[];
  onSalvo: () => void;
  onCancelar: () => void;
}) {
  const [form, setForm] = useState<FormularioAditivo>(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [alerta, setAlerta] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function set<K extends keyof FormularioAditivo>(
    chave: K,
    valor: FormularioAditivo[K],
  ) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setAlerta(null);
    const problemas = validarAditivo(form);
    setErros(problemas);
    if (problemas.length > 0) return;
    setSalvando(true);
    try {
      const r = await criarAditivo(contratoId, construirPayloadAditivo(form));
      if (r.alerta) {
        // RN-CON-08: alerta nao bloqueante — exibe, mas o lancamento ocorreu.
        setAlerta(r.alerta);
      }
      onSalvo();
    } catch (err) {
      setErros([mensagemErro(err)]);
    } finally {
      setSalvando(false);
    }
  }

  const tipo: TipoAditivo = form.tipo;

  return (
    <form
      onSubmit={enviar}
      aria-label="formulario-aditivo"
      style={{
        display: "grid",
        gap: 8,
        maxWidth: 520,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 6,
      }}
    >
      <h3>Novo aditivo</h3>

      <label style={lbl}>
        Numero *
        <input
          required
          value={form.numero}
          onChange={(e) => set("numero", e.target.value)}
        />
      </label>

      <label style={lbl}>
        Tipo *
        <select
          value={tipo}
          onChange={(e) => set("tipo", e.target.value as TipoAditivo)}
        >
          {TIPOS_ADITIVO.map((t) => (
            <option key={t.chave} value={t.chave}>
              {t.titulo}
            </option>
          ))}
        </select>
      </label>

      <label style={lbl}>
        Data de assinatura
        <input
          type="date"
          value={form.dataAssinatura ?? ""}
          onChange={(e) => set("dataAssinatura", e.target.value)}
        />
      </label>

      {/* PRAZO / PRAZO_E_VALOR: prazo de execucao aditivado (dias ou data). */}
      {aditivoMostraPrazo(tipo) && (
        <fieldset style={fs}>
          <legend>Prazo de execucao aditivado</legend>
          <label style={lbl}>
            Forma
            <select
              value={form.tipoPrazoExecucao ?? "DIAS"}
              onChange={(e) =>
                set(
                  "tipoPrazoExecucao",
                  e.target.value as FormularioAditivo["tipoPrazoExecucao"],
                )
              }
            >
              {TIPOS_PRAZO_EXECUCAO.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          {form.tipoPrazoExecucao === "DIAS" ? (
            <label style={lbl}>
              Dias
              <input
                type="number"
                value={form.prazoExecucaoDias ?? ""}
                onChange={(e) => set("prazoExecucaoDias", e.target.value)}
              />
            </label>
          ) : (
            <label style={lbl}>
              Data
              <input
                type="date"
                value={form.prazoExecucaoData ?? ""}
                onChange={(e) => set("prazoExecucaoData", e.target.value)}
              />
            </label>
          )}
        </fieldset>
      )}

      {/* Vigencia aditivada (dias ou data) — exceto OUTROS. */}
      {aditivoMostraVigencia(tipo) && (
        <fieldset style={fs}>
          <legend>Vigencia aditivada (opcional)</legend>
          <label style={lbl}>
            Dias de vigencia
            <input
              type="number"
              value={form.vigenciaDias ?? ""}
              onChange={(e) => set("vigenciaDias", e.target.value)}
            />
          </label>
          <label style={lbl}>
            ou nova data de vigencia
            <input
              type="date"
              value={form.vigenciaAditivada ?? ""}
              onChange={(e) => set("vigenciaAditivada", e.target.value)}
            />
          </label>
        </fieldset>
      )}

      {/* VALOR / PRAZO_E_VALOR / FONTE: N pares fonte+valor. */}
      {aditivoMostraFontes(tipo) && (
        <FontesEditor
          fontes={form.fontes}
          opcoesFonte={opcoesFonte}
          onChange={(fontes) => set("fontes", fontes)}
        />
      )}

      <label style={lbl}>
        Observacoes{aditivoSomenteBasico(tipo) ? " *" : ""}
        <textarea
          value={form.observacoes ?? ""}
          onChange={(e) => set("observacoes", e.target.value)}
          rows={2}
        />
      </label>

      {alerta && (
        <p role="status" style={{ color: "#a60", fontWeight: 600 }}>
          Atencao: {alerta}
        </p>
      )}
      {erros.length > 0 && (
        <ul role="alert" style={{ color: "crimson", margin: 0 }}>
          {erros.map((er) => (
            <li key={er}>{er}</li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar aditivo"}
        </button>
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

const lbl: React.CSSProperties = { display: "grid", gap: 4 };
const fs: React.CSSProperties = {
  border: "1px solid #eee",
  borderRadius: 6,
  display: "grid",
  gap: 6,
};
