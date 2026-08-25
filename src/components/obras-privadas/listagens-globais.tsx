"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import {
  listarAutosGlobal,
  listarFiscalizacoesGlobal,
  listarLicenciamentoGlobal,
  type ItemListaAuto,
  type ItemListaFiscalizacao,
  type ItemListaLicenciamento,
  type Pagina,
} from "@/lib/api/obras-privadas";
import { formatarMoeda } from "@/lib/ui/dinheiro";
import {
  chipHabiteSe,
  chipResultadoFiscalizacao,
  chipSituacaoAlvara,
  chipSituacaoAuto,
  chipTipoAuto,
  chipTipoFiscalizacao,
  rotuloEtapa,
  rotuloTipoAlvara,
} from "@/lib/ui/obra-privada-labels";
import {
  contarPrazo,
  formatarDataCurta,
  prazoEncerrado,
} from "@/lib/ui/prazo";
import styles from "./privadas.module.css";

/** Hook comum das tres listagens globais: carrega, trata erro e recarrega. */
function useListaGlobal<T>(
  carregar: (filtros: Record<string, string | boolean | number | undefined>) => Promise<Pagina<T>>,
  filtros: Record<string, string | boolean | number | undefined>,
) {
  const chave = JSON.stringify(filtros);
  const [pagina, setPagina] = useState<Pagina<T> | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    carregar(JSON.parse(chave) as typeof filtros)
      .then((p) => {
        if (vivo) {
          setPagina(p);
          setErro(null);
        }
      })
      .catch((e) => {
        if (vivo) setErro(mensagemErro(e));
      });
    return () => {
      vivo = false;
    };
    // `chave` serializa os filtros; `carregar` e estavel por modulo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chave]);

  return { pagina, erro, carregando: pagina === null && erro === null };
}

function Estado({
  erro,
  carregando,
  vazio,
  mensagemVazio,
}: {
  erro: string | null;
  carregando: boolean;
  vazio: boolean;
  mensagemVazio: string;
}) {
  if (erro) {
    return (
      <div className={styles.faixaErro} role="alert">
        <span aria-hidden>⛔</span>
        <div>
          <p className={styles.faixaErroTitulo}>Não foi possível carregar</p>
          <p className={styles.faixaErroTexto}>{erro}</p>
        </div>
      </div>
    );
  }
  if (carregando) {
    return (
      <div className={styles.carregando}>
        <div className={styles.carregandoTitulo}>
          <span className={styles.spinner} aria-hidden />
          Carregando…
        </div>
      </div>
    );
  }
  if (vazio) {
    return (
      <div className={styles.vazio}>
        <p className={styles.vazioTitulo}>Nada encontrado</p>
        <p className={styles.vazioTexto}>{mensagemVazio}</p>
      </div>
    );
  }
  return null;
}

/**
 * Listagem global de fiscalizacoes (cross-obra). Responde a pergunta que a aba
 * da obra nao responde: "o que a equipe fiscalizou este mes".
 */
export function ListaFiscalizacoesGlobal() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("");
  const [resultado, setResultado] = useState("");

  const { pagina, erro, carregando } = useListaGlobal(
    listarFiscalizacoesGlobal,
    { busca: busca || undefined, tipo: tipo || undefined, resultado: resultado || undefined, limit: 50 },
  );

  return (
    <main style={{ padding: "1.5rem 1.75rem" }}>
      <h1 className="page-titulo">Fiscalizações</h1>
      <p className="page-sub">
        {pagina?.total ?? 0} visita(s) registrada(s) em todas as obras privadas
      </p>

      <div className={styles.filtros}>
        <div className={styles.buscaCampo}>
          <span aria-hidden>🔍</span>
          <input
            className={styles.buscaInput}
            defaultValue={busca}
            placeholder="Buscar por nº da visita, código da obra ou endereço…"
            aria-label="Buscar fiscalização"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setBusca((e.target as HTMLInputElement).value.trim());
              }
            }}
          />
        </div>
        <div className={styles.gradeSelects}>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo">
            <option value="">Tipo: todos</option>
            {["ROTINA", "DENUNCIA", "ENTULHO", "VERIFICACAO_ALVARA", "VISTORIA_HABITE_SE", "REINCIDENCIA"].map(
              (t) => (
                <option key={t} value={t}>
                  {chipTipoFiscalizacao(t).rotulo}
                </option>
              ),
            )}
          </select>
          <select
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            aria-label="Resultado"
          >
            <option value="">Resultado: todos</option>
            {["REGULAR", "IRREGULAR", "NAO_LOCALIZADA", "SEM_ACESSO"].map((r) => (
              <option key={r} value={r}>
                {chipResultadoFiscalizacao(r).rotulo}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Estado
        erro={erro}
        carregando={carregando}
        vazio={(pagina?.itens.length ?? 0) === 0}
        mensagemVazio="Nenhuma fiscalização corresponde aos filtros."
      />

      {pagina && pagina.itens.length > 0 ? (
        <div className={styles.tabelaCard}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Data</th>
                <th>Obra</th>
                <th>Tipo</th>
                <th>Resultado</th>
                <th>Etapa</th>
              </tr>
            </thead>
            <tbody>
              {pagina.itens.map((f: ItemListaFiscalizacao) => {
                const t = chipTipoFiscalizacao(f.tipo);
                const r = chipResultadoFiscalizacao(f.resultado);
                return (
                  <tr key={f.id}>
                    <td className={`${styles.num} ${styles.celulaForte}`}>
                      {f.numero}
                    </td>
                    <td className={styles.num}>
                      {formatarDataCurta(f.dataFiscalizacao)}
                    </td>
                    <td>
                      <Link
                        href={`/obras-privadas/${f.obraPrivadaId}/fiscalizacoes`}
                        className={styles.botaoLink}
                      >
                        {f.obraCodigo}
                      </Link>
                      <span className={styles.celulaFraca}>{f.obraEndereco}</span>
                    </td>
                    <td>
                      <span className={`chip ${t.tom}`}>{t.rotulo}</span>
                    </td>
                    <td>
                      <span className={`chip ${r.tom}`}>{r.rotulo}</span>
                    </td>
                    <td>{rotuloEtapa(f.etapaConstatada)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}

/**
 * Listagem global de autos. O filtro "somente vencidos" e o motivo desta tela
 * existir: e a pergunta que o supervisor faz toda segunda-feira.
 */
export function ListaAutosGlobal() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("");
  const [situacao, setSituacao] = useState("");
  const [vencidos, setVencidos] = useState(false);

  const { pagina, erro, carregando } = useListaGlobal(listarAutosGlobal, {
    busca: busca || undefined,
    tipo: tipo || undefined,
    situacao: situacao || undefined,
    vencidos: vencidos || undefined,
    limit: 50,
  });

  return (
    <main style={{ padding: "1.5rem 1.75rem" }}>
      <h1 className="page-titulo">Autos e notificações</h1>
      <p className="page-sub">
        {pagina?.total ?? 0} ato(s) administrativo(s) em todas as obras privadas
      </p>

      <div className={styles.filtros}>
        <div className={styles.buscaCampo}>
          <span aria-hidden>🔍</span>
          <input
            className={styles.buscaInput}
            defaultValue={busca}
            placeholder="Buscar por nº do auto, código da obra ou endereço…"
            aria-label="Buscar auto"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setBusca((e.target as HTMLInputElement).value.trim());
              }
            }}
          />
        </div>
        <div className={styles.gradeSelects}>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo">
            <option value="">Tipo: todos</option>
            {["NOTIFICACAO", "AUTO_INFRACAO", "EMBARGO", "INTERDICAO", "MULTA"].map((t) => (
              <option key={t} value={t}>
                {chipTipoAuto(t).rotulo}
              </option>
            ))}
          </select>
          <select
            value={situacao}
            onChange={(e) => setSituacao(e.target.value)}
            aria-label="Situação"
          >
            <option value="">Situação: todas</option>
            {["ABERTO", "CUMPRIDO", "EM_RECURSO", "CANCELADO", "QUITADO"].map((s) => (
              <option key={s} value={s}>
                {chipSituacaoAuto(s).rotulo}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.chipsRapidos}>
          <button
            type="button"
            className={vencidos ? styles.chipRapidoAtivo : styles.chipRapido}
            aria-pressed={vencidos}
            onClick={() => setVencidos((v) => !v)}
          >
            {vencidos ? "✓ Somente vencidos" : "Somente vencidos"}
          </button>
        </div>
      </div>

      <Estado
        erro={erro}
        carregando={carregando}
        vazio={(pagina?.itens.length ?? 0) === 0}
        mensagemVazio="Nenhum auto corresponde aos filtros."
      />

      {pagina && pagina.itens.length > 0 ? (
        <div className={styles.tabelaCard}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Nº</th>
                <th>Obra</th>
                <th>Tipo</th>
                <th>Emissão</th>
                <th>Data limite</th>
                <th>Multa</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              {pagina.itens.map((a: ItemListaAuto) => {
                const prazo = contarPrazo(
                  a.dataLimite,
                  prazoEncerrado(a.situacao),
                );
                const t = chipTipoAuto(a.tipo);
                const s = chipSituacaoAuto(a.situacao);
                return (
                  <tr key={a.id}>
                    <td className={`${styles.num} ${styles.celulaForte}`}>
                      {a.numero}
                    </td>
                    <td>
                      <Link
                        href={`/obras-privadas/${a.obraPrivadaId}/fiscalizacoes`}
                        className={styles.botaoLink}
                      >
                        {a.obraCodigo}
                      </Link>
                      <span className={styles.celulaFraca}>{a.obraEndereco}</span>
                    </td>
                    <td>
                      <span className={`chip ${t.tom}`}>{t.rotulo}</span>
                    </td>
                    <td className={styles.num}>
                      {formatarDataCurta(a.dataEmissao)}
                    </td>
                    <td className={styles.num}>
                      {formatarDataCurta(a.dataLimite)}
                      {prazo.rotulo ? (
                        <span
                          className={
                            prazo.vencido
                              ? styles.contadorPrazoVencido
                              : styles.contadorPrazo
                          }
                        >
                          {prazo.rotulo}
                        </span>
                      ) : null}
                    </td>
                    <td className={`${styles.num} ${styles.celulaForte}`}>
                      {a.valorMulta ? formatarMoeda(a.valorMulta) : "—"}
                    </td>
                    <td>
                      <span className={`chip ${s.tom}`}>{s.rotulo}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}

/**
 * Listagem global de licenciamento: uma linha por obra com o alvara vigente.
 * O filtro "vencendo em N dias" antecipa a revalidacao antes que a obra caia
 * na irregularidade.
 */
export function ListaLicenciamentoGlobal() {
  const [busca, setBusca] = useState("");
  const [situacaoAlvara, setSituacaoAlvara] = useState("");
  const [vencendo, setVencendo] = useState("");

  const { pagina, erro, carregando } = useListaGlobal(
    listarLicenciamentoGlobal,
    {
      busca: busca || undefined,
      situacaoAlvara: situacaoAlvara || undefined,
      vencendoEmDias: vencendo ? Number(vencendo) : undefined,
      limit: 50,
    },
  );

  return (
    <main style={{ padding: "1.5rem 1.75rem" }}>
      <h1 className="page-titulo">Alvarás e habite-se</h1>
      <p className="page-sub">
        {pagina?.total ?? 0} obra(s) · situação de licenciamento consolidada
      </p>

      <div className={styles.filtros}>
        <div className={styles.buscaCampo}>
          <span aria-hidden>🔍</span>
          <input
            className={styles.buscaInput}
            defaultValue={busca}
            placeholder="Buscar por código, endereço ou proprietário…"
            aria-label="Buscar obra"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setBusca((e.target as HTMLInputElement).value.trim());
              }
            }}
          />
        </div>
        <div className={styles.gradeSelects}>
          <select
            value={situacaoAlvara}
            onChange={(e) => setSituacaoAlvara(e.target.value)}
            aria-label="Situação do alvará"
          >
            <option value="">Situação do alvará: todas</option>
            {["SEM_ALVARA", "COM_ALVARA_VIGENTE", "COM_ALVARA_VENCIDO", "DISPENSADA"].map(
              (s) => (
                <option key={s} value={s}>
                  {chipSituacaoAlvara(s).rotulo}
                </option>
              ),
            )}
          </select>
          <select
            value={vencendo}
            onChange={(e) => setVencendo(e.target.value)}
            aria-label="Vencimento"
          >
            <option value="">Vencimento: qualquer</option>
            <option value="30">Vence em até 30 dias</option>
            <option value="60">Vence em até 60 dias</option>
            <option value="90">Vence em até 90 dias</option>
          </select>
        </div>
      </div>

      <Estado
        erro={erro}
        carregando={carregando}
        vazio={(pagina?.itens.length ?? 0) === 0}
        mensagemVazio="Nenhuma obra corresponde aos filtros."
      />

      {pagina && pagina.itens.length > 0 ? (
        <div className={styles.tabelaCard}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Obra</th>
                <th>Proprietário</th>
                <th>Alvará vigente</th>
                <th>Validade</th>
                <th>Situação</th>
                <th>Habite-se</th>
              </tr>
            </thead>
            <tbody>
              {pagina.itens.map((l: ItemListaLicenciamento) => {
                const sa = chipSituacaoAlvara(l.situacaoAlvara);
                const hs = chipHabiteSe(l.habiteSe);
                const alerta =
                  l.diasAteVencimento !== null && l.diasAteVencimento <= 30;
                return (
                  <tr key={l.obraPrivadaId}>
                    <td>
                      <Link
                        href={`/obras-privadas/${l.obraPrivadaId}/licenciamento`}
                        className={styles.botaoLink}
                      >
                        {l.obraCodigo}
                      </Link>
                      <span className={styles.celulaFraca}>{l.obraEndereco}</span>
                    </td>
                    <td>{l.proprietarioNome}</td>
                    <td className={styles.num}>
                      {l.alvaraNumero ?? "—"}
                      {l.alvaraTipo ? (
                        <span className={styles.celulaFraca}>
                          {rotuloTipoAlvara(l.alvaraTipo)}
                        </span>
                      ) : null}
                    </td>
                    <td className={styles.num}>
                      {formatarDataCurta(l.alvaraDataValidade)}
                      {l.diasAteVencimento !== null ? (
                        <span
                          className={
                            alerta
                              ? styles.contadorPrazoVencido
                              : styles.contadorPrazo
                          }
                        >
                          {l.diasAteVencimento < 0
                            ? `vencido há ${Math.abs(l.diasAteVencimento)} dias`
                            : `faltam ${l.diasAteVencimento} dias`}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <span className={`chip ${sa.tom}`}>{sa.rotulo}</span>
                    </td>
                    <td>
                      <span className={`chip ${hs.tom}`}>{hs.rotulo}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
