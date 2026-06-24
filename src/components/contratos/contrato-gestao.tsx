"use client";

import { useCallback, useEffect, useState } from "react";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import {
  excluirAditivo,
  excluirParalisacao,
  listarAditivos,
  listarParalisacoes,
  obterPrazoFinal,
  obterValores,
  TIPOS_ADITIVO,
  type Aditivo,
  type Contrato,
  type Paralisacao,
  type PrazoFinalExecucao,
  type ValoresContrato,
} from "@/lib/api/contratos";
import { AditivoForm } from "./aditivo-form";
import { ContratoForm } from "./contrato-form";
import { ParalisacaoForm } from "./paralisacao-form";
import { ReinicioForm } from "./reinicio-form";

function rotuloTipo(tipo: string): string {
  return TIPOS_ADITIVO.find((t) => t.chave === tipo)?.titulo ?? tipo;
}

/**
 * Guia Contrato da obra (E4-05/E4-06): formulario do contrato, secoes de
 * Aditivos e Paralisacoes e os destaques de Prazo Final de Execucao (RN-CON-01)
 * e Valor Total Contratado (RN-CON-13), recarregados apos cada lancamento
 * (RN-CON-10). Acoes de escrita escondidas para CONSULTA.
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
  opcoesFonte: OpcaoSelect[];
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
  const [paralisacoes, setParalisacoes] = useState<Paralisacao[]>(
    paralisacoesIniciais,
  );
  const [prazo, setPrazo] = useState<PrazoFinalExecucao | null>(prazoInicial);
  const [valores, setValores] = useState<ValoresContrato | null>(valoresIniciais);

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
      setErro("Falha ao excluir paralisacao");
    }
  }

  return (
    <section style={{ display: "grid", gap: 24 }}>
      {/* Destaques: prazo final e valor total */}
      {contrato && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={cartao}>
            <span style={rotulo}>Prazo Final de Execucao</span>
            <strong style={{ fontSize: 22 }}>
              {prazo?.prazoFinal ?? "—"}
            </strong>
            {prazo && (
              <span style={{ color: "#666", fontSize: 12 }}>
                {prazo.totalDias} dias (base {prazo.diasBase} + paralisacoes{" "}
                {prazo.diasParalisacoes} + aditivos {prazo.diasAditivos})
              </span>
            )}
          </div>
          <div style={cartao}>
            <span style={rotulo}>Valor Total Contratado</span>
            <strong style={{ fontSize: 22 }}>
              R$ {valores?.total ?? "—"}
            </strong>
            {valores && (
              <span style={{ color: "#666", fontSize: 12 }}>
                inicial R$ {valores.contratadoInicial} + aditivado R${" "}
                {valores.aditivado}
              </span>
            )}
          </div>
        </div>
      )}

      {erro && <p style={{ color: "crimson" }}>{erro}</p>}

      {/* Contrato */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ margin: 0 }}>Contrato</h2>
          {contrato && podeEditar && !editandoContrato && (
            <button type="button" onClick={() => setEditandoContrato(true)}>
              Editar
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
          <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 12px" }}>
            <dt>Numero</dt>
            <dd>{contrato.numero}</dd>
            <dt>Objeto</dt>
            <dd>{contrato.objeto ?? "—"}</dd>
            <dt>Data O.S.</dt>
            <dd>{contrato.dataOs}</dd>
            <dt>Prazo</dt>
            <dd>
              {contrato.tipoPrazoExecucao === "DIAS"
                ? `${contrato.prazoExecucaoDias} dias`
                : contrato.prazoExecucaoData}
            </dd>
            <dt>Valor inicial</dt>
            <dd>R$ {contrato.valorContratadoInicial}</dd>
          </dl>
        ) : (
          !podeEditar && <p>Nenhum contrato cadastrado.</p>
        )}
      </div>

      {/* Aditivos */}
      {contrato && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ margin: 0 }}>Aditivos</h2>
            {podeEditar && !novoAditivo && (
              <button type="button" onClick={() => setNovoAditivo(true)}>
                + Novo aditivo
              </button>
            )}
          </div>
          {novoAditivo && podeEditar && (
            <div style={{ marginTop: 8 }}>
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
            <p>Nenhum aditivo.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {aditivos.map((a) => (
                <li key={a.id} style={linha}>
                  <span>
                    <strong>#{a.numero}</strong> — {rotuloTipo(a.tipo)}
                    {a.dataAssinatura ? ` (${a.dataAssinatura})` : ""}
                  </span>
                  {podeEditar && (
                    <button type="button" onClick={() => removerAditivo(a.id)}>
                      Excluir
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Paralisacoes */}
      {contrato && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{ margin: 0 }}>Paralisacoes</h2>
            {podeEditar && !novaParalisacao && (
              <button type="button" onClick={() => setNovaParalisacao(true)}>
                + Registrar paralisacao
              </button>
            )}
          </div>
          {novaParalisacao && podeEditar && (
            <div style={{ marginTop: 8 }}>
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
            <p>Nenhuma paralisacao.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {paralisacoes.map((p) => {
                const aberta = !p.dataReinicio && p.diasParados == null;
                return (
                  <li key={p.id} style={{ ...linha, flexWrap: "wrap" }}>
                    <span>
                      {p.dataParalisacao} — {p.motivo}{" "}
                      {aberta ? (
                        <em style={{ color: "#a60" }}>(em aberto)</em>
                      ) : (
                        <em style={{ color: "#2a8" }}>
                          (reiniciada
                          {p.dataReinicio ? ` em ${p.dataReinicio}` : ""}
                          {p.diasParados != null
                            ? `, ${p.diasParados} dias`
                            : ""}
                          )
                        </em>
                      )}
                    </span>
                    {podeEditar && (
                      <span style={{ display: "flex", gap: 6 }}>
                        {aberta && (
                          <button
                            type="button"
                            onClick={() =>
                              setReinicioDe(reinicioDe === p.id ? null : p.id)
                            }
                          >
                            Reinicio
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removerParalisacao(p.id)}
                        >
                          Excluir
                        </button>
                      </span>
                    )}
                    {reinicioDe === p.id && podeEditar && (
                      <div style={{ width: "100%" }}>
                        <ReinicioForm
                          contratoId={contrato.id}
                          paralisacaoId={p.id}
                          onSalvo={async () => {
                            setReinicioDe(null);
                            await recarregarAgregados();
                          }}
                          onCancelar={() => setReinicioDe(null)}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

const cartao: React.CSSProperties = {
  display: "grid",
  gap: 4,
  padding: 16,
  border: "1px solid #ddd",
  borderRadius: 8,
  minWidth: 240,
};
const rotulo: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  color: "#888",
};
const linha: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 8,
  padding: "8px 0",
  borderBottom: "1px solid #eee",
};
