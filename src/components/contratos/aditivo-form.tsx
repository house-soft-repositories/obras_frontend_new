"use client";

import { useState } from "react";
import formulario from "@/components/comum/formulario.module.css";
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
      className={formulario.cartao}
    >
      <h3 className={formulario.titulo}>Novo aditivo</h3>

      <div className={formulario.grade}>
        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>Número *</span>
          <input
            required
            placeholder="01/2026"
            value={form.numero}
            onChange={(e) => set("numero", e.target.value)}
          />
        </label>

        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>Tipo *</span>
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

        <label className={formulario.campo}>
          <span className={formulario.campoRotulo}>Data de assinatura</span>
          <input
            type="date"
            value={form.dataAssinatura ?? ""}
            onChange={(e) => set("dataAssinatura", e.target.value)}
          />
        </label>

        {/* PRAZO / PRAZO_E_VALOR: prazo de execucao aditivado (dias ou data). */}
        {aditivoMostraPrazo(tipo) && (
          <div className={formulario.bloco}>
            <h4 className={formulario.blocoTitulo}>
              Prazo de execução aditivado
            </h4>
            <label className={formulario.campo}>
              <span className={formulario.campoRotulo}>Forma</span>
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
                    {p === "DIAS" ? "Em dias" : "Por data"}
                  </option>
                ))}
              </select>
            </label>
            {form.tipoPrazoExecucao === "DIAS" ? (
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Dias</span>
                <input
                  type="number"
                  min={1}
                  value={form.prazoExecucaoDias ?? ""}
                  onChange={(e) => set("prazoExecucaoDias", e.target.value)}
                />
              </label>
            ) : (
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Data</span>
                <input
                  type="date"
                  value={form.prazoExecucaoData ?? ""}
                  onChange={(e) => set("prazoExecucaoData", e.target.value)}
                />
              </label>
            )}
          </div>
        )}

        {/* Vigencia aditivada (dias ou data) — exceto OUTROS. */}
        {aditivoMostraVigencia(tipo) && (
          <div className={formulario.bloco}>
            <h4 className={formulario.blocoTitulo}>
              Vigência aditivada (opcional)
            </h4>
            <label className={formulario.campo}>
              <span className={formulario.campoRotulo}>Dias de vigência</span>
              <input
                type="number"
                min={1}
                value={form.vigenciaDias ?? ""}
                onChange={(e) => set("vigenciaDias", e.target.value)}
              />
            </label>
            <label className={formulario.campo}>
              <span className={formulario.campoRotulo}>
                ou nova data de vigência
              </span>
              <input
                type="date"
                value={form.vigenciaAditivada ?? ""}
                onChange={(e) => set("vigenciaAditivada", e.target.value)}
              />
            </label>
          </div>
        )}

        {/* VALOR / PRAZO_E_VALOR / FONTE: N pares fonte+valor. */}
        {aditivoMostraFontes(tipo) && (
          <div className={formulario.campoLargo}>
            <FontesEditor
              fontes={form.fontes}
              opcoesFonte={opcoesFonte}
              onChange={(fontes) => set("fontes", fontes)}
            />
          </div>
        )}

        <label className={`${formulario.campo} ${formulario.campoLargo}`}>
          <span className={formulario.campoRotulo}>
            Observações{aditivoSomenteBasico(tipo) ? " *" : ""}
          </span>
          <textarea
            value={form.observacoes ?? ""}
            onChange={(e) => set("observacoes", e.target.value)}
            rows={2}
          />
        </label>
      </div>

      {alerta && (
        <p role="status" className={formulario.alerta}>
          ⚠️ {alerta}
        </p>
      )}
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
          {salvando ? "Salvando..." : "Salvar aditivo"}
        </button>
      </div>
    </form>
  );
}
