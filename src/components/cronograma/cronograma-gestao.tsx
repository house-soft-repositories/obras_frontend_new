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
}: {
  obraId: string;
  estagiosIniciais: Estagio[];
  atualId: string | null;
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

  return (
    <section>
      {/* Barra de acoes */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {FILTROS_ESTAGIO.map((f) => (
          <button
            key={f.chave}
            type="button"
            onClick={() => trocarFiltro(f.chave)}
            style={{ fontWeight: filtro === f.chave ? 700 : 400 }}
          >
            {f.titulo}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <button type="button" onClick={() => setForm({ tipo: "criar", paiId: null })}>
          + Nova etapa
        </button>
        {estagios.length === 0 && (
          <button
            type="button"
            onClick={() => comApi(() => criarEstagiosPredefinidos(obraId))}
          >
            Criar estagios predefinidos
          </button>
        )}
        {selecionados.size > 0 && (
          <button
            type="button"
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

      {erro && <p style={{ color: "crimson" }}>{erro}</p>}

      {form && (
        <div style={{ marginBottom: 12 }}>
          <EstagioForm
            obraId={obraId}
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

      {arvore.length === 0 && <p>Nenhum estagio cadastrado.</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {arvore.map((raiz) => (
          <li key={raiz.id} style={{ marginBottom: 4 }}>
            <LinhaEstagio
              estagio={raiz}
              atual={raiz.id === atualId}
              selecionado={selecionados.has(raiz.id)}
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
            {raiz.subatividades.length > 0 && (
              <ul style={{ listStyle: "none", paddingLeft: 28, margin: 0 }}>
                {raiz.subatividades.map((sub) => (
                  <li key={sub.id} style={{ marginTop: 2 }}>
                    <LinhaEstagio
                      estagio={sub}
                      atual={false}
                      selecionado={selecionados.has(sub.id)}
                      onSelecionar={() => alternarSelecao(sub.id)}
                      onAbrirPainel={() => setPainel(sub)}
                      onEditar={() => setForm({ tipo: "editar", estagio: sub })}
                      onAssumir={() => comApi(() => assumirEstagio(obraId, sub.id))}
                      onConcluir={() => comApi(() => concluirEstagio(obraId, sub.id))}
                      onDuplicar={() => comApi(() => duplicarEstagio(obraId, sub.id))}
                      onExcluir={() => comApi(() => excluirEstagio(obraId, sub.id))}
                    />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {painel && (
        <PainelAcompanhamento key={painel.id} obraId={obraId} estagio={painel} />
      )}
    </section>
  );
}

function LinhaEstagio({
  estagio,
  atual,
  selecionado,
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
  selecionado: boolean;
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
  return (
    <div
      draggable={arrastavel}
      onDragStart={onDragStart}
      onDragOver={(e) => arrastavel && e.preventDefault()}
      onDrop={onDrop}
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        padding: "6px 8px",
        border: atual ? "2px solid #06c" : "1px solid #e2e2e2",
        borderRadius: 6,
        background: estagio.concluido ? "#eef7ee" : !estagio.ativo ? "#f3f3f3" : "#fff",
        opacity: estagio.ativo ? 1 : 0.7,
      }}
    >
      <input type="checkbox" checked={selecionado} onChange={onSelecionar} />
      {arrastavel && <span title="arraste para reordenar" style={{ cursor: "grab" }}>⠿</span>}
      <button
        type="button"
        onClick={onAbrirPainel}
        style={{
          flex: 1,
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: atual ? 700 : 400,
        }}
      >
        {estagio.descricao}
        {atual && <span style={{ color: "#06c", fontSize: 12 }}> — ATUAL</span>}
        {estagio.concluido && (
          <span style={{ color: "#2a8", fontSize: 12 }}> ✓ concluido</span>
        )}
        {!estagio.ativo && <span style={{ fontSize: 12 }}> (inativo)</span>}
        {estagio.dataInicio && (
          <span style={{ color: "#888", fontSize: 12 }}>
            {" "}
            {estagio.dataInicio} → {estagio.dataPrazo}
          </span>
        )}
      </button>
      <div style={{ display: "flex", gap: 4 }}>
        {onAddSub && (
          <button type="button" onClick={onAddSub} title="adicionar subatividade">
            + sub
          </button>
        )}
        <button type="button" onClick={onAssumir}>
          Assumir
        </button>
        {!estagio.concluido && (
          <button type="button" onClick={onConcluir}>
            Concluir
          </button>
        )}
        <button type="button" onClick={onDuplicar}>
          Duplicar
        </button>
        <button type="button" onClick={onEditar}>
          Editar
        </button>
        <button type="button" onClick={onExcluir}>
          Excluir
        </button>
      </div>
    </div>
  );
}
