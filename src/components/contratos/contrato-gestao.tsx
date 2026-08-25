"use client";

import { useCallback, useEffect, useState } from "react";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import secoes from "@/components/obras/detalhe/secoes.module.css";
import {
  excluirAditivo,
  excluirParalisacao,
  listarAditivos,
  listarParalisacoes,
  obterPrazoFinal,
  obterValores,
  somarFontes,
  type Aditivo,
  type Contrato,
  type FonteResumo,
  type Paralisacao,
  type PrazoFinalExecucao,
  type ValoresContrato,
} from "@/lib/api/contratos";
import {
  chipTipoAditivo,
  diasParadosTexto,
  partesPrazoFinal,
  prazoAditivo,
  situacaoParalisacao,
} from "@/lib/ui/contrato-aba";
import { formatarData } from "@/lib/ui/datas";
import { formatarMoeda } from "@/lib/ui/dinheiro";
import { AditivoForm } from "./aditivo-form";
import { ContratoForm } from "./contrato-form";
import { ParalisacaoForm } from "./paralisacao-form";
import { ReinicioForm } from "./reinicio-form";

/** Valor de um aditivo = soma dos seus pares fonte+valor (RN-CON-13). */
function valorAditivo(aditivo: Aditivo): string | null {
  if (aditivo.fontes.length === 0) return null;
  const total = somarFontes(aditivo.fontes);
  return Number(total) === 0 ? null : total;
}

/**
 * Guia Contrato da obra (E4-05/E4-06): destaques de Prazo Final de Execucao
 * (RN-CON-01) e Valor Total Contratado (RN-CON-13) com sua decomposicao, dados
 * do contrato com as fontes de recurso, aditivos e paralisacoes. Recarregada
 * apos cada lancamento (RN-CON-10). Acoes de escrita escondidas para CONSULTA.
 */
export function ContratoGestao({
  obraId,
  empresas,
  opcoesFonte,
  contratoInicial,
  aditivosIniciais,
  paralisacoesIniciais,
  prazoInicial,
  valoresIniciais,
  podeEditar,
}: {
  obraId: string;
  empresas: OpcaoSelect[];
  opcoesFonte: FonteResumo[];
  contratoInicial: Contrato | null;
  aditivosIniciais: Aditivo[];
  paralisacoesIniciais: Paralisacao[];
  prazoInicial: PrazoFinalExecucao | null;
  valoresIniciais: ValoresContrato | null;
  podeEditar: boolean;
}) {
  // O contrato vem do server component; apos salvar a guia recarrega (reload),
  // entao o estado nao muda no client — basta o getter.
  const [contrato] = useState<Contrato | null>(contratoInicial);
  const [editandoContrato, setEditandoContrato] = useState(!contratoInicial);
  const [aditivos, setAditivos] = useState<Aditivo[]>(aditivosIniciais);
  const [paralisacoes, setParalisacoes] =
    useState<Paralisacao[]>(paralisacoesIniciais);
  const [prazo, setPrazo] = useState<PrazoFinalExecucao | null>(prazoInicial);
  const [valores, setValores] = useState<ValoresContrato | null>(
    valoresIniciais,
  );

  const [novoAditivo, setNovoAditivo] = useState(false);
  const [reinicioDe, setReinicioDe] = useState<string | null>(null);
  const [novaParalisacao, setNovaParalisacao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const contratoId = contrato?.id ?? null;

  // RN-CON-10/13: apos cada lancamento, recarrega prazo, valores e listas.
  const recarregarAgregados = useCallback(async () => {
    if (!contratoId) return;
    try {
      const [p, v, a, par] = await Promise.all([
        obterPrazoFinal(contratoId),
        obterValores(contratoId),
        listarAditivos(contratoId),
        listarParalisacoes(contratoId),
      ]);
      setPrazo(p);
      setValores(v);
      setAditivos(a);
      setParalisacoes(par);
    } catch {
      // Mantem os valores atuais em caso de falha de rede.
    }
  }, [contratoId]);

  // Sincroniza com o servidor quando ha contrato mas os agregados ainda nao
  // foram carregados (ex.: o fetch do server component falhou e caiu no padrao).
  useEffect(() => {
    if (!contratoId || prazo !== null) return;
    let vivo = true;
    Promise.all([
      obterPrazoFinal(contratoId),
      obterValores(contratoId),
      listarAditivos(contratoId),
      listarParalisacoes(contratoId),
    ])
      .then(([p, v, a, par]) => {
        if (!vivo) return;
        setPrazo(p);
        setValores(v);
        setAditivos(a);
        setParalisacoes(par);
      })
      .catch(() => {
        // Mantem os valores atuais em caso de falha de rede.
      });
    return () => {
      vivo = false;
    };
  }, [contratoId, prazo]);

  async function aoSalvarContrato() {
    setEditandoContrato(false);
    setErro(null);
    // Recarrega a guia inteira (o contrato recem-criado tem novo id).
    window.location.reload();
  }

  async function removerAditivo(id: string) {
    if (!contratoId) return;
    setErro(null);
    try {
      await excluirAditivo(contratoId, id);
      await recarregarAgregados();
    } catch {
      setErro("Falha ao excluir aditivo");
    }
  }

  async function removerParalisacao(id: string) {
    if (!contratoId) return;
    setErro(null);
    try {
      await excluirParalisacao(contratoId, id);
      await recarregarAgregados();
    } catch {
      setErro("Falha ao excluir paralisação");
    }
  }

  const nomeFonte = (id: string) =>
    opcoesFonte.find((f) => f.id === id)?.nome ?? id;
  const codigoFonte = (id: string) =>
    opcoesFonte.find((f) => f.id === id)?.codigo ?? "";

  const camposContrato = contrato
    ? [
        { rotulo: "Número do contrato", valor: contrato.numero },
        {
          rotulo: "Empresa contratada",
          valor:
            empresas.find((e) => e.id === contrato.empresaContratadaId)?.nome ??
            "—",
        },
        {
          rotulo: "Data de assinatura",
          valor: formatarData(contrato.dataAssinatura),
        },
        { rotulo: "Data da O.S.", valor: formatarData(contrato.dataOs) },
        {
          rotulo: "Tipo de prazo de execução",
          valor: contrato.tipoPrazoExecucao,
        },
        {
          rotulo: "Prazo de execução",
          valor:
            contrato.tipoPrazoExecucao === "DIAS"
              ? `${contrato.prazoExecucaoDias ?? "—"} dias`
              : formatarData(contrato.prazoExecucaoData),
        },
        {
          rotulo: "Fim de vigência",
          valor: formatarData(contrato.fimVigencia),
        },
        { rotulo: "Objeto", valor: contrato.objeto ?? "—" },
      ]
    : [];

  return (
    <section className={secoes.pilha}>
      {/* Destaques: prazo final e valor total contratado */}
      {contrato && (
        <div className={secoes.destaques}>
          <div className={secoes.destaque}>
            <div className={secoes.destaqueRotulo}>Prazo final de execução</div>
            <div className={secoes.destaqueValor}>
              {prazo ? formatarData(prazo.prazoFinal) : "—"}
            </div>
            {prazo && (
              <>
                <div className={secoes.destaqueSub}>
                  {prazo.totalDias} dias no total
                </div>
                <div className={secoes.partes}>
                  {partesPrazoFinal(contrato.dataOs, prazo).map((p) => (
                    <div key={p.chave} className={secoes.parte}>
                      <span className={secoes.parteChave}>{p.chave}</span>
                      <span className={secoes.parteValor}>{p.valor}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className={secoes.destaque}>
            <div className={secoes.destaqueRotulo}>Valor total contratado</div>
            <div className={secoes.destaqueValor}>
              {formatarMoeda(valores?.total, { vazio: "R$ 0,00" })}
            </div>
            <div className={secoes.partes}>
              <div className={secoes.parte}>
                <span className={secoes.parteChave}>Contratado inicial</span>
                <span className={secoes.parteValor}>
                  {formatarMoeda(valores?.contratadoInicial, {
                    vazio: "R$ 0,00",
                  })}
                </span>
              </div>
              <div className={secoes.parte}>
                <span className={secoes.parteChave}>Aditivado (valor)</span>
                <span className={secoes.parteValor}>
                  + {formatarMoeda(valores?.aditivado, { vazio: "R$ 0,00" })}
                </span>
              </div>
              <div className={secoes.parte}>
                <span className={secoes.parteChave}>Nº de aditivos</span>
                <span className={secoes.parteValor}>{aditivos.length}</span>
              </div>
              <div className={secoes.parte}>
                <span className={secoes.parteChave}>Fontes vinculadas</span>
                <span className={secoes.parteValor}>
                  {contrato.fontes.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {erro && <p className={secoes.erros}>{erro}</p>}

      {/* Contrato */}
      <div className={secoes.secao}>
        <div className={secoes.secaoCabecalho}>
          <h2 className={secoes.secaoTitulo}>Contrato</h2>
          {contrato && podeEditar && !editandoContrato && (
            <button
              type="button"
              className={`btn-secundario ${secoes.secaoAcao}`}
              onClick={() => setEditandoContrato(true)}
            >
              Editar contrato
            </button>
          )}
        </div>

        {editandoContrato && podeEditar ? (
          <ContratoForm
            obraId={obraId}
            empresas={empresas}
            opcoesFonte={opcoesFonte}
            contratoExistente={contrato}
            onSalvo={aoSalvarContrato}
          />
        ) : contrato ? (
          <>
            <div className={secoes.grade}>
              {camposContrato.map((c) => (
                <div key={c.rotulo}>
                  <div className="rotulo-campo">{c.rotulo}</div>
                  <div className="valor-campo">{c.valor}</div>
                </div>
              ))}
            </div>

            <div
              className={secoes.secaoCabecalho}
              style={{ marginTop: "1.1rem" }}
            >
              <h3 className={secoes.secaoTitulo} style={{ fontSize: "0.9rem" }}>
                Fontes de recurso
              </h3>
            </div>
            <div className={secoes.listaEmbutida}>
              {contrato.fontes.map((f) => (
                <div key={f.id} className={secoes.itemLista}>
                  <span className={secoes.itemCodigo}>
                    {codigoFonte(f.fonteId)}
                  </span>
                  <span className={secoes.itemNome}>
                    {nomeFonte(f.fonteId)}
                  </span>
                  <span className={secoes.itemValor}>
                    {formatarMoeda(f.valor)}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className={secoes.vazio}>Nenhum contrato cadastrado.</p>
        )}
      </div>

      {/* Aditivos */}
      {contrato && (
        <div className={secoes.secao}>
          <div className={secoes.secaoCabecalho}>
            <h2 className={secoes.secaoTitulo}>Aditivos</h2>
            {podeEditar && !novoAditivo && (
              <button
                type="button"
                className={`btn-primario ${secoes.secaoAcao}`}
                onClick={() => setNovoAditivo(true)}
              >
                ＋ Novo aditivo
              </button>
            )}
          </div>

          {novoAditivo && podeEditar && (
            <div style={{ marginBottom: "0.9rem" }}>
              <AditivoForm
                contratoId={contrato.id}
                opcoesFonte={opcoesFonte}
                onSalvo={async () => {
                  setNovoAditivo(false);
                  await recarregarAgregados();
                }}
                onCancelar={() => setNovoAditivo(false)}
              />
            </div>
          )}

          {aditivos.length === 0 ? (
            <p className={secoes.vazio}>Nenhum aditivo lançado.</p>
          ) : (
            <>
              <div className={`${secoes.soDesktop} ${secoes.tabelaEnvolucro}`}>
                <table className={secoes.tabela}>
                  <thead>
                    <tr>
                      <th>Nº</th>
                      <th>Tipo</th>
                      <th>Assinatura</th>
                      <th>Prazo</th>
                      <th>Valor</th>
                      <th>Vigência</th>
                      {podeEditar && <th />}
                    </tr>
                  </thead>
                  <tbody>
                    {aditivos.map((a) => {
                      const chip = chipTipoAditivo(a.tipo);
                      const valor = valorAditivo(a);
                      return (
                        <tr key={a.id}>
                          <td className={`${secoes.forte} ${secoes.num}`}>
                            {a.numero}
                          </td>
                          <td>
                            <span className={`chip ${chip.classe}`}>
                              {chip.titulo}
                            </span>
                          </td>
                          <td className={secoes.num}>
                            {formatarData(a.dataAssinatura)}
                          </td>
                          <td className={secoes.num}>{prazoAditivo(a)}</td>
                          <td className={`${secoes.forte} ${secoes.num}`}>
                            {valor ? formatarMoeda(valor) : "—"}
                          </td>
                          <td className={secoes.num}>
                            {formatarData(a.vigenciaAditivada)}
                          </td>
                          {podeEditar && (
                            <td className={secoes.direita}>
                              <button
                                type="button"
                                title="Excluir aditivo"
                                className={`${secoes.acaoIcone} ${secoes.acaoIconePerigo}`}
                                onClick={() => removerAditivo(a.id)}
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
                {aditivos.map((a) => {
                  const chip = chipTipoAditivo(a.tipo);
                  const valor = valorAditivo(a);
                  return (
                    <div key={a.id} className={secoes.bloco}>
                      <div className={secoes.blocoTopo}>
                        <span className={secoes.blocoData}>{a.numero}</span>
                        <span className={`chip ${chip.classe}`}>
                          {chip.titulo}
                        </span>
                      </div>
                      <div className={secoes.cartaoLinha}>
                        <span className={secoes.cartaoChave}>Valor</span>
                        <span className={secoes.cartaoValor}>
                          {valor ? formatarMoeda(valor) : "—"}
                        </span>
                      </div>
                      <div className={secoes.cartaoLinha}>
                        <span className={secoes.cartaoChave}>Prazo</span>
                        <span className={secoes.cartaoValor}>
                          {prazoAditivo(a)}
                        </span>
                      </div>
                      <div className={secoes.cartaoLinha}>
                        <span className={secoes.cartaoChave}>Assinatura</span>
                        <span className={secoes.cartaoValor}>
                          {formatarData(a.dataAssinatura)}
                        </span>
                      </div>
                      <div className={secoes.cartaoLinha}>
                        <span className={secoes.cartaoChave}>Vigência</span>
                        <span className={secoes.cartaoValor}>
                          {formatarData(a.vigenciaAditivada)}
                        </span>
                      </div>
                      {podeEditar && (
                        <button
                          type="button"
                          className="btn-perigo"
                          style={{ width: "100%", marginTop: "0.5rem" }}
                          onClick={() => removerAditivo(a.id)}
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
      )}

      {/* Paralisacoes */}
      {contrato && (
        <div className={secoes.secao}>
          <div className={secoes.secaoCabecalho}>
            <h2 className={secoes.secaoTitulo}>Paralisações</h2>
            {podeEditar && !novaParalisacao && (
              <button
                type="button"
                className={`btn-primario ${secoes.secaoAcao}`}
                onClick={() => setNovaParalisacao(true)}
              >
                ＋ Nova paralisação
              </button>
            )}
          </div>

          {novaParalisacao && podeEditar && (
            <div style={{ marginBottom: "0.9rem" }}>
              <ParalisacaoForm
                contratoId={contrato.id}
                onSalvo={async () => {
                  setNovaParalisacao(false);
                  await recarregarAgregados();
                }}
                onCancelar={() => setNovaParalisacao(false)}
              />
            </div>
          )}

          {paralisacoes.length === 0 ? (
            <p className={secoes.vazio}>Nenhuma paralisação registrada.</p>
          ) : (
            <div className={secoes.blocos}>
              {paralisacoes.map((p) => {
                const situacao = situacaoParalisacao(p);
                return (
                  <div key={p.id} className={secoes.bloco}>
                    <div className={secoes.blocoTopo}>
                      <span className={secoes.blocoData}>
                        {formatarData(p.dataParalisacao)}
                      </span>
                      <span className={`chip ${situacao.classe}`}>
                        {situacao.titulo}
                      </span>
                      <span className={secoes.blocoDireita}>
                        <span className={secoes.parteValor}>
                          {diasParadosTexto(p.diasParados)}
                        </span>
                        {podeEditar && situacao.aberta && (
                          <button
                            type="button"
                            className={secoes.acaoIcone}
                            title="Registrar reinício"
                            onClick={() =>
                              setReinicioDe(reinicioDe === p.id ? null : p.id)
                            }
                          >
                            ↺
                          </button>
                        )}
                        {podeEditar && (
                          <button
                            type="button"
                            title="Excluir paralisação"
                            className={`${secoes.acaoIcone} ${secoes.acaoIconePerigo}`}
                            onClick={() => removerParalisacao(p.id)}
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    </div>

                    <p className={secoes.blocoTexto}>{p.motivo}</p>

                    <div className={secoes.blocoGrade}>
                      <div>
                        <div className="rotulo-campo">Termo de paralisação</div>
                        <div className="valor-campo">
                          📎 {p.termoParalisacaoArquivoId}
                        </div>
                      </div>
                      <div>
                        <div className="rotulo-campo">Data de reinício</div>
                        <div className="valor-campo num">
                          {formatarData(p.dataReinicio)}
                        </div>
                      </div>
                      <div>
                        <div className="rotulo-campo">Termo de retomada</div>
                        <div className="valor-campo">
                          {p.termoRetomadaArquivoId
                            ? `📎 ${p.termoRetomadaArquivoId}`
                            : "—"}
                        </div>
                      </div>
                    </div>

                    {reinicioDe === p.id && podeEditar && (
                      <ReinicioForm
                        contratoId={contrato.id}
                        paralisacaoId={p.id}
                        onSalvo={async () => {
                          setReinicioDe(null);
                          await recarregarAgregados();
                        }}
                        onCancelar={() => setReinicioDe(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
