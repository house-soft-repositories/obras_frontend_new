"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import {
  listarObrasPrivadas,
  urlExportacaoLista,
  type ItemListaObraPrivada,
  type Pagina,
} from "@/lib/api/obras-privadas";
import {
  alternarChip,
  aplicarFiltro,
  lerEstadoListagem,
  montarFiltroApi,
  montarQueryUrl,
  paginasVisiveis,
  resumoPaginacao,
  totalPaginas,
  type EstadoListagem,
} from "@/lib/api/obras-privadas-listagem";
import { mascararDocumento } from "@/lib/ui/documento";
import { chipsDaObra, rotuloEtapa } from "@/lib/ui/obra-privada-labels";
import { resumoUltimaVisita } from "@/lib/ui/prazo";
import { MapaObrasPrivadas } from "./mapas";
import styles from "./privadas.module.css";

const CHIPS_RAPIDOS = [
  { id: "autuada", rotulo: "Autuada" },
  { id: "embargada", rotulo: "Embargada" },
  { id: "semAlvara", rotulo: "Sem alvará" },
  { id: "semVisita90", rotulo: "Sem visita há +90 dias" },
] as const;

const SELECTS = [
  {
    campo: "situacaoAlvara" as const,
    vazio: "Situação do alvará: todas",
    opcoes: [
      ["SEM_ALVARA", "Sem alvará"],
      ["COM_ALVARA_VIGENTE", "Alvará vigente"],
      ["COM_ALVARA_VENCIDO", "Alvará vencido"],
      ["DISPENSADA", "Dispensada"],
    ],
  },
  {
    campo: "andamento" as const,
    vazio: "Andamento: todos",
    opcoes: [
      ["NAO_INICIADA", "Não iniciada"],
      ["EM_ANDAMENTO", "Em andamento"],
      ["PARALISADA", "Paralisada"],
      ["CONCLUIDA", "Concluída"],
      ["DEMOLIDA", "Demolida"],
      ["CANCELADA", "Cancelada"],
    ],
  },
  {
    campo: "habiteSe" as const,
    vazio: "Habite-se: todos",
    opcoes: [
      ["NAO_SOLICITADO", "Não emitido"],
      ["SOLICITADO", "Solicitado"],
      ["APROVADO", "Aprovado"],
      ["REPROVADO", "Reprovado"],
    ],
  },
];

/**
 * Listagem de obras privadas, com filtros na URL (padrao de
 * `obras-listagem.tsx`): o recorte fica compartilhavel e o botao voltar do
 * navegador funciona.
 *
 * A coluna "Situação" traz ATE 5 CHIPS ao mesmo tempo — sao eixos ortogonais,
 * e reduzi-los a um unico valor esconderia justamente a combinacao que importa
 * ("em andamento + sem alvará + autuada").
 */
export function ObrasPrivadasListagem({ visaoInicial }: { visaoInicial?: "lista" | "mapa" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [versao, setVersao] = useState(0);

  const estado = useMemo<EstadoListagem>(() => {
    const lido = lerEstadoListagem(params ?? new URLSearchParams());
    return visaoInicial ? { ...lido, visao: visaoInicial } : lido;
  }, [params, visaoInicial]);

  const chave = useMemo(
    () => `${JSON.stringify(montarFiltroApi(estado))}#${versao}`,
    [estado, versao],
  );

  const [resultado, setResultado] = useState<{
    chave: string;
    pagina: Pagina<ItemListaObraPrivada> | null;
    erro: string | null;
  } | null>(null);

  useEffect(() => {
    let vivo = true;
    listarObrasPrivadas(montarFiltroApi(estado))
      .then((pagina) => {
        if (vivo) setResultado({ chave, pagina, erro: null });
      })
      .catch((erro) => {
        if (vivo) setResultado({ chave, pagina: null, erro: mensagemErro(erro) });
      });
    return () => {
      vivo = false;
    };
    // `chave` ja resume o filtro + a versao; `estado` deriva dela.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  // Carregamento DERIVADO da chave (padrao de obras-listagem): um booleano
  // proprio ficaria fora de sincronia com o filtro durante a troca.
  const carregando = resultado === null || resultado.chave !== chave;
  const pagina = resultado?.pagina ?? null;

  function navegar(novo: EstadoListagem) {
    const base = novo.visao === "mapa" ? "/obras-privadas/mapa" : "/obras-privadas";
    router.push(`${base}${montarQueryUrl({ ...novo, visao: "lista" })}`);
  }

  const total = pagina?.total ?? 0;
  const paginas = totalPaginas(total);

  return (
    <main style={{ padding: "1.5rem 1.75rem" }}>
      <div className={styles.cabecalho}>
        <div>
          <h1 className="page-titulo">Obras privadas</h1>
          <p className="page-sub">
            {total} {total === 1 ? "obra" : "obras"} de terceiros sob
            fiscalização
          </p>
        </div>
        <div className={styles.cabecalhoAcoes}>
          <a
            className={styles.botaoFantasma}
            href={urlExportacaoLista(montarFiltroApi(estado), "CSV")}
          >
            ⤓ CSV
          </a>
          <a
            className={styles.botaoFantasma}
            href={urlExportacaoLista(montarFiltroApi(estado), "PDF")}
          >
            ⤓ PDF
          </a>
          <Link href="/obras-privadas/nova" className="btn-primario">
            ＋ Nova obra privada
          </Link>
        </div>
      </div>

      <div className={styles.filtros}>
        <div className={styles.buscaCampo}>
          <span aria-hidden>🔍</span>
          <input
            className={styles.buscaInput}
            key={`busca:${estado.filtro.buscaTextual ?? ""}`}
            defaultValue={estado.filtro.buscaTextual ?? ""}
            placeholder="Buscar por código, endereço, proprietário ou CPF/CNPJ…"
            aria-label="Buscar obra privada"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              navegar(
                aplicarFiltro(
                  estado,
                  "buscaTextual",
                  (e.target as HTMLInputElement).value.trim(),
                ),
              );
            }}
          />
        </div>

        <div className={styles.gradeSelects}>
          {SELECTS.map((s) => (
            <select
              key={s.campo}
              value={estado.filtro[s.campo] ?? ""}
              onChange={(e) =>
                navegar(aplicarFiltro(estado, s.campo, e.target.value))
              }
              aria-label={s.vazio}
            >
              <option value="">{s.vazio}</option>
              {s.opcoes.map(([valor, rotulo]) => (
                <option key={valor} value={valor}>
                  {rotulo}
                </option>
              ))}
            </select>
          ))}
          <input
            key={`bairro:${estado.filtro.bairro ?? ""}`}
            defaultValue={estado.filtro.bairro ?? ""}
            placeholder="Bairro"
            aria-label="Filtrar por bairro"
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              navegar(
                aplicarFiltro(
                  estado,
                  "bairro",
                  (e.target as HTMLInputElement).value.trim(),
                ),
              );
            }}
          />
        </div>

        <div className={styles.chipsRapidos}>
          {CHIPS_RAPIDOS.map((c) => {
            const ativo = Boolean(estado.filtro[c.id]);
            return (
              <button
                key={c.id}
                type="button"
                className={ativo ? styles.chipRapidoAtivo : styles.chipRapido}
                aria-pressed={ativo}
                onClick={() => navegar(alternarChip(estado, c.id))}
              >
                {ativo ? `✓ ${c.rotulo}` : c.rotulo}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.barraVisao}>
        <div className={styles.alternador}>
          <Link
            href={`/obras-privadas${montarQueryUrl({ ...estado, visao: "lista" })}`}
            className={
              estado.visao === "lista"
                ? styles.alternadorAtivo
                : styles.alternadorBotao
            }
          >
            Lista
          </Link>
          <Link
            href={`/obras-privadas/mapa${montarQueryUrl({ ...estado, visao: "lista" })}`}
            className={
              estado.visao === "mapa"
                ? styles.alternadorAtivo
                : styles.alternadorBotao
            }
          >
            Mapa
          </Link>
        </div>
        <span className={styles.contagem}>
          {resumoPaginacao(estado.pagina, total)}
        </span>
      </div>

      {resultado?.erro ? (
        <div className={styles.faixaErro} role="alert">
          <span aria-hidden>⛔</span>
          <div style={{ flex: 1 }}>
            <p className={styles.faixaErroTitulo}>
              Não foi possível carregar os registros
            </p>
            <p className={styles.faixaErroTexto}>{resultado.erro}</p>
          </div>
          <button
            type="button"
            className={styles.botaoFantasma}
            onClick={() => setVersao((v) => v + 1)}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {carregando ? (
        <div className={styles.carregando}>
          <div className={styles.carregandoTitulo}>
            <span className={styles.spinner} aria-hidden />
            Carregando obras privadas…
          </div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonLinha}>
              <span className={styles.skeletonBarra} style={{ width: 88 }} />
              <span
                className={styles.skeletonBarra}
                style={{ flex: 1, maxWidth: `${34 + (i % 3) * 12}%` }}
              />
              <span className={styles.skeletonBarra} style={{ width: 110 }} />
            </div>
          ))}
        </div>
      ) : null}

      {!carregando && pagina && estado.visao === "mapa" ? (
        <MapaObrasPrivadas obras={pagina.itens} />
      ) : null}

      {!carregando && pagina && estado.visao === "lista" ? (
        pagina.itens.length === 0 ? (
          <div className={styles.vazio}>
            <div className={styles.vazioIcone} aria-hidden>
              🏗️
            </div>
            <p className={styles.vazioTitulo}>Nenhuma obra encontrada</p>
            <p className={styles.vazioTexto}>
              Ajuste os filtros ou cadastre a primeira obra privada.
            </p>
            <Link
              href="/obras-privadas/nova"
              className="btn-primario"
              style={{ marginTop: "0.8rem", display: "inline-block" }}
            >
              ＋ Nova obra privada
            </Link>
          </div>
        ) : (
          <>
            <div className={`${styles.tabelaCard} ${styles.soDesktop}`}>
              <table className={styles.tabela}>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Endereço</th>
                    <th>Proprietário</th>
                    <th>Situação</th>
                    <th>Etapa</th>
                    <th>Última visita</th>
                    <th style={{ textAlign: "right" }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.itens.map((o) => {
                    const visita = resumoUltimaVisita(o.ultimaVisitaEm);
                    return (
                      <tr key={o.id}>
                        <td className={styles.num} style={{ fontSize: "0.72rem" }}>
                          {o.codigo}
                        </td>
                        <td>
                          <span className={styles.celulaForte}>
                            {[o.logradouro, o.numero].filter(Boolean).join(", ")}
                          </span>
                          <span className={styles.celulaFraca}>
                            {o.bairro ?? "—"}
                          </span>
                        </td>
                        <td>
                          <span>{o.proprietarioNome}</span>
                          <span className={`${styles.celulaFraca} ${styles.num}`}>
                            {mascararDocumento(o.proprietarioDocumento)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.chipsCelula}>
                            {chipsDaObra(o).map((c, i) => (
                              <span key={i} className={`chip ${c.tom}`}>
                                {c.rotulo}
                              </span>
                            ))}
                          </span>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {rotuloEtapa(o.etapaAtual)}
                        </td>
                        <td
                          className={`${styles.num} ${visita.alerta ? styles.visitaAlerta : ""}`}
                        >
                          {visita.rotulo}
                        </td>
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <Link
                            href={`/obras-privadas/${o.id}`}
                            className={styles.botaoAcao}
                            title="Abrir obra"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textDecoration: "none",
                            }}
                          >
                            ↗
                          </Link>
                          <Link
                            href={`/obras-privadas/${o.id}/fiscalizacoes`}
                            className={styles.botaoAcao}
                            title="Fiscalizações"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textDecoration: "none",
                            }}
                          >
                            🔎
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={`${styles.cartoes} ${styles.soMobile}`}>
              {pagina.itens.map((o) => {
                const visita = resumoUltimaVisita(o.ultimaVisitaEm);
                return (
                  <div key={o.id} className={styles.cartao}>
                    <div className={styles.codigo}>{o.codigo}</div>
                    <p className={styles.enderecoTitulo} style={{ fontSize: "1rem" }}>
                      {[o.logradouro, o.numero].filter(Boolean).join(", ")}
                    </p>
                    <p className={styles.proprietarioLinha}>{o.bairro ?? "—"}</p>
                    <div className={styles.chips}>
                      {chipsDaObra(o).map((c, i) => (
                        <span key={i} className={`chip ${c.tom}`}>
                          {c.rotulo}
                        </span>
                      ))}
                    </div>
                    <div className={styles.cartaoLinhaPrimeira}>
                      <span className={styles.cartaoRotulo}>Proprietário</span>
                      <span className={styles.cartaoValor}>
                        {o.proprietarioNome}
                      </span>
                    </div>
                    <div className={styles.cartaoLinha}>
                      <span className={styles.cartaoRotulo}>Etapa</span>
                      <span className={styles.cartaoValor}>
                        {rotuloEtapa(o.etapaAtual)}
                      </span>
                    </div>
                    <div className={styles.cartaoLinha}>
                      <span className={styles.cartaoRotulo}>Última visita</span>
                      <span
                        className={`${styles.cartaoValor} ${styles.num} ${visita.alerta ? styles.visitaAlerta : ""}`}
                      >
                        {visita.rotulo}
                      </span>
                    </div>
                    <Link
                      href={`/obras-privadas/${o.id}`}
                      className={styles.botaoFantasma}
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        marginTop: "0.7rem",
                      }}
                    >
                      Abrir obra
                    </Link>
                  </div>
                );
              })}
            </div>

            {paginas > 1 ? (
              <div className={styles.paginacao}>
                <span className={styles.contagem} style={{ marginLeft: 0 }}>
                  50 registros por página
                </span>
                <div className={styles.paginas}>
                  {paginasVisiveis(estado.pagina, paginas).map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={
                        p === estado.pagina ? styles.paginaAtiva : styles.pagina
                      }
                      onClick={() => navegar({ ...estado, pagina: p })}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )
      ) : null}
    </main>
  );
}
