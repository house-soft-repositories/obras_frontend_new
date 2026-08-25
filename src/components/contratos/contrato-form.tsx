"use client";

import { useState } from "react";
import formulario from "@/components/comum/formulario.module.css";
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
    <form onSubmit={enviar} aria-label="formulario-contrato">
      <div className={formulario.grade}>
        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>Número do contrato *</span>
          <input
            required
            value={form.numero}
            onChange={(e) => set("numero", e.target.value)}
          />
        </label>

        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>Empresa contratada *</span>
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

        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>Data de assinatura</span>
          <input
            type="date"
            value={form.dataAssinatura ?? ""}
            onChange={(e) => set("dataAssinatura", e.target.value)}
          />
        </label>

        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>Fim de vigência</span>
          <input
            type="date"
            value={form.fimVigencia ?? ""}
            onChange={(e) => set("fimVigencia", e.target.value)}
          />
        </label>

        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>Data da O.S. *</span>
          <input
            required
            type="date"
            value={form.dataOs}
            onChange={(e) => set("dataOs", e.target.value)}
          />
        </label>

        <div className={formulario.bloco}>
          <h4 className={formulario.blocoTitulo}>Prazo de execução</h4>
          <label className={formulario.campo}>
            <span className={formulario.campoRotulo}>Forma</span>
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
            <label className={formulario.campo}>
              <span className={formulario.campoRotulo}>Prazo em dias *</span>
              <input
                type="number"
                min={1}
                value={form.prazoExecucaoDias ?? ""}
                onChange={(e) => set("prazoExecucaoDias", e.target.value)}
              />
            </label>
          ) : (
            <label className={formulario.campo}>
              <span className={formulario.campoRotulo}>Data do prazo *</span>
              <input
                type="date"
                value={form.prazoExecucaoData ?? ""}
                onChange={(e) => set("prazoExecucaoData", e.target.value)}
              />
            </label>
          )}
        </div>

        <label className={`${formulario.campo} ${formulario.campoLargo}`}>
          <span className={formulario.campoRotulo}>Objeto</span>
          <textarea
            rows={2}
            value={form.objeto ?? ""}
            onChange={(e) => set("objeto", e.target.value)}
          />
        </label>

        <div className={formulario.campoLargo}>
          <FontesEditor
            fontes={form.fontes}
            opcoesFonte={opcoesFonte}
            onChange={(fontes) => set("fontes", fontes)}
          />
        </div>
      </div>

      {erros.length > 0 && (
        <ul role="alert" className={formulario.erros}>
          {erros.map((er) => (
            <li key={er}>{er}</li>
          ))}
        </ul>
      )}

      <div className={formulario.rodape}>
        <button type="submit" className="btn-primario" disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar contrato"}
        </button>
      </div>
    </form>
  );
}
