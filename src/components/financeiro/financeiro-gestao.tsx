"use client";

import { useState } from "react";
import type { OpcaoSelect } from "@/components/obras/obra-form";
import {
  criarEmpenho,
  criarLiquidacao,
  criarPagamento,
  excluirEmpenho,
  excluirLiquidacao,
  excluirPagamento,
  filtrarLiquidacoesPorEmpenho,
  indicadoresVisao,
  listarEmpenhos,
  listarLiquidacoes,
  listarPagamentos,
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

function fonteNome(opcoes: OpcaoSelect[], id: string): string {
  return opcoes.find((o) => o.id === id)?.nome ?? id;
}

const empenhoVazio = (): FormularioEmpenho => ({
  fonteId: "", tipo: "", numero: "", dataEmpenho: "", valor: "", observacoes: "",
});
const liquidacaoVazia = (): FormularioLiquidacao => ({
  empenhoId: "", fonteId: "", numero: "", dataLiquidacao: "", valor: "", observacoes: "",
});
const pagamentoVazio = (): FormularioPagamento => ({
  empenhoId: "", liquidacaoId: "", fonteId: "", numeroOrdemBancaria: "",
  dataOrdemBancaria: "", valor: "", observacoes: "",
});

/**
 * Pagina Financeiro da obra (E6-05): visao fisico-financeira (cards + grafico),
 * e secoes de Empenhos, Liquidacoes e Pagamentos (selects encadeados). Acoes de
 * escrita ocultas para CONSULTA.
 */
export function FinanceiroGestao({
  obraId,
  opcoesFonte,
  empenhosIniciais,
  liquidacoesIniciais,
  pagamentosIniciais,
  visaoInicial,
  podeEditar,
}: {
  obraId: string;
  opcoesFonte: OpcaoSelect[];
  empenhosIniciais: Empenho[];
  liquidacoesIniciais: Liquidacao[];
  pagamentosIniciais: Pagamento[];
  visaoInicial: VisaoFisicoFinanceira | null;
  podeEditar: boolean;
}) {
  const [empenhos, setEmpenhos] = useState(empenhosIniciais);
  const [liquidacoes, setLiquidacoes] = useState(liquidacoesIniciais);
  const [pagamentos, setPagamentos] = useState(pagamentosIniciais);
  const [visao, setVisao] = useState(visaoInicial);

  const [fe, setFe] = useState<FormularioEmpenho>(empenhoVazio());
  const [fl, setFl] = useState<FormularioLiquidacao>(liquidacaoVazia());
  const [fp, setFp] = useState<FormularioPagamento>(pagamentoVazio());
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
      await recarregar();
    } catch {
      setErros(["Falha ao salvar liquidacao (soma excede o empenho?)"]);
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
      await recarregar();
    } catch {
      setErros(["Falha ao salvar pagamento (medicao ausente ou soma excede a liquidacao?)"]);
    }
  }

  const liquidacoesDoEmpenho = filtrarLiquidacoesPorEmpenho(
    liquidacoes,
    fp.empenhoId,
  );

  return (
    <section style={{ display: "grid", gap: 32 }}>
      {/* Visao fisico-financeira */}
      {visao && (
        <div>
          <h2 style={{ margin: "0 0 8px" }}>Visao Fisico-Financeira</h2>
          <div style={{ display: "grid", gap: 6, maxWidth: 640 }}>
            {indicadoresVisao(visao).map(({ chave, titulo, indicador }) => (
              <div key={chave} style={{ display: "grid", gridTemplateColumns: "160px 1fr 120px", alignItems: "center", gap: 8 }}>
                <span>{titulo}</span>
                <div style={{ background: "#eee", borderRadius: 4, height: 16 }}>
                  <div
                    style={{
                      width: `${Math.min(indicador.percentual, 100)}%`,
                      background: "#2563eb",
                      height: 16,
                      borderRadius: 4,
                    }}
                  />
                </div>
                <span style={{ textAlign: "right" }}>
                  R$ {indicador.valor} ({indicador.percentual}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {erros.length > 0 && (
        <ul style={{ color: "#b00", margin: 0 }}>
          {erros.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
      {alerta && <p style={{ color: "#b45309" }}>{alerta}</p>}

      {/* Empenhos */}
      <div>
        <h2 style={{ margin: "0 0 8px" }}>Empenhos</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>Numero</th><th>Tipo</th><th>Data</th><th>Fonte</th><th>Valor</th>{podeEditar && <th></th>}
            </tr>
          </thead>
          <tbody>
            {empenhos.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td>{e.numero}</td><td>{e.tipo}</td><td>{e.dataEmpenho}</td>
                <td>{fonteNome(opcoesFonte, e.fonteId)}</td><td>R$ {e.valor}</td>
                {podeEditar && (
                  <td>
                    <button type="button" onClick={async () => { if (window.confirm("Excluir empenho?")) { await excluirEmpenho(obraId, e.id); await recarregar(); } }}>
                      excluir
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {podeEditar && (
          <form onSubmit={(ev) => { ev.preventDefault(); void salvarEmpenho(); }} style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <select value={fe.tipo} onChange={(e) => setFe({ ...fe, tipo: e.target.value as FormularioEmpenho["tipo"] })}>
              <option value="">— tipo —</option>
              {TIPOS_EMPENHO.map((t) => <option key={t.chave} value={t.chave}>{t.titulo}</option>)}
            </select>
            <select value={fe.fonteId} onChange={(e) => setFe({ ...fe, fonteId: e.target.value })}>
              <option value="">— fonte —</option>
              {opcoesFonte.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
            <input placeholder="numero" value={fe.numero} onChange={(e) => setFe({ ...fe, numero: e.target.value })} />
            <input type="date" value={fe.dataEmpenho} onChange={(e) => setFe({ ...fe, dataEmpenho: e.target.value })} />
            <input type="number" step="0.01" placeholder="valor" value={fe.valor} onChange={(e) => setFe({ ...fe, valor: e.target.value })} />
            <button type="submit">+ Empenho</button>
          </form>
        )}
      </div>

      {/* Liquidacoes */}
      <div>
        <h2 style={{ margin: "0 0 8px" }}>Liquidacoes</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>Numero</th><th>Empenho</th><th>Data</th><th>Fonte</th><th>Valor</th>{podeEditar && <th></th>}
            </tr>
          </thead>
          <tbody>
            {liquidacoes.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td>{l.numero}</td>
                <td>{empenhos.find((e) => e.id === l.empenhoId)?.numero ?? l.empenhoId}</td>
                <td>{l.dataLiquidacao}</td><td>{fonteNome(opcoesFonte, l.fonteId)}</td><td>R$ {l.valor}</td>
                {podeEditar && (
                  <td>
                    <button type="button" onClick={async () => { if (window.confirm("Excluir liquidacao?")) { await excluirLiquidacao(obraId, l.id); await recarregar(); } }}>
                      excluir
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {podeEditar && (
          <form onSubmit={(ev) => { ev.preventDefault(); void salvarLiquidacao(); }} style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <select value={fl.empenhoId} onChange={(e) => setFl({ ...fl, empenhoId: e.target.value })}>
              <option value="">— empenho —</option>
              {empenhos.map((e) => <option key={e.id} value={e.id}>{e.numero} (R$ {e.valor})</option>)}
            </select>
            <select value={fl.fonteId} onChange={(e) => setFl({ ...fl, fonteId: e.target.value })}>
              <option value="">— fonte —</option>
              {opcoesFonte.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
            <input placeholder="numero" value={fl.numero} onChange={(e) => setFl({ ...fl, numero: e.target.value })} />
            <input type="date" value={fl.dataLiquidacao} onChange={(e) => setFl({ ...fl, dataLiquidacao: e.target.value })} />
            <input type="number" step="0.01" placeholder="valor" value={fl.valor} onChange={(e) => setFl({ ...fl, valor: e.target.value })} />
            <button type="submit">+ Liquidacao</button>
          </form>
        )}
      </div>

      {/* Pagamentos */}
      <div>
        <h2 style={{ margin: "0 0 8px" }}>Pagamentos</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
              <th>O.B.</th><th>Empenho</th><th>Liquidacao</th><th>Data</th><th>Valor</th>{podeEditar && <th></th>}
            </tr>
          </thead>
          <tbody>
            {pagamentos.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td>{p.numeroOrdemBancaria}</td>
                <td>{empenhos.find((e) => e.id === p.empenhoId)?.numero ?? p.empenhoId}</td>
                <td>{liquidacoes.find((l) => l.id === p.liquidacaoId)?.numero ?? p.liquidacaoId}</td>
                <td>{p.dataOrdemBancaria}</td><td>R$ {p.valor}</td>
                {podeEditar && (
                  <td>
                    <button type="button" onClick={async () => { if (window.confirm("Excluir pagamento?")) { await excluirPagamento(obraId, p.id); await recarregar(); } }}>
                      excluir
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {podeEditar && (
          <form onSubmit={(ev) => { ev.preventDefault(); void salvarPagamento(); }} style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            <select value={fp.empenhoId} onChange={(e) => setFp({ ...fp, empenhoId: e.target.value, liquidacaoId: "" })}>
              <option value="">— empenho —</option>
              {empenhos.map((e) => <option key={e.id} value={e.id}>{e.numero}</option>)}
            </select>
            <select value={fp.liquidacaoId} onChange={(e) => setFp({ ...fp, liquidacaoId: e.target.value })} disabled={!fp.empenhoId}>
              <option value="">— liquidacao —</option>
              {liquidacoesDoEmpenho.map((l) => <option key={l.id} value={l.id}>{l.numero} (R$ {l.valor})</option>)}
            </select>
            <select value={fp.fonteId} onChange={(e) => setFp({ ...fp, fonteId: e.target.value })}>
              <option value="">— fonte —</option>
              {opcoesFonte.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
            </select>
            <input placeholder="numero O.B." value={fp.numeroOrdemBancaria} onChange={(e) => setFp({ ...fp, numeroOrdemBancaria: e.target.value })} />
            <input type="date" value={fp.dataOrdemBancaria} onChange={(e) => setFp({ ...fp, dataOrdemBancaria: e.target.value })} />
            <input type="number" step="0.01" placeholder="valor" value={fp.valor} onChange={(e) => setFp({ ...fp, valor: e.target.value })} />
            <button type="submit">+ Pagamento</button>
          </form>
        )}
      </div>
    </section>
  );
}
