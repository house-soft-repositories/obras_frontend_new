"use client";

import { useState } from "react";
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
      style={{
        display: "grid",
        gap: 8,
        maxWidth: 420,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 6,
        marginTop: 8,
      }}
    >
      <h4>Registrar reinicio</h4>
      <label style={lbl}>
        Data de reinicio
        <input
          type="date"
          value={form.dataReinicio}
          disabled={desabilitado.dataReinicio}
          onChange={(e) => set("dataReinicio", e.target.value)}
        />
      </label>
      <label style={lbl}>
        ou Dias parados
        <input
          type="number"
          value={form.diasParados}
          disabled={desabilitado.diasParados}
          onChange={(e) => set("diasParados", e.target.value)}
        />
      </label>
      <label style={lbl}>
        Termo de retomada (id do arquivo) *
        <input
          value={form.termoRetomadaArquivoId}
          onChange={(e) => set("termoRetomadaArquivoId", e.target.value)}
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
          {salvando ? "Salvando..." : "Registrar reinicio"}
        </button>
        <button type="button" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

const lbl: React.CSSProperties = { display: "grid", gap: 4 };
