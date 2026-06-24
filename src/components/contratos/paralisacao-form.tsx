"use client";

import { useState } from "react";
import {
  criarParalisacao,
  ErroApi,
  validarParalisacao,
  type FormularioParalisacao,
} from "@/lib/api/contratos";

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

const VAZIO: FormularioParalisacao = {
  dataParalisacao: "",
  motivo: "",
  termoParalisacaoArquivoId: "",
};

/**
 * Formulario de Paralisacao (RN-CON-11): exige data, motivo e o termo
 * (termo_paralisacao_arquivo_id). Sem termo, o envio e bloqueado no front.
 */
export function ParalisacaoForm({
  contratoId,
  onSalvo,
  onCancelar,
}: {
  contratoId: string;
  onSalvo: () => void;
  onCancelar: () => void;
}) {
  const [form, setForm] = useState<FormularioParalisacao>(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  function set<K extends keyof FormularioParalisacao>(
    chave: K,
    valor: FormularioParalisacao[K],
  ) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const problemas = validarParalisacao(form);
    setErros(problemas);
    if (problemas.length > 0) return;
    setSalvando(true);
    try {
      await criarParalisacao(contratoId, {
        dataParalisacao: form.dataParalisacao,
        motivo: form.motivo.trim(),
        termoParalisacaoArquivoId: form.termoParalisacaoArquivoId.trim(),
      });
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
      aria-label="formulario-paralisacao"
      style={{
        display: "grid",
        gap: 8,
        maxWidth: 480,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 6,
      }}
    >
      <h3>Registrar paralisacao</h3>
      <label style={lbl}>
        Data da paralisacao *
        <input
          type="date"
          value={form.dataParalisacao}
          onChange={(e) => set("dataParalisacao", e.target.value)}
        />
      </label>
      <label style={lbl}>
        Motivo *
        <textarea
          rows={2}
          value={form.motivo}
          onChange={(e) => set("motivo", e.target.value)}
        />
      </label>
      <label style={lbl}>
        Termo de paralisacao (id do arquivo) *
        <input
          value={form.termoParalisacaoArquivoId}
          onChange={(e) => set("termoParalisacaoArquivoId", e.target.value)}
          placeholder="id do termo anexado"
        />
      </label>
      {erros.length > 0 && (
        <ul role="alert" style={{ color: "crimson", margin: 0 }}>
          {erros.map((er) => (
            <li key={er}>{er}</li>
          ))}
        </ul>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={salvando}>
          {salvando ? "Salvando..." : "Registrar"}
        </button>
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

const lbl: React.CSSProperties = { display: "grid", gap: 4 };
