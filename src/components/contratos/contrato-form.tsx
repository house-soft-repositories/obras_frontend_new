"use client";

import { useState } from "react";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import {
  atualizarContrato,
  construirPayloadContrato,
  criarContrato,
  ErroApi,
  TIPOS_PRAZO_EXECUCAO,
  validarContrato,
  type Contrato,
  type FormularioContrato,
  type TipoPrazoExecucao,
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

function paraForm(c: Contrato): FormularioContrato {
  return {
    empresaContratadaId: c.empresaContratadaId,
    numero: c.numero,
    objeto: c.objeto ?? "",
    dataAssinatura: c.dataAssinatura ?? "",
    fimVigencia: c.fimVigencia ?? "",
    dataOs: c.dataOs,
    tipoPrazoExecucao: c.tipoPrazoExecucao,
    prazoExecucaoDias:
      c.prazoExecucaoDias != null ? String(c.prazoExecucaoDias) : "",
    prazoExecucaoData: c.prazoExecucaoData ?? "",
    fontes:
      c.fontes.length > 0
        ? c.fontes.map((f) => ({ fonteId: f.fonteId, valor: String(f.valor) }))
        : [{ fonteId: "", valor: "" }],
  };
}

const VAZIO: FormularioContrato = {
  empresaContratadaId: "",
  numero: "",
  objeto: "",
  dataAssinatura: "",
  fimVigencia: "",
  dataOs: "",
  tipoPrazoExecucao: "DIAS",
  prazoExecucaoDias: "",
  prazoExecucaoData: "",
  fontes: [{ fonteId: "", valor: "" }],
};

/**
 * Formulario do Contrato (RN-CON-03/04): alternancia DIAS/DATA do prazo de
 * execucao e lista dinamica de N pares fonte+valor com a soma exibida.
 */
export function ContratoForm({
  obraId,
  empresas,
  opcoesFonte,
  contratoExistente,
  onSalvo,
}: {
  obraId: string;
  empresas: OpcaoSelect[];
  opcoesFonte: OpcaoSelect[];
  contratoExistente?: Contrato | null;
  onSalvo: () => void;
}) {
  const [form, setForm] = useState<FormularioContrato>(
    contratoExistente ? paraForm(contratoExistente) : VAZIO,
  );
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  function set<K extends keyof FormularioContrato>(
    chave: K,
    valor: FormularioContrato[K],
  ) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const problemas = validarContrato(form);
    setErros(problemas);
    if (problemas.length > 0) return;
    setSalvando(true);
    try {
      const payload = construirPayloadContrato(obraId, form);
      if (contratoExistente) {
        // obraId nao vai no PATCH (contrato e 1:1 com a obra, imutavel).
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { obraId: _omit, ...patch } = payload;
        await atualizarContrato(contratoExistente.id, patch);
      } else {
        await criarContrato(payload);
      }
      onSalvo();
    } catch (err) {
      setErros([mensagemErro(err)]);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      aria-label="formulario-contrato"
      style={{ display: "grid", gap: 8, maxWidth: 560 }}
    >
      <h3>{contratoExistente ? "Editar contrato" : "Novo contrato"}</h3>

      <label style={lbl}>
        Numero *
        <input
          required
          value={form.numero}
          onChange={(e) => set("numero", e.target.value)}
        />
      </label>

      <label style={lbl}>
        Empresa contratada *
        <select
          required
          value={form.empresaContratadaId}
          onChange={(e) => set("empresaContratadaId", e.target.value)}
        >
          <option value="">— selecione —</option>
          {empresas.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.nome}
            </option>
          ))}
        </select>
      </label>

      <label style={lbl}>
        Objeto
        <textarea
          rows={2}
          value={form.objeto ?? ""}
          onChange={(e) => set("objeto", e.target.value)}
        />
      </label>

      <label style={lbl}>
        Data de assinatura
        <input
          type="date"
          value={form.dataAssinatura ?? ""}
          onChange={(e) => set("dataAssinatura", e.target.value)}
        />
      </label>

      <label style={lbl}>
        Fim de vigencia
        <input
          type="date"
          value={form.fimVigencia ?? ""}
          onChange={(e) => set("fimVigencia", e.target.value)}
        />
      </label>

      <label style={lbl}>
        Data da O.S. *
        <input
          required
          type="date"
          value={form.dataOs}
          onChange={(e) => set("dataOs", e.target.value)}
        />
      </label>

      <fieldset style={fs}>
        <legend>Prazo de execucao</legend>
        <label style={lbl}>
          Forma
          <select
            value={form.tipoPrazoExecucao}
            onChange={(e) =>
              set("tipoPrazoExecucao", e.target.value as TipoPrazoExecucao)
            }
          >
            {TIPOS_PRAZO_EXECUCAO.map((p) => (
              <option key={p} value={p}>
                {p === "DIAS" ? "Em dias" : "Por data"}
              </option>
            ))}
          </select>
        </label>
        {form.tipoPrazoExecucao === "DIAS" ? (
          <label style={lbl}>
            Prazo em dias *
            <input
              type="number"
              min={1}
              value={form.prazoExecucaoDias ?? ""}
              onChange={(e) => set("prazoExecucaoDias", e.target.value)}
            />
          </label>
        ) : (
          <label style={lbl}>
            Data do prazo *
            <input
              type="date"
              value={form.prazoExecucaoData ?? ""}
              onChange={(e) => set("prazoExecucaoData", e.target.value)}
            />
          </label>
        )}
      </fieldset>

      <FontesEditor
        fontes={form.fontes}
        opcoesFonte={opcoesFonte}
        onChange={(fontes) => set("fontes", fontes)}
      />

      {erros.length > 0 && (
        <ul role="alert" style={{ color: "crimson", margin: 0 }}>
          {erros.map((er) => (
            <li key={er}>{er}</li>
          ))}
        </ul>
      )}

      <button type="submit" disabled={salvando}>
        {salvando ? "Salvando..." : "Salvar contrato"}
      </button>
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
