"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DuplicarObraModal } from "@/components/obras/duplicar-obra-modal";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import { excluirObra, STATUS_OBRA, TIPOS_OBRA } from "@/lib/api/obras";
import {
  acaoConveniadaLabel,
  aplicarFiltroListagem,
  buscarPaginaObras,
  corBarra,
  irParaPagina,
  larguraBarra,
  lerEstadoListagem,
  montarConsultaObras,
  paginasVisiveis,
  percentualLabel,
  resumoPaginacao,
  resumoTotalObras,
  temFiltroAvancado,
  tipoObraLabel,
  totalPaginas,
} from "@/lib/api/obras-listagem";
import type {
  FiltroObras,
  ItemListaObras,
  PaginaObras,
} from "@/lib/api/relatorios";
import {
  semaforoInfo,
  statusObraChipClasse,
  statusObraLabel,
} from "@/lib/ui/obra-labels";
import type { UsuarioResumo } from "@/lib/ui/usuario-labels";
import s from "./obras-listagem.module.css";

export interface OpcoesListagemObras {
  orgaos: OpcaoSelect[];
  eixos: OpcaoSelect[];
  tipologias: OpcaoSelect[];
  classificacoes: OpcaoSelect[];
}

/**
 * Listagem de Obras (E2-08) sobre GET /api/proxy/relatorios/obras: filtros
 * sincronizados com a query string, tabela no desktop e cards no mobile.
 * Duplicar/Excluir continuam nos endpoints do modulo obras (/api/proxy/obras).
 */
export function ObrasListagem({
  opcoes,
  usuarios,
}: {
  opcoes: OpcoesListagemObras;
  usuarios: UsuarioResumo[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const estado = useMemo(
    () => lerEstadoListagem(new URLSearchParams(params.toString())),
    [params],
  );

  const [versao, setVersao] = useState(0); // bump = recarrega a lista
  const [duplicar, setDuplicar] = useState<ItemListaObras | null>(null);
  const [maisFiltros, setMaisFiltros] = useState(() =>
    temFiltroAvancado(estado.filtro),
  );

  // Consulta atual (filtros + pagina + versao); o resultado guarda a chave da
  // consulta que o gerou — "carregando" e derivado da comparacao das duas.
  const chave = useMemo(
    () => `${montarConsultaObras(estado)}#${versao}`,
    [estado, versao],
  );
  const [resultado, setResultado] = useState<{
    chave: string;
    pagina: PaginaObras;
    erro: string | null;
  } | null>(null);

  useEffect(() => {
    let vivo = true;
    buscarPaginaObras(estado)
      .then((p) => {
        if (vivo) setResultado({ chave, pagina: p, erro: null });
      })
      .catch(() => {
        if (vivo) {
          setResultado({
            chave,
            pagina: { itens: [], total: 0 },
            erro: "Não foi possível carregar as obras.",
          });
        }
      });
    return () => {
      vivo = false;
    };
  }, [estado, chave]);

  const carregando = resultado === null || resultado.chave !== chave;
  const pagina = resultado?.pagina ?? { itens: [], total: 0 };
  const erro = resultado?.erro ?? null;

  function navegar(qs: string) {
    router.push(qs ? `/obras?${qs}` : "/obras");
  }

  function mudarFiltro(chave: keyof FiltroObras, valor: string | string[]) {
    navegar(aplicarFiltroListagem(estado, chave, valor));
  }

  function irPara(numero: number) {
    navegar(irParaPagina(estado, numero));
  }

  function abrir(obraId: string) {
    router.push(`/obras/${obraId}/editar`);
  }

  async function remover(obraId: string) {
    if (!confirm("Excluir esta obra?")) return;
    try {
      await excluirObra(obraId);
      setVersao((v) => v + 1); // recarrega a lista
      router.refresh();
    } catch {
      alert("Não foi possível excluir a obra.");
    }
  }

  const filtro = estado.filtro;
  const totPaginas = totalPaginas(pagina.total);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <header className={s.cabecalho}>
        <div>
          <h1 className={s.titulo}>Obras</h1>
          <p className={s.subtitulo}>
            {carregando && pagina.total === 0
              ? "Carregando…"
              : resumoTotalObras(pagina.total)}
          </p>
        </div>
        <Link href="/obras/nova" className={`btn-primario ${s.botaoNova}`}>
          <span aria-hidden>＋</span> Nova obra
        </Link>
      </header>

      <div className={s.filtros}>
        <div className={s.busca}>
          <span className={s.buscaIcone} aria-hidden>
            🔍
          </span>
          <input
            key={`busca:${filtro.buscaTextual ?? ""}`}
            type="search"
            className={s.buscaCampo}
            placeholder="Buscar obras…"
            aria-label="Buscar obras por nome"
            defaultValue={filtro.buscaTextual ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                mudarFiltro("buscaTextual", e.currentTarget.value.trim());
              }
            }}
          />
        </div>
        <select
          aria-label="Filtrar por status"
          value={filtro.statusObra?.[0] ?? ""}
          onChange={(e) =>
            mudarFiltro("statusObra", e.target.value ? [e.target.value] : [])
          }
        >
          <option value="">Status: todos</option>
          {STATUS_OBRA.map((status) => (
            <option key={status} value={status}>
              {statusObraLabel(status)}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por órgão"
          value={filtro.orgaoId ?? ""}
          onChange={(e) => mudarFiltro("orgaoId", e.target.value)}
        >
          <option value="">Órgão: todos</option>
          {opcoes.orgaos.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nome}
            </option>
          ))}
        </select>
        <select
          aria-label="Filtrar por tipo"
          value={filtro.tipo ?? ""}
          onChange={(e) => mudarFiltro("tipo", e.target.value)}
        >
          <option value="">Tipo: todos</option>
          {TIPOS_OBRA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipoObraLabel(tipo)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={s.maisFiltros}
          aria-expanded={maisFiltros}
          onClick={() => setMaisFiltros((v) => !v)}
        >
          Mais filtros {maisFiltros ? "▴" : "▾"}
        </button>
      </div>

      {maisFiltros && (
        <div className={s.painelAvancado}>
          <select
            aria-label="Filtrar por eixo"
            value={filtro.eixoId ?? ""}
            onChange={(e) => mudarFiltro("eixoId", e.target.value)}
          >
            <option value="">Eixo: todos</option>
            {opcoes.eixos.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por tipologia"
            value={filtro.tipologiaId ?? ""}
            onChange={(e) => mudarFiltro("tipologiaId", e.target.value)}
          >
            <option value="">Tipologia: todas</option>
            {opcoes.tipologias.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por classificação"
            value={filtro.classificacaoId ?? ""}
            onChange={(e) => mudarFiltro("classificacaoId", e.target.value)}
          >
            <option value="">Classificação: todas</option>
            {opcoes.classificacoes.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nome}
              </option>
            ))}
          </select>
          <input
            key={`tag:${filtro.tagIds?.[0] ?? ""}`}
            placeholder="ID da tag"
            aria-label="Filtrar pelo ID da tag"
            title="Informe o ID (UUID) da tag e pressione Enter"
            defaultValue={filtro.tagIds?.[0] ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const valor = e.currentTarget.value.trim();
                mudarFiltro("tagIds", valor ? [valor] : []);
              }
            }}
          />
          <select
            aria-label="Filtrar por ação conveniada"
            value={filtro.acaoConveniada ?? ""}
            onChange={(e) => mudarFiltro("acaoConveniada", e.target.value)}
          >
            <option value="">Conveniada: todas</option>
            {(["NAO", "FEDERAL", "ESTADUAL"] as const).map((acao) => (
              <option key={acao} value={acao}>
                {acaoConveniadaLabel(acao)}
              </option>
            ))}
          </select>
          <label className={s.prioritarias}>
            <input
              type="checkbox"
              checked={filtro.prioritaria === "true"}
              onChange={(e) =>
                mudarFiltro("prioritaria", e.target.checked ? "true" : "")
              }
            />
            Somente prioritárias
          </label>
        </div>
      )}

      <section className={s.cartao}>
        <div className={s.tabelaWrap}>
          <table className={s.tabela}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Órgão</th>
                <th>% físico</th>
                <th>% financeira</th>
                <th>Status</th>
                <th>Desempenho</th>
                <th className={s.thAcoes}>Ações</th>
              </tr>
            </thead>
            <tbody className={carregando ? s.recarregando : undefined}>
              {pagina.itens.length === 0 && (
                <tr>
                  <td colSpan={8} className={s.estadoLista}>
                    {carregando
                      ? "Carregando…"
                      : (erro ?? "Nenhuma obra encontrada.")}
                  </td>
                </tr>
              )}
              {pagina.itens.map((obra) => (
                <tr
                  key={obra.obraId}
                  className={s.linha}
                  tabIndex={0}
                  onClick={() => abrir(obra.obraId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") abrir(obra.obraId);
                  }}
                >
                  <td className={s.codigo}>{obra.codigo}</td>
                  <td className={s.nome}>{obra.nome}</td>
                  <td>{obra.orgaoNome ?? "—"}</td>
                  <td>
                    <BarraPercentual
                      percentual={obra.percentualRealizado}
                      corBase="var(--cor-acento)"
                    />
                  </td>
                  <td>
                    <BarraPercentual
                      percentual={obra.percentualFinanceiro}
                      corBase="#0891b2"
                    />
                  </td>
                  <td>
                    <span
                      className={`chip ${statusObraChipClasse(obra.statusObra)}`}
                    >
                      {statusObraLabel(obra.statusObra)}
                    </span>
                  </td>
                  <td>
                    <Semaforo semaforo={obra.semaforo} />
                  </td>
                  <td className={s.acoes} onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className={s.botaoAcao}
                      onClick={() => setDuplicar(obra)}
                    >
                      Duplicar
                    </button>
                    <button
                      type="button"
                      className={`${s.botaoAcao} ${s.botaoExcluir}`}
                      onClick={() => remover(obra.obraId)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className={`${s.cartoes} ${carregando ? s.recarregando : ""}`}>
          {pagina.itens.length === 0 && (
            <li className={s.estadoCartoes}>
              {carregando ? "Carregando…" : (erro ?? "Nenhuma obra encontrada.")}
            </li>
          )}
          {pagina.itens.map((obra) => (
            <li
              key={obra.obraId}
              className={s.cartaoObra}
              onClick={() => abrir(obra.obraId)}
            >
              <div className={s.cartaoTopo}>
                <span className={s.codigo}>{obra.codigo}</span>
                <span
                  className={`chip ${statusObraChipClasse(obra.statusObra)}`}
                >
                  {statusObraLabel(obra.statusObra)}
                </span>
              </div>
              <p className={s.cartaoNome}>{obra.nome}</p>
              <p className={s.cartaoOrgao}>{obra.orgaoNome ?? "—"}</p>
              <Semaforo semaforo={obra.semaforo} />
              <div className={s.cartaoBarras}>
                <div className={s.cartaoBarra}>
                  <span className={s.rotuloBarra}>% físico</span>
                  <BarraPercentual
                    percentual={obra.percentualRealizado}
                    corBase="var(--cor-acento)"
                  />
                </div>
                <div className={s.cartaoBarra}>
                  <span className={s.rotuloBarra}>% financeira</span>
                  <BarraPercentual
                    percentual={obra.percentualFinanceiro}
                    corBase="#0891b2"
                  />
                </div>
              </div>
              <div
                className={s.cartaoAcoes}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className={s.botaoAcao}
                  onClick={() => setDuplicar(obra)}
                >
                  Duplicar
                </button>
                <button
                  type="button"
                  className={`${s.botaoAcao} ${s.botaoExcluir}`}
                  onClick={() => remover(obra.obraId)}
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>

        {pagina.total > 0 && (
          <footer className={s.paginacao}>
            <span className={s.paginacaoResumo}>
              {resumoPaginacao(estado.pagina, pagina.total)}
            </span>
            <nav className={s.paginas} aria-label="Paginação">
              <button
                type="button"
                className={s.pagina}
                aria-label="Página anterior"
                disabled={estado.pagina <= 1}
                onClick={() => irPara(estado.pagina - 1)}
              >
                ‹
              </button>
              {paginasVisiveis(estado.pagina, totPaginas).map((numero) => (
                <button
                  key={numero}
                  type="button"
                  className={`${s.pagina} ${
                    numero === estado.pagina ? s.paginaAtiva : ""
                  }`}
                  aria-current={numero === estado.pagina ? "page" : undefined}
                  onClick={() => irPara(numero)}
                >
                  {numero}
                </button>
              ))}
              <button
                type="button"
                className={s.pagina}
                aria-label="Próxima página"
                disabled={estado.pagina >= totPaginas}
                onClick={() => irPara(estado.pagina + 1)}
              >
                ›
              </button>
            </nav>
          </footer>
        )}
      </section>

      {duplicar && (
        <DuplicarObraModal
          obraId={duplicar.obraId}
          nomeOrigem={duplicar.nome}
          usuarios={usuarios}
          aoFechar={() => setDuplicar(null)}
        />
      )}
    </div>
  );
}

/** Barra 62px de percentual + valor "N%" (azul/ciano; verde a partir de 100%). */
function BarraPercentual({
  percentual,
  corBase,
}: {
  percentual: number;
  corBase: string;
}) {
  return (
    <span className={s.barraLinha}>
      <span className={s.barraTrilho}>
        <span
          className={s.barraPreenchimento}
          style={{
            width: `${larguraBarra(percentual)}%`,
            background: corBarra(percentual, corBase),
          }}
        />
      </span>
      <span className={s.barraValor}>{percentualLabel(percentual)}</span>
    </span>
  );
}

/** Bolinha de 9px com a cor do semáforo + rótulo de desempenho. */
function Semaforo({ semaforo }: { semaforo: ItemListaObras["semaforo"] }) {
  const info = semaforoInfo(semaforo);
  return (
    <span className={s.semaforo}>
      <span
        className={s.semaforoBolinha}
        style={{ background: info.cor }}
        aria-hidden
      />
      {info.rotulo}
    </span>
  );
}
