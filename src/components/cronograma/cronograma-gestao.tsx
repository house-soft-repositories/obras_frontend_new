"use client";

import { useState } from "react";
import {
  assumirEstagio,
  concluirEstagio,
  criarEstagiosPredefinidos,
  duplicarEstagio,
  ErroApi,
  excluirEstagio,
  excluirLoteEstagios,
  FILTROS_ESTAGIO,
  filtrarEstagios,
  listarEstagios,
  montarArvore,
  reordenarEstagios,
  type Estagio,
  type FiltroEstagio,
} from "@/lib/api/cronograma";
import {
  corBarraRealizado,
  desvioEstagio,
  duracaoEstagio,
  larguraBarra,
  percentual,
  periodoEstagio,
  situacaoEstagio,
} from "@/lib/ui/cronograma-estagio";
import type { UsuarioResumo } from "@/lib/ui/usuario-labels";
import estilos from "./cronograma.module.css";
import { EstagioForm } from "./estagio-form";
import { PainelAcompanhamento } from "./painel-acompanhamento";

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

type ModoForm =
  | { tipo: "criar"; paiId: string | null }
  | { tipo: "editar"; estagio: Estagio }
  | null;

export function CronogramaGestao({
  obraId,
  estagiosIniciais,
  atualId,
  usuarios,
}: {
  obraId: string;
  estagiosIniciais: Estagio[];
  atualId: string | null;
  usuarios: UsuarioResumo[];
}) {
  const [estagios, setEstagios] = useState<Estagio[]>(estagiosIniciais);
  const [filtro, setFiltro] = useState<FiltroEstagio>("todos");
  const [form, setForm] = useState<ModoForm>(null);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [painel, setPainel] = useState<Estagio | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function recarregar(f: FiltroEstagio = filtro) {
    try {
      setEstagios(await listarEstagios(obraId, f));
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  async function comApi(fn: () => Promise<unknown>) {
    setErro(null);
    try {
      await fn();
      await recarregar();
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  function trocarFiltro(f: FiltroEstagio) {
    setFiltro(f);
    recarregar(f);
  }

  function alternarSelecao(id: string) {
    setSelecionados((s) => {
      const novo = new Set(s);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  // Reordenacao por arrastar-e-soltar entre estagios raiz (RN-CRO-07).
  async function soltarSobre(alvoId: string) {
    if (!dragId || dragId === alvoId) return;
    const raizes = montarArvore(filtrarEstagios(estagios, filtro, null)).map(
      (r) => r as Estagio,
    );
    const de = raizes.findIndex((r) => r.id === dragId);
    const para = raizes.findIndex((r) => r.id === alvoId);
    if (de < 0 || para < 0) return;
    const nova = [...raizes];
    const [movido] = nova.splice(de, 1);
    nova.splice(para, 0, movido);
    setDragId(null);
    await comApi(() =>
      reordenarEstagios(
        obraId,
        nova.map((r, i) => ({ id: r.id, ordem: i })),
      ),
    );
  }

  const arvore = montarArvore(filtrarEstagios(estagios, filtro, null));
  const nomeResponsavel = (id: string | null) =>
    (id && usuarios.find((u) => u.id === id)?.nome) || "—";

  return (
    <section>
      {/* Filtros de visao dos estagios (RN-CRO-22) */}
      <div className={estilos.barra}>
        <div className={estilos.filtros}>
          {FILTROS_ESTAGIO.map((f) => (
            <button
              key={f.chave}
              type="button"
              onClick={() => trocarFiltro(f.chave)}
              className={
                filtro === f.chave
                  ? `${estilos.filtro} ${estilos.filtroAtivo}`
                  : estilos.filtro
              }
              aria-pressed={filtro === f.chave}
            >
              {f.titulo}
            </button>
          ))}
        </div>
      </div>

      <div className={estilos.acoes}>
        <button
          type="button"
          className="btn-primario"
          onClick={() => setForm({ tipo: "criar", paiId: null })}
        >
          ＋ Nova etapa
        </button>
        {estagios.length === 0 && (
          <button
            type="button"
            className="btn-secundario"
            onClick={() => comApi(() => criarEstagiosPredefinidos(obraId))}
          >
            Criar estágios predefinidos
          </button>
        )}
        {selecionados.size > 0 && (
          <button
            type="button"
            className="btn-perigo"
            onClick={() =>
              comApi(async () => {
                await excluirLoteEstagios(obraId, [...selecionados]);
                setSelecionados(new Set());
              })
            }
          >
            Excluir selecionados ({selecionados.size})
          </button>
        )}
      </div>

      {erro && <p className={estilos.erro}>{erro}</p>}

      {form && (
        <div style={{ marginTop: 14 }}>
          <EstagioForm
            obraId={obraId}
            usuarios={usuarios}
            modo={form.tipo}
            estagio={form.tipo === "editar" ? form.estagio : undefined}
            estagioPaiId={form.tipo === "criar" ? form.paiId : undefined}
            precedentesDisponiveis={estagios}
            onSalvo={() => {
              setForm(null);
              recarregar();
            }}
            onCancelar={() => setForm(null)}
          />
        </div>
      )}

      <div className={estilos.lista}>
        {arvore.length === 0 && (
          <p className={estilos.vazio}>Nenhum estágio cadastrado.</p>
        )}
        {arvore.map((raiz) => (
          <div key={raiz.id}>
            <LinhaEstagio
              estagio={raiz}
              atual={raiz.id === atualId}
              selecionado={selecionados.has(raiz.id)}
              responsavel={nomeResponsavel(raiz.responsavelUsuarioId)}
              arrastavel
              onDragStart={() => setDragId(raiz.id)}
              onDrop={() => soltarSobre(raiz.id)}
              onSelecionar={() => alternarSelecao(raiz.id)}
              onAbrirPainel={() => setPainel(raiz)}
              onEditar={() => setForm({ tipo: "editar", estagio: raiz })}
              onAddSub={() => setForm({ tipo: "criar", paiId: raiz.id })}
              onAssumir={() => comApi(() => assumirEstagio(obraId, raiz.id))}
              onConcluir={() => comApi(() => concluirEstagio(obraId, raiz.id))}
              onDuplicar={() => comApi(() => duplicarEstagio(obraId, raiz.id))}
              onExcluir={() => comApi(() => excluirEstagio(obraId, raiz.id))}
            />
            {raiz.subatividades.map((sub) => (
              <LinhaEstagio
                key={sub.id}
                estagio={sub}
                atual={false}
                sub
                selecionado={selecionados.has(sub.id)}
                responsavel={nomeResponsavel(sub.responsavelUsuarioId)}
                onSelecionar={() => alternarSelecao(sub.id)}
                onAbrirPainel={() => setPainel(sub)}
                onEditar={() => setForm({ tipo: "editar", estagio: sub })}
                onAssumir={() => comApi(() => assumirEstagio(obraId, sub.id))}
                onConcluir={() => comApi(() => concluirEstagio(obraId, sub.id))}
                onDuplicar={() => comApi(() => duplicarEstagio(obraId, sub.id))}
                onExcluir={() => comApi(() => excluirEstagio(obraId, sub.id))}
              />
            ))}
          </div>
        ))}
      </div>

      {painel && (
        <PainelAcompanhamento
          key={painel.id}
          obraId={obraId}
          estagio={painel}
          usuarios={usuarios}
        />
      )}
    </section>
  );
}

/**
 * Linha de estagio no padrao do design: ordem, descricao, chip de situacao,
 * metadados (tipo, periodo, duracao, responsavel), barras Meta x Realizado com
 * desvio em p.p. e a barra de acoes do estagio.
 */
function LinhaEstagio({
  estagio,
  atual,
  sub,
  selecionado,
  responsavel,
  arrastavel,
  onDragStart,
  onDrop,
  onSelecionar,
  onAbrirPainel,
  onEditar,
  onAddSub,
  onAssumir,
  onConcluir,
  onDuplicar,
  onExcluir,
}: {
  estagio: Estagio;
  atual: boolean;
  sub?: boolean;
  selecionado: boolean;
  responsavel: string;
  arrastavel?: boolean;
  onDragStart?: () => void;
  onDrop?: () => void;
  onSelecionar: () => void;
  onAbrirPainel: () => void;
  onEditar: () => void;
  onAddSub?: () => void;
  onAssumir: () => void;
  onConcluir: () => void;
  onDuplicar: () => void;
  onExcluir: () => void;
}) {
  const situacao = situacaoEstagio(estagio, atual);
  // Sem cronograma alimentado, o percentual direto do estagio faz as vezes do
  // realizado na barra (RN-CRO-11).
  const realizado = estagio.valorRealizado ?? estagio.percentualRealizado;
  const desvio = desvioEstagio(estagio.valorMeta, realizado);
  const classes = [
    estilos.linha,
    atual ? estilos.linhaAtual : "",
    estagio.ativo ? "" : estilos.linhaInativa,
    sub ? estilos.linhaSub : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      draggable={arrastavel}
      onDragStart={onDragStart}
      onDragOver={(e) => arrastavel && e.preventDefault()}
      onDrop={onDrop}
    >
      <div className={estilos.topo}>
        {arrastavel && (
          <span className={estilos.arrasta} title="Arraste para reordenar">
            ⠿
          </span>
        )}
        <input
          type="checkbox"
          className={estilos.selecao}
          checked={selecionado}
          onChange={onSelecionar}
          aria-label={`Selecionar ${estagio.descricao}`}
        />
        <div className={estilos.corpo}>
          <div className={estilos.tituloLinha}>
            <span className={estilos.ordem}>{estagio.ordem + 1}</span>
            <button
              type="button"
              onClick={onAbrirPainel}
              className={
                sub
                  ? `${estilos.descricao} ${estilos.descricaoSub}`
                  : estilos.descricao
              }
            >
              {estagio.descricao}
            </button>
            <span className={`chip ${situacao.classe}`}>{situacao.titulo}</span>
          </div>

          <div className={estilos.meta}>
            <span>{sub ? "Subatividade" : "Estágio"}</span>
            <span>
              📅 {periodoEstagio(estagio.dataInicio, estagio.dataPrazo)}
            </span>
            <span>⏱ {duracaoEstagio(estagio.totalDias)}</span>
            <span>👤 {responsavel}</span>
          </div>

          <div className={estilos.avanco}>
            <span className={estilos.avancoItem}>
              <span className={estilos.avancoRotulo}>Meta</span>
              <span className={estilos.trilha}>
                <span
                  className={estilos.preenchimento}
                  style={{
                    width: larguraBarra(estagio.valorMeta),
                    background: "var(--sem-cinza)",
                  }}
                />
              </span>
              <span className={estilos.avancoValor}>
                {percentual(estagio.valorMeta)}%
              </span>
            </span>
            <span className={estilos.avancoItem}>
              <span className={estilos.avancoRotulo}>Real.</span>
              <span className={estilos.trilha}>
                <span
                  className={estilos.preenchimento}
                  style={{
                    width: larguraBarra(realizado),
                    background: corBarraRealizado(desvio.tom),
                  }}
                />
              </span>
              <span className={estilos.avancoValor}>
                {percentual(realizado)}%
              </span>
            </span>
            <span
              className={`${estilos.desvio} ${
                desvio.tom === "critico"
                  ? estilos.desvioCritico
                  : desvio.tom === "atencao"
                    ? estilos.desvioAtencao
                    : estilos.desvioPositivo
              }`}
            >
              {desvio.texto}
            </span>
          </div>
        </div>
      </div>

      <div className={estilos.acoesLinha}>
        {onAddSub && (
          <button
            type="button"
            className={`${estilos.acaoLinha} ${estilos.acaoAcento}`}
            onClick={onAddSub}
            title="Adicionar subatividade"
          >
            + sub
          </button>
        )}
        <button type="button" className={estilos.acaoLinha} onClick={onAssumir}>
          Assumir
        </button>
        {!estagio.concluido && (
          <button
            type="button"
            className={`${estilos.acaoLinha} ${estilos.acaoSucesso}`}
            onClick={onConcluir}
          >
            Concluir
          </button>
        )}
        <button
          type="button"
          className={estilos.acaoLinha}
          onClick={onDuplicar}
        >
          Duplicar
        </button>
        <button type="button" className={estilos.acaoLinha} onClick={onEditar}>
          Editar
        </button>
        <button
          type="button"
          className={`${estilos.acaoLinha} ${estilos.acaoPerigo}`}
          onClick={onExcluir}
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
