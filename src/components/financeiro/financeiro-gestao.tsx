"use client";

import { useState } from "react";
import formulario from "@/components/comum/formulario.module.css";
import { EntradaDinheiro } from "@/components/comum/entrada-dinheiro";
import secoes from "@/components/obras/detalhe/secoes.module.css";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import {
  criarEmpenho,
  criarLiquidacao,
  criarPagamento,
  excluirEmpenho,
  excluirLiquidacao,
  excluirPagamento,
  filtrarLiquidacoesPorEmpenho,
  listarEmpenhos,
  listarLiquidacoes,
  listarPagamentos,
  montarBarrasVisao,
  obterVisaoFisicoFinanceira,
  TIPOS_EMPENHO,
  validarEmpenho,
  validarLiquidacao,
  validarPagamento,
  type Empenho,
  type FormularioEmpenho,
  type FormularioLiquidacao,
  type FormularioPagamento,
  type Liquidacao,
  type Pagamento,
  type VisaoFisicoFinanceira,
} from "@/lib/api/financeiro";
import { formatarData } from "@/lib/ui/datas";
import { formatarMoeda } from "@/lib/ui/dinheiro";
import { cartoesTotais, chipTipoEmpenho } from "@/lib/ui/financeiro-aba";
import estilos from "./financeiro.module.css";

function fonteNome(opcoes: OpcaoSelect[], id: string): string {
  return opcoes.find((o) => o.id === id)?.nome ?? id;
}

const empenhoVazio = (): FormularioEmpenho => ({
  fonteId: "",
  tipo: "",
  numero: "",
  dataEmpenho: "",
  valor: "",
  observacoes: "",
});
const liquidacaoVazia = (): FormularioLiquidacao => ({
  empenhoId: "",
  fonteId: "",
  numero: "",
  dataLiquidacao: "",
  valor: "",
  observacoes: "",
});
const pagamentoVazio = (): FormularioPagamento => ({
  empenhoId: "",
  liquidacaoId: "",
  fonteId: "",
  numeroOrdemBancaria: "",
  dataOrdemBancaria: "",
  valor: "",
  observacoes: "",
});

/**
 * Aba Financeiro da obra (E6-05/RF-15): visao fisico-financeira em 7 barras,
 * cards de totais (empenhado/liquidado/pago) e secoes de Empenhos, Liquidacoes
 * e Pagamentos (selects encadeados), com tabela no desktop e cards no mobile.
 * Acoes de escrita ocultas para CONSULTA.
 */
export function FinanceiroGestao({
  obraId,
  opcoesFonte,
  empenhosIniciais,
  liquidacoesIniciais,
  pagamentosIniciais,
  visaoInicial,
  exigeMedicao = false,
  podeEditar,
}: {
  obraId: string;
  opcoesFonte: OpcaoSelect[];
  empenhosIniciais: Empenho[];
  liquidacoesIniciais: Liquidacao[];
  pagamentosIniciais: Pagamento[];
  visaoInicial: VisaoFisicoFinanceira | null;
  /** Obra com `vincularPagamentoPercentual` ativa: medição vira pré-condição
   *  bloqueante do pagamento (RN-FIN-07). */
  exigeMedicao?: boolean;
  podeEditar: boolean;
}) {
  const [empenhos, setEmpenhos] = useState(empenhosIniciais);
  const [liquidacoes, setLiquidacoes] = useState(liquidacoesIniciais);
  const [pagamentos, setPagamentos] = useState(pagamentosIniciais);
  const [visao, setVisao] = useState(visaoInicial);

  const [fe, setFe] = useState<FormularioEmpenho>(empenhoVazio());
  const [fl, setFl] = useState<FormularioLiquidacao>(liquidacaoVazia());
  const [fp, setFp] = useState<FormularioPagamento>(pagamentoVazio());
  const [aberto, setAberto] = useState<
    "empenho" | "liquidacao" | "pagamento" | null
  >(null);
  const [erros, setErros] = useState<string[]>([]);
  const [alerta, setAlerta] = useState<string | null>(null);

  async function recarregar() {
    const [e, l, p, v] = await Promise.all([
      listarEmpenhos(obraId),
      listarLiquidacoes(obraId),
      listarPagamentos(obraId),
      obterVisaoFisicoFinanceira(obraId).catch(() => visao),
    ]);
    setEmpenhos(e);
    setLiquidacoes(l);
    setPagamentos(p);
    if (v) setVisao(v);
  }

  async function salvarEmpenho() {
    const problemas = validarEmpenho(fe);
    setErros(problemas);
    if (problemas.length) return;
    try {
      await criarEmpenho(obraId, { ...fe, tipo: fe.tipo as "ORDINARIO" });
      setFe(empenhoVazio());
      setAberto(null);
      await recarregar();
    } catch {
      setErros(["Falha ao salvar empenho"]);
    }
  }

  async function salvarLiquidacao() {
    const problemas = validarLiquidacao(fl);
    setErros(problemas);
    if (problemas.length) return;
    try {
      await criarLiquidacao(obraId, fl);
      setFl(liquidacaoVazia());
      setAberto(null);
      await recarregar();
    } catch {
      setErros(["Falha ao salvar liquidação (soma excede o empenho?)"]);
    }
  }

  async function salvarPagamento() {
    const problemas = validarPagamento(fp);
    setErros(problemas);
    setAlerta(null);
    if (problemas.length) return;
    try {
      const pago = await criarPagamento(obraId, fp);
      if (pago.alerta) setAlerta(pago.alerta);
      setFp(pagamentoVazio());
      setAberto(null);
      await recarregar();
    } catch {
      setErros([
        "Falha ao salvar pagamento (medição ausente ou soma excede a liquidação?)",
      ]);
    }
  }

  async function remover(
    fn: (obraId: string, id: string) => Promise<unknown>,
    id: string,
    pergunta: string,
  ) {
    if (!window.confirm(pergunta)) return;
    await fn(obraId, id);
    await recarregar();
  }

  const liquidacoesDoEmpenho = filtrarLiquidacoesPorEmpenho(
    liquidacoes,
    fp.empenhoId,
  );
  const numeroEmpenho = (id: string) =>
    empenhos.find((e) => e.id === id)?.numero ?? id;
  const numeroLiquidacao = (id: string) =>
    liquidacoes.find((l) => l.id === id)?.numero ?? id;

  return (
    <section className={secoes.pilha}>
      {/* Visao fisico-financeira em barras horizontais (RF-15) */}
      {visao && (
        <div className={estilos.visao}>
          <h2 className={estilos.titulo}>Visão físico-financeira</h2>
          <p className={estilos.sub}>
            Execução acumulada sobre o total contratado
          </p>
          <div className={estilos.linhas}>
            {montarBarrasVisao(visao).map((b) => (
              <div key={b.rotulo}>
                <div className={estilos.cabecalhoLinha}>
                  <span className={estilos.rotulo}>{b.rotulo}</span>
                  <span className={estilos.valor}>
                    {b.valorFormatado} · {b.percentual}%
                  </span>
                </div>
                <div className={estilos.trilha}>
                  <div
                    className={estilos.preenchimento}
                    style={{
                      width: `${Math.min(b.percentual, 100)}%`,
                      background: b.cor,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards de totais da execucao orcamentaria (RN-FIN-08) */}
      {visao && (
        <div className={secoes.destaques}>
          {cartoesTotais(visao).map((c) => (
            <div key={c.chave} className={secoes.destaque}>
              <div className={secoes.destaqueRotulo}>{c.rotulo}</div>
              <div className={secoes.destaqueValor}>{c.valorFormatado}</div>
              <div className={secoes.destaqueSub}>
                {c.percentualTexto} do total contratado
              </div>
            </div>
          ))}
        </div>
      )}

      {erros.length > 0 && (
        <ul className={secoes.erros}>
          {erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      {alerta && <p className={secoes.aviso}>⚠️ {alerta}</p>}

      {/* Empenhos */}
      <div className={secoes.secao}>
        <div className={secoes.secaoCabecalho}>
          <h2 className={secoes.secaoTitulo}>Empenhos</h2>
          {podeEditar && aberto !== "empenho" && (
            <button
              type="button"
              className={`btn-primario ${secoes.secaoAcao}`}
              onClick={() => setAberto("empenho")}
            >
              ＋ Novo empenho
            </button>
          )}
        </div>

        {empenhos.length === 0 ? (
          <p className={secoes.vazio}>Nenhum empenho lançado.</p>
        ) : (
          <>
            <div className={`${secoes.soDesktop} ${secoes.tabelaEnvolucro}`}>
              <table className={secoes.tabela}>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Tipo</th>
                    <th>Fonte</th>
                    <th>Data</th>
                    <th>Valor</th>
                    {podeEditar && <th />}
                  </tr>
                </thead>
                <tbody>
                  {empenhos.map((e) => {
                    const chip = chipTipoEmpenho(e.tipo);
                    return (
                      <tr key={e.id}>
                        <td className={`${secoes.forte} ${secoes.num}`}>
                          {e.numero}
                        </td>
                        <td>
                          <span className={`chip ${chip.classe}`}>
                            {chip.titulo}
                          </span>
                        </td>
                        <td>{fonteNome(opcoesFonte, e.fonteId)}</td>
                        <td className={secoes.num}>
                          {formatarData(e.dataEmpenho)}
                        </td>
                        <td className={`${secoes.forte} ${secoes.num}`}>
                          {formatarMoeda(e.valor)}
                        </td>
                        {podeEditar && (
                          <td className={secoes.direita}>
                            <button
                              type="button"
                              title="Excluir empenho"
                              className={`${secoes.acaoIcone} ${secoes.acaoIconePerigo}`}
                              onClick={() =>
                                remover(
                                  excluirEmpenho,
                                  e.id,
                                  "Excluir empenho?",
                                )
                              }
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
              {empenhos.map((e) => {
                const chip = chipTipoEmpenho(e.tipo);
                return (
                  <div key={e.id} className={secoes.bloco}>
                    <div className={secoes.blocoTopo}>
                      <span className={secoes.blocoData}>{e.numero}</span>
                      <span className={`chip ${chip.classe}`}>
                        {chip.titulo}
                      </span>
                    </div>
                    <div className={secoes.cartaoLinha}>
                      <span className={secoes.cartaoChave}>Valor</span>
                      <span className={secoes.cartaoValor}>
                        {formatarMoeda(e.valor)}
                      </span>
                    </div>
                    <div className={secoes.cartaoLinha}>
                      <span className={secoes.cartaoChave}>Fonte</span>
                      <span className={secoes.cartaoValor}>
                        {fonteNome(opcoesFonte, e.fonteId)}
                      </span>
                    </div>
                    <div className={secoes.cartaoLinha}>
                      <span className={secoes.cartaoChave}>Data</span>
                      <span className={secoes.cartaoValor}>
                        {formatarData(e.dataEmpenho)}
                      </span>
                    </div>
                    {podeEditar && (
                      <button
                        type="button"
                        className="btn-perigo"
                        style={{ width: "100%", marginTop: "0.5rem" }}
                        onClick={() =>
                          remover(excluirEmpenho, e.id, "Excluir empenho?")
                        }
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

        {podeEditar && aberto === "empenho" && (
          <form
            className={formulario.cartao}
            style={{ marginTop: "0.9rem" }}
            onSubmit={(ev) => {
              ev.preventDefault();
              void salvarEmpenho();
            }}
          >
            <h3 className={formulario.titulo}>Novo empenho</h3>
            <div className={formulario.grade}>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Tipo *</span>
                <select
                  value={fe.tipo}
                  onChange={(e) =>
                    setFe({
                      ...fe,
                      tipo: e.target.value as FormularioEmpenho["tipo"],
                    })
                  }
                >
                  <option value="">— tipo —</option>
                  {TIPOS_EMPENHO.map((t) => (
                    <option key={t.chave} value={t.chave}>
                      {t.titulo}
                    </option>
                  ))}
                </select>
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Fonte *</span>
                <select
                  value={fe.fonteId}
                  onChange={(e) => setFe({ ...fe, fonteId: e.target.value })}
                >
                  <option value="">— fonte —</option>
                  {opcoesFonte.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Número *</span>
                <input
                  value={fe.numero}
                  onChange={(e) => setFe({ ...fe, numero: e.target.value })}
                  placeholder="2026NE000001"
                />
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Data *</span>
                <input
                  type="date"
                  value={fe.dataEmpenho}
                  onChange={(e) =>
                    setFe({ ...fe, dataEmpenho: e.target.value })
                  }
                />
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Valor *</span>
                <EntradaDinheiro
                  valor={fe.valor}
                  onChange={(v) => setFe({ ...fe, valor: v })}
                />
              </label>
            </div>
            <div className={formulario.rodape}>
              <button
                type="button"
                className="btn-secundario"
                onClick={() => setAberto(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primario">
                Salvar empenho
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Liquidacoes */}
      <div className={secoes.secao}>
        <div className={secoes.secaoCabecalho}>
          <h2 className={secoes.secaoTitulo}>Liquidações</h2>
          {podeEditar && aberto !== "liquidacao" && (
            <button
              type="button"
              className={`btn-primario ${secoes.secaoAcao}`}
              onClick={() => setAberto("liquidacao")}
            >
              ＋ Nova liquidação
            </button>
          )}
        </div>

        {liquidacoes.length === 0 ? (
          <p className={secoes.vazio}>Nenhuma liquidação lançada.</p>
        ) : (
          <>
            <div className={`${secoes.soDesktop} ${secoes.tabelaEnvolucro}`}>
              <table className={secoes.tabela}>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Empenho</th>
                    <th>Fonte</th>
                    <th>Data</th>
                    <th>Valor</th>
                    {podeEditar && <th />}
                  </tr>
                </thead>
                <tbody>
                  {liquidacoes.map((l) => (
                    <tr key={l.id}>
                      <td className={`${secoes.forte} ${secoes.num}`}>
                        {l.numero}
                      </td>
                      <td className={secoes.num}>
                        {numeroEmpenho(l.empenhoId)}
                      </td>
                      <td>{fonteNome(opcoesFonte, l.fonteId)}</td>
                      <td className={secoes.num}>
                        {formatarData(l.dataLiquidacao)}
                      </td>
                      <td className={`${secoes.forte} ${secoes.num}`}>
                        {formatarMoeda(l.valor)}
                      </td>
                      {podeEditar && (
                        <td className={secoes.direita}>
                          <button
                            type="button"
                            title="Excluir liquidação"
                            className={`${secoes.acaoIcone} ${secoes.acaoIconePerigo}`}
                            onClick={() =>
                              remover(
                                excluirLiquidacao,
                                l.id,
                                "Excluir liquidação?",
                              )
                            }
                          >
                            ✕
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={secoes.soMobile}>
              {liquidacoes.map((l) => (
                <div key={l.id} className={secoes.bloco}>
                  <div className={secoes.blocoTopo}>
                    <span className={secoes.blocoData}>{l.numero}</span>
                  </div>
                  <div className={secoes.cartaoLinha}>
                    <span className={secoes.cartaoChave}>Valor</span>
                    <span className={secoes.cartaoValor}>
                      {formatarMoeda(l.valor)}
                    </span>
                  </div>
                  <div className={secoes.cartaoLinha}>
                    <span className={secoes.cartaoChave}>Empenho</span>
                    <span className={secoes.cartaoValor}>
                      {numeroEmpenho(l.empenhoId)}
                    </span>
                  </div>
                  <div className={secoes.cartaoLinha}>
                    <span className={secoes.cartaoChave}>Fonte</span>
                    <span className={secoes.cartaoValor}>
                      {fonteNome(opcoesFonte, l.fonteId)}
                    </span>
                  </div>
                  <div className={secoes.cartaoLinha}>
                    <span className={secoes.cartaoChave}>Data</span>
                    <span className={secoes.cartaoValor}>
                      {formatarData(l.dataLiquidacao)}
                    </span>
                  </div>
                  {podeEditar && (
                    <button
                      type="button"
                      className="btn-perigo"
                      style={{ width: "100%", marginTop: "0.5rem" }}
                      onClick={() =>
                        remover(excluirLiquidacao, l.id, "Excluir liquidação?")
                      }
                    >
                      Excluir
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {podeEditar && aberto === "liquidacao" && (
          <form
            className={formulario.cartao}
            style={{ marginTop: "0.9rem" }}
            onSubmit={(ev) => {
              ev.preventDefault();
              void salvarLiquidacao();
            }}
          >
            <h3 className={formulario.titulo}>Nova liquidação</h3>
            <div className={formulario.grade}>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Empenho *</span>
                <select
                  value={fl.empenhoId}
                  onChange={(e) => setFl({ ...fl, empenhoId: e.target.value })}
                >
                  <option value="">— empenho —</option>
                  {empenhos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.numero} ({formatarMoeda(e.valor)})
                    </option>
                  ))}
                </select>
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Fonte *</span>
                <select
                  value={fl.fonteId}
                  onChange={(e) => setFl({ ...fl, fonteId: e.target.value })}
                >
                  <option value="">— fonte —</option>
                  {opcoesFonte.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Número *</span>
                <input
                  value={fl.numero}
                  onChange={(e) => setFl({ ...fl, numero: e.target.value })}
                  placeholder="2026NL000001"
                />
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Data *</span>
                <input
                  type="date"
                  value={fl.dataLiquidacao}
                  onChange={(e) =>
                    setFl({ ...fl, dataLiquidacao: e.target.value })
                  }
                />
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Valor *</span>
                <EntradaDinheiro
                  valor={fl.valor}
                  onChange={(v) => setFl({ ...fl, valor: v })}
                />
              </label>
            </div>
            <div className={formulario.rodape}>
              <button
                type="button"
                className="btn-secundario"
                onClick={() => setAberto(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primario">
                Salvar liquidação
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Pagamentos */}
      <div className={secoes.secao}>
        <div className={secoes.secaoCabecalho}>
          <div>
            <h2 className={secoes.secaoTitulo}>
              Pagamentos · Ordens bancárias
            </h2>
            <p className={secoes.secaoSub}>
              Vínculo obrigatório empenho → liquidação
            </p>
          </div>
          {podeEditar && aberto !== "pagamento" && (
            <button
              type="button"
              className={`btn-primario ${secoes.secaoAcao}`}
              onClick={() => setAberto("pagamento")}
            >
              ＋ Novo pagamento
            </button>
          )}
        </div>

        {pagamentos.length === 0 ? (
          <p className={secoes.vazio}>Nenhum pagamento lançado.</p>
        ) : (
          <>
            <div className={`${secoes.soDesktop} ${secoes.tabelaEnvolucro}`}>
              <table className={secoes.tabela}>
                <thead>
                  <tr>
                    <th>Ordem bancária</th>
                    <th>Liquidação</th>
                    <th>Empenho</th>
                    <th>Fonte</th>
                    <th>Data</th>
                    <th>Valor</th>
                    {podeEditar && <th />}
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.map((p) => (
                    <tr key={p.id}>
                      <td className={`${secoes.forte} ${secoes.num}`}>
                        {p.numeroOrdemBancaria}
                      </td>
                      <td className={secoes.num}>
                        {numeroLiquidacao(p.liquidacaoId)}
                      </td>
                      <td className={secoes.num}>
                        {numeroEmpenho(p.empenhoId)}
                      </td>
                      <td>{fonteNome(opcoesFonte, p.fonteId)}</td>
                      <td className={secoes.num}>
                        {formatarData(p.dataOrdemBancaria)}
                      </td>
                      <td className={`${secoes.forte} ${secoes.num}`}>
                        {formatarMoeda(p.valor)}
                      </td>
                      {podeEditar && (
                        <td className={secoes.direita}>
                          <button
                            type="button"
                            title="Excluir pagamento"
                            className={`${secoes.acaoIcone} ${secoes.acaoIconePerigo}`}
                            onClick={() =>
                              remover(
                                excluirPagamento,
                                p.id,
                                "Excluir pagamento?",
                              )
                            }
                          >
                            ✕
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={secoes.soMobile}>
              {pagamentos.map((p) => (
                <div key={p.id} className={secoes.bloco}>
                  <div className={secoes.blocoTopo}>
                    <span className={secoes.blocoData}>
                      {p.numeroOrdemBancaria}
                    </span>
                  </div>
                  <div className={secoes.cartaoLinha}>
                    <span className={secoes.cartaoChave}>Valor</span>
                    <span className={secoes.cartaoValor}>
                      {formatarMoeda(p.valor)}
                    </span>
                  </div>
                  <div className={secoes.cartaoLinha}>
                    <span className={secoes.cartaoChave}>Liquidação</span>
                    <span className={secoes.cartaoValor}>
                      {numeroLiquidacao(p.liquidacaoId)}
                    </span>
                  </div>
                  <div className={secoes.cartaoLinha}>
                    <span className={secoes.cartaoChave}>Empenho</span>
                    <span className={secoes.cartaoValor}>
                      {numeroEmpenho(p.empenhoId)}
                    </span>
                  </div>
                  <div className={secoes.cartaoLinha}>
                    <span className={secoes.cartaoChave}>Data</span>
                    <span className={secoes.cartaoValor}>
                      {formatarData(p.dataOrdemBancaria)}
                    </span>
                  </div>
                  {podeEditar && (
                    <button
                      type="button"
                      className="btn-perigo"
                      style={{ width: "100%", marginTop: "0.5rem" }}
                      onClick={() =>
                        remover(excluirPagamento, p.id, "Excluir pagamento?")
                      }
                    >
                      Excluir
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* RN-FIN-07: com a vinculacao ativa, medicao e pre-condicao do pagamento */}
        {exigeMedicao && (
          <p className={secoes.aviso}>
            <span aria-hidden>⚠️</span>
            <span>
              A obra tem <strong>vinculação de pagamento ao percentual</strong>{" "}
              ativa: novos pagamentos exigem ao menos uma medição cadastrada.
            </span>
          </p>
        )}

        {podeEditar && aberto === "pagamento" && (
          <form
            className={formulario.cartao}
            style={{ marginTop: "0.9rem" }}
            onSubmit={(ev) => {
              ev.preventDefault();
              void salvarPagamento();
            }}
          >
            <h3 className={formulario.titulo}>Novo pagamento</h3>
            <div className={formulario.grade}>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Empenho *</span>
                <select
                  value={fp.empenhoId}
                  onChange={(e) =>
                    setFp({
                      ...fp,
                      empenhoId: e.target.value,
                      liquidacaoId: "",
                    })
                  }
                >
                  <option value="">— empenho —</option>
                  {empenhos.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.numero}
                    </option>
                  ))}
                </select>
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Liquidação *</span>
                <select
                  value={fp.liquidacaoId}
                  onChange={(e) =>
                    setFp({ ...fp, liquidacaoId: e.target.value })
                  }
                  disabled={!fp.empenhoId}
                >
                  <option value="">— liquidação —</option>
                  {liquidacoesDoEmpenho.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.numero} ({formatarMoeda(l.valor)})
                    </option>
                  ))}
                </select>
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Fonte *</span>
                <select
                  value={fp.fonteId}
                  onChange={(e) => setFp({ ...fp, fonteId: e.target.value })}
                >
                  <option value="">— fonte —</option>
                  {opcoesFonte.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Número da O.B. *</span>
                <input
                  value={fp.numeroOrdemBancaria}
                  onChange={(e) =>
                    setFp({ ...fp, numeroOrdemBancaria: e.target.value })
                  }
                  placeholder="OB-2026-000001"
                />
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Data da O.B. *</span>
                <input
                  type="date"
                  value={fp.dataOrdemBancaria}
                  onChange={(e) =>
                    setFp({ ...fp, dataOrdemBancaria: e.target.value })
                  }
                />
              </label>
              <label className={formulario.campo}>
                <span className={formulario.campoRotulo}>Valor *</span>
                <EntradaDinheiro
                  valor={fp.valor}
                  onChange={(v) => setFp({ ...fp, valor: v })}
                />
              </label>
            </div>
            <div className={formulario.rodape}>
              <button
                type="button"
                className="btn-secundario"
                onClick={() => setAberto(null)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primario">
                Salvar pagamento
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
