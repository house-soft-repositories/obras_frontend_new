"use client";

import { useState } from "react";
import formulario from "@/components/comum/formulario.module.css";
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
      className={formulario.cartao}
    >
      <h3 className={formulario.titulo}>Registrar paralisação</h3>

      <div className={formulario.grade}>
        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>Data da paralisação *</span>
          <input
            type="date"
            value={form.dataParalisacao}
            onChange={(e) => set("dataParalisacao", e.target.value)}
          />
        </label>

        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>
            Termo de paralisação (id do arquivo) *
          </span>
          <input
            value={form.termoParalisacaoArquivoId}
            onChange={(e) => set("termoParalisacaoArquivoId", e.target.value)}
            placeholder="id do termo anexado"
          />
        </label>

        <label className={`${formulario.campo} ${formulario.campoLargo}`}>
          <span className={formulario.campoRotulo}>Motivo *</span>
          <textarea
            rows={2}
            value={form.motivo}
            onChange={(e) => set("motivo", e.target.value)}
          />
        </label>
      </div>

      {erros.length > 0 && (
        <ul role="alert" className={formulario.erros}>
          {erros.map((er) => (
            <li key={er}>{er}</li>
          ))}
        </ul>
      )}

      <div className={formulario.rodape}>
        <button type="button" className="btn-secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario" disabled={salvando}>
          {salvando ? "Salvando..." : "Registrar"}
        </button>
      </div>
    </form>
  );
}
