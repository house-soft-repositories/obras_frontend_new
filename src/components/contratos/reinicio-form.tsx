"use client";

import { useState } from "react";
import formulario from "@/components/comum/formulario.module.css";
import {
  campoReinicioDesabilitado,
  ErroApi,
  registrarReinicio,
  validarReinicio,
  type FormularioReinicio,
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

const VAZIO: FormularioReinicio = {
  dataReinicio: "",
  diasParados: "",
  termoRetomadaArquivoId: "",
};

/**
 * Formulario de Reinicio (RN-CON-12): informa data_reinicio OU dias_parados — um
 * deles deriva o outro no backend. Preencher um desabilita o outro no front.
 */
export function ReinicioForm({
  contratoId,
  paralisacaoId,
  onSalvo,
  onCancelar,
}: {
  contratoId: string;
  paralisacaoId: string;
  onSalvo: () => void;
  onCancelar: () => void;
}) {
  const [form, setForm] = useState<FormularioReinicio>(VAZIO);
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  function set<K extends keyof FormularioReinicio>(
    chave: K,
    valor: FormularioReinicio[K],
  ) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  const desabilitado = campoReinicioDesabilitado(form);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const problemas = validarReinicio(form);
    setErros(problemas);
    if (problemas.length > 0) return;
    setSalvando(true);
    try {
      await registrarReinicio(contratoId, paralisacaoId, {
        termoRetomadaArquivoId: form.termoRetomadaArquivoId.trim(),
        ...(form.dataReinicio ? { dataReinicio: form.dataReinicio } : {}),
        ...(form.diasParados ? { diasParados: Number(form.diasParados) } : {}),
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
      aria-label="formulario-reinicio"
      className={formulario.cartao}
      style={{ marginTop: "0.8rem" }}
    >
      <h4 className={formulario.titulo}>Registrar reinício</h4>

      <div className={formulario.grade}>
        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>Data de reinício</span>
          <input
            type="date"
            value={form.dataReinicio}
            disabled={desabilitado.dataReinicio}
            onChange={(e) => set("dataReinicio", e.target.value)}
          />
        </label>

        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>ou Dias parados</span>
          <input
            type="number"
            min={1}
            value={form.diasParados}
            disabled={desabilitado.diasParados}
            onChange={(e) => set("diasParados", e.target.value)}
          />
        </label>

        <label className={`${formulario.campo} ${formulario.campoLargo}`}>
          <span className={formulario.campoRotulo}>
            Termo de retomada (id do arquivo) *
          </span>
          <input
            value={form.termoRetomadaArquivoId}
            onChange={(e) => set("termoRetomadaArquivoId", e.target.value)}
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
          {salvando ? "Salvando..." : "Registrar reinício"}
        </button>
      </div>
    </form>
  );
}
