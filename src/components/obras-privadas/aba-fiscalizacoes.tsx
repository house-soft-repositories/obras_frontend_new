"use client";

import { useEffect, useState } from "react";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import {
  criarAuto,
  criarFiscalizacao,
  editarAuto,
  listarArquivos,
  listarAutosDaObra,
  listarFiscalizacoesDaObra,
  urlRelatorioFiscalizacao,
  type ArquivoPrivado,
  type AutoInfracao,
  type Fiscalizacao,
} from "@/lib/api/obras-privadas";
import {
  chipResultadoFiscalizacao,
  chipSituacaoAuto,
  chipTipoAuto,
  chipTipoFiscalizacao,
  rotuloEtapa,
  rotuloLocalEntulho,
  ORDEM_ETAPAS,
} from "@/lib/ui/obra-privada-labels";
import {
  contarPrazo,
  formatarDataCurta,
  formatarVolume,
  prazoEncerrado,
} from "@/lib/ui/prazo";
import { formatarMoeda } from "@/lib/ui/dinheiro";
import { useObraPrivada } from "./detalhe-shell";
import { GaleriaFotos, useUrlsDeArquivos } from "./galeria-fotos";
import { UploadArquivos } from "./upload-arquivos";
import styles from "./privadas.module.css";

const TIPOS_FISCALIZACAO = [
  "ROTINA",
  "DENUNCIA",
  "ENTULHO",
  "VERIFICACAO_ALVARA",
  "VISTORIA_HABITE_SE",
  "REINCIDENCIA",
];

const LOCAIS_ENTULHO = [
  "VIA_PUBLICA",
  "PASSEIO",
  "TERRENO_VIZINHO",
  "CANTEIRO",
  "AREA_PROTEGIDA",
];

/**
 * Aba Fiscalizações: visitas em campo e os autos lavrados.
 *
 * O bloco de entulho aparece APENAS no tipo ENTULHO — o backend rejeita esses
 * campos em outro tipo (RN-PRV-09), entao esconder na interface e o unico
 * comportamento coerente.
 */
export function AbaFiscalizacoes() {
  const { detalhe, recarregar } = useObraPrivada();
  const obraId = detalhe?.obra.id;

  const [visitas, setVisitas] = useState<Fiscalizacao[]>([]);
  const [autos, setAutos] = useState<AutoInfracao[]>([]);
  const [fotos, setFotos] = useState<ArquivoPrivado[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [formVisita, setFormVisita] = useState(false);
  const [formAuto, setFormAuto] = useState(false);

  const urls = useUrlsDeArquivos(fotos);

  useEffect(() => {
    if (!obraId) return;
    let vivo = true;
    Promise.all([
      listarFiscalizacoesDaObra(obraId),
      listarAutosDaObra(obraId),
      listarArquivos(obraId, { vinculo: "FISCALIZACAO", categoria: "FOTO" }),
    ])
      .then(([v, a, f]) => {
        if (!vivo) return;
        setVisitas(v);
        setAutos(a);
        setFotos(f);
        setErro(null);
      })
      .catch((e) => {
        if (vivo) setErro(mensagemErro(e));
      });
    return () => {
      vivo = false;
    };
  }, [obraId, versao]);

  function atualizar() {
    setVersao((v) => v + 1);
    recarregar();
  }

  if (!obraId) return null;

  return (
    <>
      {erro ? (
        <div className={styles.faixaErro} role="alert" style={{ marginTop: "1rem" }}>
          <span aria-hidden>⛔</span>
          <div>
            <p className={styles.faixaErroTexto}>{erro}</p>
          </div>
        </div>
      ) : null}

      <div className={styles.cabecalho} style={{ marginTop: "1rem" }}>
        <h2 className={styles.secaoTitulo}>Visitas de fiscalização</h2>
        <button
          type="button"
          className="btn-primario"
          style={{ marginLeft: "auto" }}
          onClick={() => setFormVisita((v) => !v)}
        >
          ＋ Nova fiscalização
        </button>
      </div>

      {formVisita ? (
        <FormFiscalizacao
          obraId={obraId}
          aoSalvar={() => {
            setFormVisita(false);
            atualizar();
          }}
          aoCancelar={() => setFormVisita(false)}
        />
      ) : null}

      {visitas.length === 0 && !formVisita ? (
        <div className={styles.vazio}>
          <div className={styles.vazioIcone} aria-hidden>
            🔎
          </div>
          <p className={styles.vazioTitulo}>Nenhuma visita registrada</p>
          <p className={styles.vazioTexto}>
            Registre a primeira fiscalização para acompanhar a etapa da obra.
          </p>
        </div>
      ) : (
        <div className={styles.pilha}>
          {visitas.map((v) => {
            const resultado = chipResultadoFiscalizacao(v.resultado);
            const tipo = chipTipoFiscalizacao(v.tipo);
            const fotosDaVisita = fotos.filter((f) => f.vinculoId === v.id);
            return (
              <div key={v.id} className={styles.cartaoVisita}>
                <div className={styles.visitaCabecalho}>
                  <span
                    className={styles.num}
                    style={{ fontSize: "0.92rem", fontWeight: 700 }}
                  >
                    {v.numero}
                  </span>
                  <span className={`chip ${resultado.tom}`}>
                    {resultado.rotulo}
                  </span>
                  <span className={`chip ${tipo.tom}`}>{tipo.rotulo}</span>
                  <a
                    className={styles.botaoFantasma}
                    style={{ marginLeft: "auto" }}
                    href={urlRelatorioFiscalizacao(v.id)}
                  >
                    ⤓ Relatório
                  </a>
                </div>

                <div className={styles.visitaMeta}>
                  <span className={styles.num}>
                    📅 {formatarDataCurta(v.dataFiscalizacao)}
                  </span>
                  <span>
                    🏗 Etapa constatada:{" "}
                    <strong style={{ color: "var(--cor-texto)" }}>
                      {rotuloEtapa(v.etapaConstatada)}
                    </strong>
                  </span>
                </div>

                {v.constatacoes ? (
                  <p className={styles.visitaTexto}>{v.constatacoes}</p>
                ) : null}
                {v.providencias ? (
                  <p className={styles.visitaTexto}>
                    <strong>Providências:</strong> {v.providencias}
                  </p>
                ) : null}

                {v.tipo === "ENTULHO" ? (
                  <div className={styles.blocoCondicional} style={{ marginTop: "0.8rem" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.85rem", margin: 0 }}>
                      Entulho e resíduos (CONAMA 307)
                    </p>
                    <div className={styles.gradeCamposCompacta}>
                      <div>
                        <div className="rotulo-campo">Há irregularidade</div>
                        <div className="valor-campo">
                          {v.entulhoHaIrregularidade === null
                            ? "—"
                            : v.entulhoHaIrregularidade
                              ? "Sim"
                              : "Não"}
                        </div>
                      </div>
                      <div>
                        <div className="rotulo-campo">Volume estimado</div>
                        <div className={`valor-campo ${styles.num}`}>
                          {formatarVolume(v.entulhoVolumeEstimadoM3)}
                        </div>
                      </div>
                      <div>
                        <div className="rotulo-campo">Local</div>
                        <div className="valor-campo">
                          {rotuloLocalEntulho(v.entulhoLocal)}
                        </div>
                      </div>
                      <div>
                        <div className="rotulo-campo">Caçamba</div>
                        <div className="valor-campo">
                          {v.entulhoPossuiCacamba === null
                            ? "—"
                            : v.entulhoPossuiCacamba
                              ? "Sim"
                              : "Não"}
                        </div>
                      </div>
                      <div>
                        <div className="rotulo-campo">PGRCC</div>
                        <div className="valor-campo">
                          {v.entulhoPossuiPgrcc === null
                            ? "—"
                            : v.entulhoPossuiPgrcc
                              ? "Sim"
                              : "Não"}
                        </div>
                      </div>
                      <div>
                        <div className="rotulo-campo">Destinação</div>
                        <div className="valor-campo">
                          {v.entulhoDestinacao ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {fotosDaVisita.length > 0 ? (
                  <div className={styles.miniaturas}>
                    {fotosDaVisita.slice(0, 6).map((f) => (
                      <span key={f.id} className={styles.miniatura}>
                        {urls[f.id] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={urls[f.id]}
                            alt={f.descricao ?? f.nome}
                            className={styles.fotoImagem}
                            loading="lazy"
                          />
                        ) : null}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div style={{ marginTop: "0.8rem" }}>
                  <UploadArquivos
                    obraId={obraId}
                    vinculo="FISCALIZACAO"
                    vinculoId={v.id}
                    categoria="FOTO"
                    titulo="Adicionar fotos desta visita"
                    ajuda="JPG ou PNG · as fotos entram no relatório desta fiscalização"
                    aoConcluir={atualizar}
                  />
                </div>

                {v.autos.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      gap: "0.45rem",
                      flexWrap: "wrap",
                      alignItems: "center",
                      marginTop: "0.75rem",
                      paddingTop: "0.7rem",
                      borderTop: "1px solid var(--cor-borda-sutil)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--cor-texto-fraco)",
                        fontWeight: 600,
                      }}
                    >
                      Autos gerados:
                    </span>
                    {v.autos.map((a) => (
                      <span key={a.id} className="chip chip-vermelho">
                        {a.numero} · {chipTipoAuto(a.tipo).rotulo}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------------- autos */}
      <div className={styles.cardSecao}>
        <div className={styles.cabecalho} style={{ marginBottom: "0.9rem" }}>
          <div>
            <p className={styles.cardTitulo} style={{ marginBottom: 0 }}>
              Autos e notificações
            </p>
            <p className={styles.cardSub} style={{ margin: "0.25rem 0 0" }}>
              Prazos contados em dias corridos a partir da emissão.
            </p>
          </div>
          <button
            type="button"
            className="btn-primario"
            style={{ marginLeft: "auto" }}
            onClick={() => setFormAuto((v) => !v)}
          >
            ＋ Lavrar auto
          </button>
        </div>

        {formAuto ? (
          <FormAuto
            obraId={obraId}
            visitas={visitas}
            aoSalvar={() => {
              setFormAuto(false);
              atualizar();
            }}
            aoCancelar={() => setFormAuto(false)}
          />
        ) : null}

        {autos.length === 0 ? (
          <div className={styles.vazio}>
            <p className={styles.vazioTitulo}>Nenhum auto lavrado</p>
            <p className={styles.vazioTexto}>
              Notificações, autos de infração, embargos e multas aparecem aqui.
            </p>
          </div>
        ) : (
          <div className={`${styles.molduraTabela} ${styles.soDesktop}`}>
            <table className={styles.tabelaInterna}>
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Tipo</th>
                  <th>Emissão</th>
                  <th>Prazo</th>
                  <th>Data limite</th>
                  <th>Multa</th>
                  <th>Situação</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {autos.map((a) => {
                  const prazo = contarPrazo(
                    a.dataLimite,
                    prazoEncerrado(a.situacao),
                  );
                  const tipo = chipTipoAuto(a.tipo);
                  const situacao = chipSituacaoAuto(a.situacao);
                  return (
                    <tr key={a.id}>
                      <td className={`${styles.num} ${styles.celulaForte}`}>
                        {a.numero}
                      </td>
                      <td>
                        <span className={`chip ${tipo.tom}`}>{tipo.rotulo}</span>
                      </td>
                      <td className={styles.num}>
                        {formatarDataCurta(a.dataEmissao)}
                      </td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {a.prazoDias === null ? "—" : `${a.prazoDias} dias`}
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
                        <span className={`chip ${situacao.tom}`}>
                          {situacao.rotulo}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {a.situacao === "ABERTO" ||
                        a.situacao === "EM_RECURSO" ? (
                          <button
                            type="button"
                            className={styles.botaoFantasma}
                            onClick={() => {
                              void editarAuto(obraId, a.id, {
                                situacao: "CUMPRIDO",
                                dataEncerramento: new Date()
                                  .toISOString()
                                  .slice(0, 10),
                              })
                                .then(atualizar)
                                .catch((e) => setErro(mensagemErro(e)));
                            }}
                          >
                            Encerrar
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Fallback mobile: a tabela de autos tem 8 colunas. */}
        {autos.length > 0 ? (
          <div className={`${styles.pilha} ${styles.soMobile}`}>
            {autos.map((a) => {
              const prazo = contarPrazo(a.dataLimite, prazoEncerrado(a.situacao));
              const tipo = chipTipoAuto(a.tipo);
              const situacao = chipSituacaoAuto(a.situacao);
              return (
                <div
                  key={a.id}
                  style={{
                    border: "1px solid var(--cor-borda-sutil)",
                    borderRadius: "10px",
                    padding: "0.8rem",
                    background: "var(--cor-superficie-sutil)",
                  }}
                >
                  <div className={styles.visitaCabecalho}>
                    <span className={`${styles.num} ${styles.celulaForte}`}>
                      {a.numero}
                    </span>
                    <span className={`chip ${situacao.tom}`}>
                      {situacao.rotulo}
                    </span>
                  </div>
                  <div style={{ marginTop: "0.45rem" }}>
                    <span className={`chip ${tipo.tom}`}>{tipo.rotulo}</span>
                  </div>
                  <div className={styles.cartaoLinhaPrimeira}>
                    <span className={styles.cartaoRotulo}>Multa</span>
                    <span className={`${styles.cartaoValor} ${styles.num}`}>
                      {a.valorMulta ? formatarMoeda(a.valorMulta) : "—"}
                    </span>
                  </div>
                  <div className={styles.cartaoLinha}>
                    <span className={styles.cartaoRotulo}>Data limite</span>
                    <span style={{ textAlign: "right" }}>
                      <span className={`${styles.cartaoValor} ${styles.num}`}>
                        {formatarDataCurta(a.dataLimite)}
                      </span>
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
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      {fotos.length > 0 ? (
        <div className={styles.cardSecao}>
          <p className={styles.cardTitulo}>Fotos das fiscalizações</p>
          <GaleriaFotos arquivos={fotos} urls={urls} />
        </div>
      ) : null}
    </>
  );
}

function FormFiscalizacao({
  obraId,
  aoSalvar,
  aoCancelar,
}: {
  obraId: string;
  aoSalvar: () => void;
  aoCancelar: () => void;
}) {
  const [form, setForm] = useState({
    tipo: "ROTINA",
    dataFiscalizacao: new Date().toISOString().slice(0, 10),
    resultado: "REGULAR",
    etapaConstatada: "",
    constatacoes: "",
    providencias: "",
    entulhoHaIrregularidade: "",
    entulhoVolumeEstimadoM3: "",
    entulhoLocal: "",
    entulhoPossuiCacamba: "",
    entulhoPossuiPgrcc: "",
    entulhoDestinacao: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const ehEntulho = form.tipo === "ENTULHO";

  function set(chave: keyof typeof form, valor: string) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  const booleano = (v: string) => (v === "" ? undefined : v === "true");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await criarFiscalizacao(obraId, {
        tipo: form.tipo,
        dataFiscalizacao: form.dataFiscalizacao,
        resultado: form.resultado,
        etapaConstatada: form.etapaConstatada || undefined,
        constatacoes: form.constatacoes.trim() || undefined,
        providencias: form.providencias.trim() || undefined,
        // Campos de entulho so viajam no tipo ENTULHO: o backend recusa (422)
        // em qualquer outro tipo.
        ...(ehEntulho
          ? {
              entulhoHaIrregularidade: booleano(form.entulhoHaIrregularidade),
              entulhoVolumeEstimadoM3:
                form.entulhoVolumeEstimadoM3 || undefined,
              entulhoLocal: form.entulhoLocal || undefined,
              entulhoPossuiCacamba: booleano(form.entulhoPossuiCacamba),
              entulhoPossuiPgrcc: booleano(form.entulhoPossuiPgrcc),
              entulhoDestinacao: form.entulhoDestinacao.trim() || undefined,
            }
          : {}),
      });
      aoSalvar();
    } catch (erroApi) {
      setErro(mensagemErro(erroApi));
      setSalvando(false);
    }
  }

  return (
    <form
      className={styles.card}
      onSubmit={enviar}
      style={{ marginTop: "0.85rem", borderTop: "3px solid var(--cor-acento)" }}
    >
      <p className={styles.cardTitulo}>Nova fiscalização</p>

      {erro ? (
        <div className={styles.faixaErro} role="alert">
          <span aria-hidden>⛔</span>
          <div>
            <p className={styles.faixaErroTexto}>{erro}</p>
          </div>
        </div>
      ) : null}

      <div className={styles.grade2}>
        <div>
          <label className={styles.rotuloForm}>Data *</label>
          <input
            type="date"
            value={form.dataFiscalizacao}
            onChange={(e) => set("dataFiscalizacao", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Tipo *</label>
          <select value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
            {TIPOS_FISCALIZACAO.map((t) => (
              <option key={t} value={t}>
                {chipTipoFiscalizacao(t).rotulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.rotuloForm}>Resultado *</label>
          <select
            value={form.resultado}
            onChange={(e) => set("resultado", e.target.value)}
          >
            <option value="REGULAR">Regular</option>
            <option value="IRREGULAR">Irregular</option>
            <option value="NAO_LOCALIZADA">Não localizada</option>
            <option value="SEM_ACESSO">Sem acesso</option>
          </select>
        </div>
        <div>
          <label className={styles.rotuloForm}>Etapa constatada</label>
          <select
            value={form.etapaConstatada}
            onChange={(e) => set("etapaConstatada", e.target.value)}
          >
            <option value="">Não informada</option>
            {ORDEM_ETAPAS.map((e) => (
              <option key={e} value={e}>
                {rotuloEtapa(e)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.larguraTotal}>
          <label className={styles.rotuloForm}>
            Constatações
            {form.resultado === "IRREGULAR" ? " *" : ""}
          </label>
          <textarea
            rows={4}
            value={form.constatacoes}
            onChange={(e) => set("constatacoes", e.target.value)}
            placeholder="Descreva o que foi constatado em campo…"
          />
        </div>
        <div className={styles.larguraTotal}>
          <label className={styles.rotuloForm}>Providências</label>
          <textarea
            rows={3}
            value={form.providencias}
            onChange={(e) => set("providencias", e.target.value)}
            placeholder="Providências adotadas ou determinadas…"
          />
        </div>
      </div>

      {ehEntulho ? (
        <div className={styles.blocoCondicional}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.55rem",
              flexWrap: "wrap",
              marginBottom: "0.35rem",
            }}
          >
            <span className={styles.badgeCondicional}>BLOCO CONDICIONAL</span>
            <span className={styles.blocoCondicionalNota}>
              exibido apenas quando Tipo = Entulho
            </span>
          </div>
          <p style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.8rem" }}>
            Entulho e resíduos
          </p>
          <div className={styles.grade2}>
            <div>
              <label className={styles.rotuloForm}>Há irregularidade?</label>
              <select
                value={form.entulhoHaIrregularidade}
                onChange={(e) => set("entulhoHaIrregularidade", e.target.value)}
              >
                <option value="">Não informado</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div>
              <label className={styles.rotuloForm}>Volume estimado (m³)</label>
              <input
                type="number"
                step="0.01"
                value={form.entulhoVolumeEstimadoM3}
                onChange={(e) => set("entulhoVolumeEstimadoM3", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className={styles.rotuloForm}>Local</label>
              <select
                value={form.entulhoLocal}
                onChange={(e) => set("entulhoLocal", e.target.value)}
              >
                <option value="">Não informado</option>
                {LOCAIS_ENTULHO.map((l) => (
                  <option key={l} value={l}>
                    {rotuloLocalEntulho(l)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={styles.rotuloForm}>Possui caçamba?</label>
              <select
                value={form.entulhoPossuiCacamba}
                onChange={(e) => set("entulhoPossuiCacamba", e.target.value)}
              >
                <option value="">Não informado</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div>
              <label className={styles.rotuloForm}>Possui PGRCC?</label>
              <select
                value={form.entulhoPossuiPgrcc}
                onChange={(e) => set("entulhoPossuiPgrcc", e.target.value)}
              >
                <option value="">Não informado</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>
            <div>
              <label className={styles.rotuloForm}>Destinação</label>
              <input
                value={form.entulhoDestinacao}
                onChange={(e) => set("entulhoDestinacao", e.target.value)}
                placeholder="Aterro licenciado / transportador…"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          justifyContent: "flex-end",
          marginTop: "1.1rem",
          paddingTop: "0.9rem",
          borderTop: "1px solid var(--cor-borda-sutil)",
        }}
      >
        <button type="button" className="btn-secundario" onClick={aoCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar fiscalização"}
        </button>
      </div>
    </form>
  );
}

function FormAuto({
  obraId,
  visitas,
  aoSalvar,
  aoCancelar,
}: {
  obraId: string;
  visitas: Fiscalizacao[];
  aoSalvar: () => void;
  aoCancelar: () => void;
}) {
  const [form, setForm] = useState({
    tipo: "NOTIFICACAO",
    fiscalizacaoId: "",
    dataEmissao: new Date().toISOString().slice(0, 10),
    prazoDias: "",
    baseLegal: "",
    descricao: "",
    valorMulta: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const exigeMulta = form.tipo === "MULTA";

  function set(chave: keyof typeof form, valor: string) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await criarAuto(obraId, {
        tipo: form.tipo,
        fiscalizacaoId: form.fiscalizacaoId || undefined,
        dataEmissao: form.dataEmissao,
        prazoDias: form.prazoDias ? Number(form.prazoDias) : undefined,
        baseLegal: form.baseLegal.trim() || undefined,
        descricao: form.descricao.trim(),
        valorMulta: form.valorMulta || undefined,
      });
      aoSalvar();
    } catch (erroApi) {
      setErro(mensagemErro(erroApi));
      setSalvando(false);
    }
  }

  return (
    <form
      onSubmit={enviar}
      style={{
        border: "1px solid var(--cor-acento-borda, #cfe4e1)",
        borderTop: "3px solid var(--cor-acento)",
        borderRadius: "var(--raio)",
        padding: "1.1rem",
        marginBottom: "0.9rem",
      }}
    >
      <p className={styles.cardTitulo}>Lavrar auto</p>

      {erro ? (
        <div className={styles.faixaErro} role="alert">
          <span aria-hidden>⛔</span>
          <div>
            <p className={styles.faixaErroTexto}>{erro}</p>
          </div>
        </div>
      ) : null}

      <div className={styles.grade2}>
        <div>
          <label className={styles.rotuloForm}>Tipo *</label>
          <select value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
            <option value="NOTIFICACAO">Notificação</option>
            <option value="AUTO_INFRACAO">Auto de infração</option>
            <option value="EMBARGO">Embargo (paralisa a obra)</option>
            <option value="INTERDICAO">Interdição (paralisa a obra)</option>
            <option value="MULTA">Multa</option>
          </select>
        </div>
        <div>
          <label className={styles.rotuloForm}>Fiscalização de origem</label>
          <select
            value={form.fiscalizacaoId}
            onChange={(e) => set("fiscalizacaoId", e.target.value)}
          >
            <option value="">Lavrado sem visita</option>
            {visitas.map((v) => (
              <option key={v.id} value={v.id}>
                {v.numero} · {formatarDataCurta(v.dataFiscalizacao)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.rotuloForm}>Data de emissão *</label>
          <input
            type="date"
            value={form.dataEmissao}
            onChange={(e) => set("dataEmissao", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Prazo (dias corridos)</label>
          <input
            type="number"
            value={form.prazoDias}
            onChange={(e) => set("prazoDias", e.target.value)}
            placeholder="15"
          />
        </div>
        {exigeMulta ? (
          <div>
            <label className={styles.rotuloForm}>Valor da multa (R$) *</label>
            <input
              value={form.valorMulta}
              onChange={(e) => set("valorMulta", e.target.value)}
              placeholder="12500.00"
              inputMode="decimal"
            />
          </div>
        ) : null}
        <div className={exigeMulta ? "" : styles.larguraTotal}>
          <label className={styles.rotuloForm}>Base legal</label>
          <input
            value={form.baseLegal}
            onChange={(e) => set("baseLegal", e.target.value)}
            placeholder="Art. 000 do Código de Obras"
          />
        </div>
        <div className={styles.larguraTotal}>
          <label className={styles.rotuloForm}>Descrição *</label>
          <textarea
            rows={3}
            value={form.descricao}
            onChange={(e) => set("descricao", e.target.value)}
            placeholder="Descreva a infração e a determinação…"
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          justifyContent: "flex-end",
          marginTop: "1rem",
        }}
      >
        <button type="button" className="btn-secundario" onClick={aoCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario" disabled={salvando}>
          {salvando ? "Salvando…" : "Lavrar auto"}
        </button>
      </div>
    </form>
  );
}
