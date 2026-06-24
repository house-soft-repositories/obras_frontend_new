"use client";

import { useCallback, useEffect, useState } from "react";
// nota: o carregamento inicial usa guarda `vivo` (padrao do repo, evita
// set-state-in-effect); `recarregar` e reutilizado pelos handlers de mutacao.
import {
  criarAcompanhamento,
  criarComentario,
  ErroApi,
  excluirAcompanhamento,
  listarAcompanhamentos,
  listarComentarios,
  TIPOS_VALOR,
  type Acompanhamento,
  type Comentario,
  type Estagio,
  type TipoValorAcompanhamento,
} from "@/lib/api/cronograma";
import { serieHistorico, unidadeEixo } from "@/lib/api/cronograma-visoes";

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

export function PainelAcompanhamento({
  obraId,
  estagio,
}: {
  obraId: string;
  estagio: Estagio;
}) {
  const [acomps, setAcomps] = useState<Acompanhamento[]>([]);
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const [dataReferencia, setDataReferencia] = useState("");
  const [tipoValor, setTipoValor] = useState<TipoValorAcompanhamento>(
    estagio.tipoValor ?? "PERCENTUAL",
  );
  const [valorMeta, setValorMeta] = useState("");
  const [valorRealizado, setValorRealizado] = useState("");
  const [texto, setTexto] = useState("");

  const recarregar = useCallback(async () => {
    const [a, c] = await Promise.all([
      listarAcompanhamentos(obraId, estagio.id),
      listarComentarios(obraId, estagio.id),
    ]);
    setAcomps(a);
    setComentarios(c);
  }, [obraId, estagio.id]);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      listarAcompanhamentos(obraId, estagio.id),
      listarComentarios(obraId, estagio.id),
    ])
      .then(([a, c]) => {
        if (!vivo) return;
        setAcomps(a);
        setComentarios(c);
      })
      .catch(() => vivo && setErro("Falha ao carregar acompanhamento"));
    return () => {
      vivo = false;
    };
  }, [obraId, estagio.id]);

  // O tipo de valor fica travado apos o primeiro lancamento (RN-CRO-14).
  const tipoTravado = estagio.tipoValor != null || acomps.length > 0;
  const tipoEfetivo = estagio.tipoValor ?? (acomps.length > 0 ? tipoValor : tipoValor);

  async function lancar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const metaInformada = valorMeta.trim() !== "";
    const realizadoInformado = valorRealizado.trim() !== "";
    if (!metaInformada && !realizadoInformado) {
      setErro("Informe meta ou realizado");
      return;
    }
    if (metaInformada && !Number.isFinite(Number(valorMeta))) {
      setErro("Meta deve ser numerica");
      return;
    }
    if (realizadoInformado && !Number.isFinite(Number(valorRealizado))) {
      setErro("Realizado deve ser numerico");
      return;
    }
    setEnviando(true);
    try {
      await criarAcompanhamento(obraId, estagio.id, {
        dataReferencia,
        tipoValor: tipoEfetivo,
        valorMeta: valorMeta || undefined,
        valorRealizado: valorRealizado || undefined,
      } as never);
      setValorMeta("");
      setValorRealizado("");
      await recarregar();
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  }

  async function comentar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await criarComentario(obraId, estagio.id, { texto });
      setTexto("");
      await recarregar();
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  }

  const serie = serieHistorico(acomps);
  const unidade = unidadeEixo(estagio.tipoValor ?? tipoEfetivo);
  const maxValor = Math.max(
    1,
    ...serie.flatMap((p) => [p.meta ?? 0, p.realizado ?? 0]),
  );

  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        border: "1px solid #ccd",
        borderRadius: 6,
        background: "#f6f8ff",
      }}
    >
      <h3 style={{ marginTop: 0 }}>
        Acompanhamento — {estagio.descricao}
        {estagio.tipoValor && (
          <span style={{ fontWeight: 400, fontSize: 13 }}>
            {" "}
            (tipo: {estagio.tipoValor})
          </span>
        )}
      </h3>

      {erro && <p style={{ color: "crimson" }}>{erro}</p>}

      <form
        onSubmit={lancar}
        style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "end" }}
      >
        <label style={{ display: "grid", fontSize: 13 }}>
          Data
          <input
            type="date"
            value={dataReferencia}
            onChange={(e) => setDataReferencia(e.target.value)}
            required
          />
        </label>
        <label style={{ display: "grid", fontSize: 13 }}>
          Tipo
          <select
            value={tipoEfetivo}
            onChange={(e) =>
              setTipoValor(e.target.value as TipoValorAcompanhamento)
            }
            disabled={tipoTravado}
          >
            {TIPOS_VALOR.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label style={{ display: "grid", fontSize: 13 }}>
          Meta
          <input
            type="number"
            value={valorMeta}
            onChange={(e) => setValorMeta(e.target.value)}
            placeholder="acumulado"
          />
        </label>
        <label style={{ display: "grid", fontSize: 13 }}>
          Realizado
          <input
            type="number"
            value={valorRealizado}
            onChange={(e) => setValorRealizado(e.target.value)}
            placeholder="so EM_DESENVOLVIMENTO"
          />
        </label>
        <button type="submit" disabled={enviando}>
          {enviando ? "Lancando..." : "Lancar"}
        </button>
      </form>

      {/* Historico Meta x Realizado (RN-CRO-17) */}
      {serie.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong style={{ fontSize: 13 }}>Historico ({unidade})</strong>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Data</th>
                <th style={{ textAlign: "left" }}>Meta</th>
                <th style={{ textAlign: "left" }}>Realizado</th>
                <th>Evolucao</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {acomps
                .slice()
                .sort((a, b) => a.dataReferencia.localeCompare(b.dataReferencia))
                .map((a) => {
                  const meta = a.valorMeta != null ? Number(a.valorMeta) : 0;
                  const real =
                    a.valorRealizado != null ? Number(a.valorRealizado) : 0;
                  return (
                    <tr key={a.id}>
                      <td>{a.dataReferencia}</td>
                      <td>{a.valorMeta ?? "—"}</td>
                      <td>{a.valorRealizado ?? "—"}</td>
                      <td style={{ width: 160 }}>
                        <div style={{ background: "#eee", height: 6 }}>
                          <div
                            style={{
                              width: `${(meta / maxValor) * 100}%`,
                              height: 3,
                              background: "#06c",
                            }}
                          />
                          <div
                            style={{
                              width: `${(real / maxValor) * 100}%`,
                              height: 3,
                              background: "#2a8",
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            excluirAcompanhamento(obraId, estagio.id, a.id)
                              .then(recarregar)
                              .catch((e) => setErro(mensagemErro(e)))
                          }
                        >
                          x
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}

      {/* Comentarios (RN-CRO-17) */}
      <div style={{ marginTop: 12 }}>
        <strong style={{ fontSize: 13 }}>Comentarios</strong>
        <ul style={{ margin: "4px 0", paddingLeft: 18, fontSize: 13 }}>
          {comentarios.map((c) => (
            <li key={c.id}>{c.texto}</li>
          ))}
        </ul>
        <form onSubmit={comentar} style={{ display: "flex", gap: 6 }}>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Comentar..."
            style={{ flex: 1 }}
            required
          />
          <button type="submit" disabled={enviando}>
            Comentar
          </button>
        </form>
      </div>
    </div>
  );
}
