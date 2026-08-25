"use client";

import { useState } from "react";
import formulario from "@/components/comum/formulario.module.css";
import { FontesEditor } from "@/components/contratos/fontes-editor";
import secoes from "@/components/obras/detalhe/secoes.module.css";
import type { OpcaoSelect } from "@/components/obras/obra-form";
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
import { formatarData } from "@/lib/ui/datas";
import { formatarMoeda } from "@/lib/ui/dinheiro";
import { chipTipoMedicao, resumoMedido } from "@/lib/ui/medicao-aba";

function nomeOrgao(opcoes: OpcaoSelect[], id: string): string {
  return opcoes.find((o) => o.id === id)?.nome ?? id;
}

/**
 * Gestao de Medicoes da obra (E5-04): card "Valor medido total" com percentual
 * sobre o total contratado, tabela de boletins (numero, data, tipo, orgao,
 * valor total, observacoes) com cards no mobile, formulario de criacao com N
 * fontes (RN-CRO-20, total recalculado em tela) e exclusao com confirmacao.
 * Acoes de escrita ocultas para o perfil CONSULTA.
 */
export function MedicoesGestao({
  obraId,
  medicoesIniciais,
  opcoesFonte,
  opcoesOrgao,
  percentualMedido,
  podeEditar,
}: {
  obraId: string;
  medicoesIniciais: Medicao[];
  opcoesFonte: OpcaoSelect[];
  opcoesOrgao: OpcaoSelect[];
  /** Percentual do medido sobre o total contratado (RN-FIN-08); null se ausente. */
  percentualMedido?: number | null;
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
      setErros(["Falha ao salvar a medição (número NORMAL duplicado?)"]);
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: string) {
    if (!window.confirm("Excluir esta medição?")) return;
    try {
      await excluirMedicao(obraId, id);
      await recarregar();
    } catch {
      setErros(["Falha ao excluir a medição"]);
    }
  }

  return (
    <section className={secoes.pilha}>
      {/* Valor medido total (RN-CRO-19/20) */}
      <div className={secoes.destaque}>
        <div className={secoes.destaqueRotulo}>Valor medido total</div>
        <div className={secoes.destaqueValor}>
          {formatarMoeda(medidoTotal, { vazio: "R$ 0,00" })}
        </div>
        <div className={secoes.destaqueSub}>
          {resumoMedido(medicoes.length, percentualMedido ?? null)}
        </div>
      </div>

      {erros.length > 0 && (
        <ul className={secoes.erros}>
          {erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className={secoes.secao}>
        <div className={secoes.secaoCabecalho}>
          <h2 className={secoes.secaoTitulo}>Boletins de medição</h2>
          {podeEditar && !criando && (
            <button
              type="button"
              className={`btn-primario ${secoes.secaoAcao}`}
              onClick={() => setCriando(true)}
            >
              ＋ Nova medição
            </button>
          )}
        </div>

        {medicoes.length === 0 ? (
          <p className={secoes.vazio}>Nenhuma medição cadastrada.</p>
        ) : (
          <>
            <div className={`${secoes.soDesktop} ${secoes.tabelaEnvolucro}`}>
              <table className={secoes.tabela}>
                <thead>
                  <tr>
                    <th>Nº</th>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Órgão</th>
                    <th>Valor total</th>
                    <th>Observações</th>
                    {podeEditar && <th />}
                  </tr>
                </thead>
                <tbody>
                  {medicoes.map((m) => {
                    const chip = chipTipoMedicao(m.tipo);
                    return (
                      <tr key={m.id}>
                        <td className={`${secoes.forte} ${secoes.num}`}>
                          {m.numero}
                        </td>
                        <td className={secoes.num}>
                          {formatarData(m.dataMedicao)}
                        </td>
                        <td>
                          <span className={`chip ${chip.classe}`}>
                            {chip.titulo}
                          </span>
                        </td>
                        <td>{nomeOrgao(opcoesOrgao, m.orgaoId)}</td>
                        <td className={`${secoes.forte} ${secoes.num}`}>
                          {formatarMoeda(m.valorTotal)}
                        </td>
                        <td>{m.observacoes ?? "—"}</td>
                        {podeEditar && (
                          <td className={secoes.direita}>
                            <button
                              type="button"
                              title="Excluir medição"
                              className={`${secoes.acaoIcone} ${secoes.acaoIconePerigo}`}
                              onClick={() => remover(m.id)}
                            >
                              ✕
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={secoes.soMobile}>
              {medicoes.map((m) => {
                const chip = chipTipoMedicao(m.tipo);
                return (
                  <div key={m.id} className={secoes.bloco}>
                    <div className={secoes.blocoTopo}>
                      <span className={secoes.blocoData}>
                        Boletim nº {m.numero}
                      </span>
                      <span className={`chip ${chip.classe}`}>
                        {chip.titulo}
                      </span>
                    </div>
                    <div className={secoes.cartaoLinha}>
                      <span className={secoes.cartaoChave}>Valor total</span>
                      <span className={secoes.cartaoValor}>
                        {formatarMoeda(m.valorTotal)}
                      </span>
                    </div>
                    <div className={secoes.cartaoLinha}>
                      <span className={secoes.cartaoChave}>Data</span>
                      <span className={secoes.cartaoValor}>
                        {formatarData(m.dataMedicao)}
                      </span>
                    </div>
                    <div className={secoes.cartaoLinha}>
                      <span className={secoes.cartaoChave}>Órgão</span>
                      <span className={secoes.cartaoValor}>
                        {nomeOrgao(opcoesOrgao, m.orgaoId)}
                      </span>
                    </div>
                    <div className={secoes.cartaoLinha}>
                      <span className={secoes.cartaoChave}>Observações</span>
                      <span className={secoes.cartaoValor}>
                        {m.observacoes ?? "—"}
                      </span>
                    </div>
                    {podeEditar && (
                      <button
                        type="button"
                        className="btn-perigo"
                        style={{ width: "100%", marginTop: "0.5rem" }}
                        onClick={() => remover(m.id)}
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {podeEditar && criando && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void salvar();
          }}
          className={formulario.cartao}
        >
          <h3 className={formulario.titulo}>Nova medição</h3>

          <div className={formulario.grade}>
            <label className={formulario.campo}>
              <span className={formulario.campoRotulo}>Número *</span>
              <input
                type="number"
                min={1}
                value={form.numero}
                onChange={(e) => set("numero", e.target.value)}
              />
            </label>

            <label className={formulario.campo}>
              <span className={formulario.campoRotulo}>Data *</span>
              <input
                type="date"
                value={form.dataMedicao}
                onChange={(e) => set("dataMedicao", e.target.value)}
              />
            </label>

            <label className={formulario.campo}>
              <span className={formulario.campoRotulo}>Tipo *</span>
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

            <label className={formulario.campo}>
              <span className={formulario.campoRotulo}>Órgão *</span>
              <select
                value={form.orgaoId}
                onChange={(e) => set("orgaoId", e.target.value)}
              >
                <option value="">— órgão —</option>
                {opcoesOrgao.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nome}
                  </option>
                ))}
              </select>
            </label>

            <div className={formulario.campoLargo}>
              <FontesEditor
                fontes={form.fontes}
                opcoesFonte={opcoesFonte}
                onChange={(fontes) => set("fontes", fontes)}
              />
            </div>

            <label className={`${formulario.campo} ${formulario.campoLargo}`}>
              <span className={formulario.campoRotulo}>Observações</span>
              <textarea
                rows={2}
                value={form.observacoes ?? ""}
                onChange={(e) => set("observacoes", e.target.value)}
              />
            </label>
          </div>

          <p className={secoes.parte} style={{ marginTop: "0.9rem" }}>
            <span className={secoes.parteChave}>Total da medição</span>
            <span className={secoes.parteValor}>
              {formatarMoeda(somarFontes(form.fontes), { vazio: "R$ 0,00" })}
            </span>
          </p>

          {erros.length > 0 && (
            <ul className={formulario.erros}>
              {erros.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          <div className={formulario.rodape}>
            <button
              type="button"
              className="btn-secundario"
              onClick={() => {
                setCriando(false);
                setErros([]);
                setForm(formularioVazio());
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
