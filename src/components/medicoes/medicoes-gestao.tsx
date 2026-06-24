"use client";

import { useState } from "react";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import { FontesEditor } from "@/components/contratos/fontes-editor";
import {
  construirPayloadMedicao,
  criarMedicao,
  excluirMedicao,
  formularioVazio,
  somarFontes,
  TIPOS_MEDICAO,
  validarMedicao,
  type FormularioMedicao,
  type Medicao,
} from "@/lib/api/medicoes";

function rotuloTipo(tipo: string): string {
  return TIPOS_MEDICAO.find((t) => t.chave === tipo)?.titulo ?? tipo;
}

function nomeOrgao(opcoes: OpcaoSelect[], id: string): string {
  return opcoes.find((o) => o.id === id)?.nome ?? id;
}

/**
 * Gestao de Medicoes da obra (E5-04): card "Valor Medido Total", tabela de
 * boletins (numero, data, tipo, orgao, valor total, observacoes), formulario de
 * criacao com N fontes (RN-CRO-20, total recalculado em tela) e exclusao com
 * confirmacao. Acoes de escrita ocultas para o perfil CONSULTA.
 */
export function MedicoesGestao({
  obraId,
  medicoesIniciais,
  opcoesFonte,
  opcoesOrgao,
  podeEditar,
}: {
  obraId: string;
  medicoesIniciais: Medicao[];
  opcoesFonte: OpcaoSelect[];
  opcoesOrgao: OpcaoSelect[];
  podeEditar: boolean;
}) {
  const [medicoes, setMedicoes] = useState<Medicao[]>(medicoesIniciais);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState<FormularioMedicao>(formularioVazio());
  const [erros, setErros] = useState<string[]>([]);
  const [salvando, setSalvando] = useState(false);

  const medidoTotal = medicoes
    .reduce((acc, m) => acc + Number(m.valorTotal), 0)
    .toFixed(2);

  function set<K extends keyof FormularioMedicao>(
    campo: K,
    valor: FormularioMedicao[K],
  ) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function recarregar() {
    const { listarMedicoes } = await import("@/lib/api/medicoes");
    setMedicoes(await listarMedicoes(obraId));
  }

  async function salvar() {
    const problemas = validarMedicao(form);
    setErros(problemas);
    if (problemas.length > 0) return;
    setSalvando(true);
    try {
      await criarMedicao(obraId, construirPayloadMedicao(form));
      setForm(formularioVazio());
      setCriando(false);
      await recarregar();
    } catch {
      setErros(["Falha ao salvar a medicao (numero NORMAL duplicado?)"]);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string) {
    if (!window.confirm("Excluir esta medicao?")) return;
    try {
      await excluirMedicao(obraId, id);
      await recarregar();
    } catch {
      setErros(["Falha ao excluir a medicao"]);
    }
  }

  return (
    <section style={{ display: "grid", gap: 24 }}>
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
          maxWidth: 320,
        }}
      >
        <div style={{ fontSize: 12, color: "#666" }}>Valor Medido Total</div>
        <div style={{ fontSize: 24, fontWeight: 600 }}>R$ {medidoTotal}</div>
      </div>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Boletins de medicao</h2>
          {podeEditar && !criando && (
            <button type="button" onClick={() => setCriando(true)}>
              + Nova medicao
            </button>
          )}
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>Numero</th>
              <th>Data</th>
              <th>Tipo</th>
              <th>Orgao</th>
              <th>Valor total</th>
              <th>Observacoes</th>
              {podeEditar && <th></th>}
            </tr>
          </thead>
          <tbody>
            {medicoes.length === 0 && (
              <tr>
                <td colSpan={podeEditar ? 7 : 6} style={{ color: "#888", padding: 8 }}>
                  Nenhuma medicao cadastrada.
                </td>
              </tr>
            )}
            {medicoes.map((m) => (
              <tr key={m.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td>{m.numero}</td>
                <td>{m.dataMedicao}</td>
                <td>{rotuloTipo(m.tipo)}</td>
                <td>{nomeOrgao(opcoesOrgao, m.orgaoId)}</td>
                <td>R$ {m.valorTotal}</td>
                <td>{m.observacoes ?? ""}</td>
                {podeEditar && (
                  <td>
                    <button type="button" onClick={() => remover(m.id)}>
                      excluir
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {podeEditar && criando && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void salvar();
          }}
          style={{ display: "grid", gap: 10, maxWidth: 560 }}
        >
          <h3 style={{ margin: 0 }}>Nova medicao</h3>
          {erros.length > 0 && (
            <ul style={{ color: "#b00", margin: 0 }}>
              {erros.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
          <label style={{ display: "grid", gap: 4 }}>
            Numero
            <input
              type="number"
              min={1}
              value={form.numero}
              onChange={(e) => set("numero", e.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            Data
            <input
              type="date"
              value={form.dataMedicao}
              onChange={(e) => set("dataMedicao", e.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            Tipo
            <select
              value={form.tipo}
              onChange={(e) =>
                set("tipo", e.target.value as FormularioMedicao["tipo"])
              }
            >
              {TIPOS_MEDICAO.map((t) => (
                <option key={t.chave} value={t.chave}>
                  {t.titulo}
                </option>
              ))}
            </select>
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            Orgao
            <select
              value={form.orgaoId}
              onChange={(e) => set("orgaoId", e.target.value)}
            >
              <option value="">— orgao —</option>
              {opcoesOrgao.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </label>
          <FontesEditor
            fontes={form.fontes}
            opcoesFonte={opcoesFonte}
            onChange={(fontes) => set("fontes", fontes)}
          />
          <div style={{ fontWeight: 600 }}>
            Total: R$ {somarFontes(form.fontes)}
          </div>
          <label style={{ display: "grid", gap: 4 }}>
            Observacoes
            <textarea
              value={form.observacoes ?? ""}
              onChange={(e) => set("observacoes", e.target.value)}
            />
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCriando(false);
                setErros([]);
                setForm(formularioVazio());
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
