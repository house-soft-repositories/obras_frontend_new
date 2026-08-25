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
import { formatarValorAcompanhamento } from "@/lib/api/cronograma-visoes";
import { desvioEstagio } from "@/lib/ui/cronograma-estagio";
import { formatarData, formatarDataHora } from "@/lib/ui/datas";
import type { UsuarioResumo } from "@/lib/ui/usuario-labels";
import estilos from "./acompanhamento.module.css";

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

/** Chip do Realizado: tom pelo desvio contra a meta do mesmo lancamento. */
function classeChipRealizado(
  meta: string | null,
  realizado: string | null,
): string {
  if (realizado === null) return "chip-cinza";
  const { tom } = desvioEstagio(meta, realizado);
  if (tom === "critico") return "chip-vermelho";
  if (tom === "atencao") return "chip-ambar";
  return "chip-verde";
}

export function PainelAcompanhamento({
  obraId,
  estagio,
  usuarios = [],
}: {
  obraId: string;
  estagio: Estagio;
  usuarios?: UsuarioResumo[];
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
  const tipoEfetivo = estagio.tipoValor ?? tipoValor;

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

  const lancamentos = [...acomps].sort((a, b) =>
    a.dataReferencia.localeCompare(b.dataReferencia),
  );
  const nomeAutor = (id: string) =>
    usuarios.find((u) => u.id === id)?.nome ?? "Usuário";

  return (
    <div className={estilos.painel}>
      <div className={estilos.cabecalho}>
        <div>
          <h3 className={estilos.titulo}>Acompanhamento · Meta × Realizado</h3>
          <p className={estilos.sub}>
            {estagio.descricao}
            {estagio.tipoValor
              ? ` · tipo de valor: ${estagio.tipoValor} (travado)`
              : " · tipo de valor definido no primeiro lançamento"}
          </p>
        </div>
      </div>

      {erro && <p className={estilos.erro}>{erro}</p>}

      <form onSubmit={lancar} className={estilos.formulario}>
        <label className={estilos.campo}>
          Data de referência
          <input
            type="date"
            value={dataReferencia}
            onChange={(e) => setDataReferencia(e.target.value)}
            required
          />
        </label>
        <label className={estilos.campo}>
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
        <label className={estilos.campo}>
          Meta
          <input
            type="number"
            value={valorMeta}
            onChange={(e) => setValorMeta(e.target.value)}
            placeholder="acumulado"
          />
        </label>
        <label className={estilos.campo}>
          Realizado
          <input
            type="number"
            value={valorRealizado}
            onChange={(e) => setValorRealizado(e.target.value)}
            placeholder="só EM_DESENVOLVIMENTO"
          />
        </label>
        <button type="submit" className="btn-primario" disabled={enviando}>
          {enviando ? "Lançando..." : "＋ Lançar acompanhamento"}
        </button>
      </form>

      {/* Historico Meta x Realizado (RN-CRO-17) */}
      <div className={estilos.tabelaEnvolucro}>
        <table className={estilos.tabela}>
          <thead>
            <tr>
              <th>Data de referência</th>
              <th>Meta</th>
              <th>Realizado</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {lancamentos.length === 0 && (
              <tr>
                <td colSpan={4}>Nenhum lançamento registrado.</td>
              </tr>
            )}
            {lancamentos.map((a) => (
              <tr key={a.id}>
                <td className={estilos.num}>
                  {formatarData(a.dataReferencia)}
                </td>
                <td className={estilos.num} style={{ fontWeight: 600 }}>
                  {formatarValorAcompanhamento(a.valorMeta, tipoEfetivo)}
                </td>
                <td>
                  <span
                    className={`chip ${classeChipRealizado(
                      a.valorMeta,
                      a.valorRealizado,
                    )}`}
                  >
                    {formatarValorAcompanhamento(a.valorRealizado, tipoEfetivo)}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    type="button"
                    className={estilos.acaoIcone}
                    title="Excluir lançamento"
                    onClick={() =>
                      excluirAcompanhamento(obraId, estagio.id, a.id)
                        .then(recarregar)
                        .catch((e) => setErro(mensagemErro(e)))
                    }
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comentarios (RN-CRO-17) */}
      <div className={estilos.secao}>Comentários</div>
      <div className={estilos.comentarios}>
        {comentarios.length === 0 && (
          <p className={estilos.vazio}>Nenhum comentário neste estágio.</p>
        )}
        {comentarios.map((c) => (
          <div key={c.id} className={estilos.comentario}>
            <div className={estilos.comentarioTopo}>
              <span className={estilos.comentarioAutor}>
                {nomeAutor(c.autorUsuarioId)}
              </span>
              <span className={estilos.comentarioData}>
                {formatarDataHora(c.criadoEm)}
              </span>
            </div>
            <p className={estilos.comentarioTexto}>{c.texto}</p>
          </div>
        ))}
      </div>
      <form onSubmit={comentar} className={estilos.novoComentario}>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva um comentário…"
          aria-label="Novo comentário"
          required
        />
        <button type="submit" className="btn-primario" disabled={enviando}>
          Enviar
        </button>
      </form>
    </div>
  );
}
