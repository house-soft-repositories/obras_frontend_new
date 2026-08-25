"use client";

import { useEffect, useState } from "react";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import {
  criarAlvara,
  criarHabiteSe,
  listarAlvaras,
  listarHabiteSe,
  type Alvara,
  type HabiteSe,
} from "@/lib/api/obras-privadas";
import {
  chipSituacaoRegistroAlvara,
  rotuloMotivoAlvara,
  rotuloTipoAlvara,
  rotuloUso,
} from "@/lib/ui/obra-privada-labels";
import {
  contarValidadeAlvara,
  formatarArea,
  formatarDataCurta,
} from "@/lib/ui/prazo";
import { useObraPrivada } from "./detalhe-shell";
import styles from "./privadas.module.css";

const TIPOS_ALVARA = [
  "CONSTRUCAO",
  "REFORMA",
  "AMPLIACAO",
  "DEMOLICAO",
  "REGULARIZACAO",
  "MURO_TAPUME",
];

const USOS = [
  "RESIDENCIAL_UNIFAMILIAR",
  "RESIDENCIAL_MULTIFAMILIAR",
  "COMERCIAL",
  "INDUSTRIAL",
  "MISTO",
  "OUTRO",
];

/**
 * Aba Licenciamento: alvarás (com o vigente em destaque e o histórico de
 * revalidações) e habite-se.
 *
 * O estado "obra sem alvará registrado" NAO e um vazio neutro: e um alerta
 * vermelho com duas acoes, porque executar sem alvara e a irregularidade que o
 * modulo existe para pegar.
 */
export function AbaLicenciamento() {
  const { detalhe, recarregar } = useObraPrivada();
  const obraId = detalhe?.obra.id;

  const [alvaras, setAlvaras] = useState<Alvara[]>([]);
  const [habiteSe, setHabiteSe] = useState<HabiteSe[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);
  const [formAlvara, setFormAlvara] = useState(false);
  const [formHabite, setFormHabite] = useState(false);

  useEffect(() => {
    if (!obraId) return;
    let vivo = true;
    Promise.all([listarAlvaras(obraId), listarHabiteSe(obraId)])
      .then(([a, h]) => {
        if (!vivo) return;
        setAlvaras(a);
        setHabiteSe(h);
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

  const vigente = alvaras.find((a) => a.situacao === "VIGENTE") ?? null;
  const historico = alvaras.filter((a) => a.id !== vigente?.id);
  const validade = contarValidadeAlvara(vigente?.dataValidade);

  return (
    <>
      {erro ? (
        <div className={styles.faixaErro} role="alert" style={{ marginTop: "1rem" }}>
          <span aria-hidden>⛔</span>
          <div>
            <p className={styles.faixaErroTitulo}>Falha ao carregar</p>
            <p className={styles.faixaErroTexto}>{erro}</p>
          </div>
        </div>
      ) : null}

      <div className={styles.cabecalho} style={{ marginTop: "1rem" }}>
        <h2 className={styles.secaoTitulo}>Alvarás</h2>
        <button
          type="button"
          className="btn-primario"
          style={{ marginLeft: "auto" }}
          onClick={() => setFormAlvara((v) => !v)}
        >
          ＋ Registrar alvará
        </button>
      </div>

      {formAlvara ? (
        <FormAlvara
          obraId={obraId}
          alvaras={alvaras}
          aoSalvar={() => {
            setFormAlvara(false);
            atualizar();
          }}
          aoCancelar={() => setFormAlvara(false)}
        />
      ) : null}

      {!vigente ? (
        <div className={styles.alertaGrave} role="alert">
          <div className={styles.alertaGraveIcone} aria-hidden>
            ⚠️
          </div>
          <p className={styles.alertaGraveTitulo}>Obra sem alvará registrado</p>
          <p className={styles.alertaGraveTexto}>
            A execução sem alvará de construção sujeita o proprietário a
            notificação, embargo e multa. Registre o alvará ou lavre o auto
            correspondente.
          </p>
          <div className={styles.alertaGraveAcoes}>
            <button
              type="button"
              className="btn-primario"
              onClick={() => setFormAlvara(true)}
            >
              ＋ Registrar alvará
            </button>
            <a
              className="btn-perigo"
              href={`/obras-privadas/${obraId}/fiscalizacoes`}
            >
              Lavrar auto
            </a>
          </div>
        </div>
      ) : (
        <div className={styles.cardVigente}>
          <div className={styles.cabecalho}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <span
                  className={styles.num}
                  style={{ fontSize: "1.1rem", fontWeight: 700 }}
                >
                  Alvará nº {vigente.numero}/{vigente.ano}
                </span>
                <span className="chip chip-verde">Alvará vigente</span>
              </div>
              <p className={styles.proprietarioLinha}>
                {rotuloTipoAlvara(vigente.tipo)} · uso{" "}
                {rotuloUso(vigente.uso).toLowerCase()}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="rotulo-campo">Validade</div>
              <div className={styles.indicadorValor}>
                {formatarDataCurta(vigente.dataValidade)}
              </div>
              {validade.rotulo ? (
                <span
                  className={
                    validade.vencido
                      ? styles.pillValidadeVencida
                      : styles.pillValidade
                  }
                >
                  {validade.rotulo}
                </span>
              ) : null}
            </div>
          </div>

          <div className={styles.gradeCamposCompacta}>
            <div>
              <div className="rotulo-campo">Tipo</div>
              <div className="valor-campo">{rotuloTipoAlvara(vigente.tipo)}</div>
            </div>
            <div>
              <div className="rotulo-campo">Emissão</div>
              <div className={`valor-campo ${styles.num}`}>
                {formatarDataCurta(vigente.dataEmissao)}
              </div>
            </div>
            <div>
              <div className="rotulo-campo">Uso</div>
              <div className="valor-campo">{rotuloUso(vigente.uso)}</div>
            </div>
            <div>
              <div className="rotulo-campo">Área do terreno</div>
              <div className={`valor-campo ${styles.num}`}>
                {formatarArea(vigente.areaTerrenoM2)}
              </div>
            </div>
            <div>
              <div className="rotulo-campo">Área aprovada</div>
              <div className={`valor-campo ${styles.num}`}>
                {formatarArea(vigente.areaConstruidaAprovadaM2)}
              </div>
            </div>
            <div>
              <div className="rotulo-campo">Pavimentos</div>
              <div className={`valor-campo ${styles.num}`}>
                {vigente.pavimentos ?? "—"}
              </div>
            </div>
            <div>
              <div className="rotulo-campo">Unidades</div>
              <div className={`valor-campo ${styles.num}`}>
                {vigente.unidades ?? "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {historico.length > 0 ? (
        <div className={styles.cardSecao}>
          <p className={styles.cardTitulo}>Histórico de revalidações</p>
          <div className={styles.molduraTabela}>
            <table className={styles.tabelaInterna}>
              <thead>
                <tr>
                  <th>Nº / ano</th>
                  <th>Tipo</th>
                  <th>Emissão</th>
                  <th>Validade</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {historico.map((a) => {
                  const chip = chipSituacaoRegistroAlvara(a.situacao);
                  return (
                    <tr key={a.id}>
                      <td className={`${styles.num} ${styles.celulaForte}`}>
                        {a.numero ? `${a.numero}/${a.ano}` : `—/${a.ano}`}
                      </td>
                      <td>{rotuloMotivoAlvara(a.motivo)}</td>
                      <td className={styles.num}>
                        {formatarDataCurta(a.dataEmissao)}
                      </td>
                      <td className={styles.num}>
                        {formatarDataCurta(a.dataValidade)}
                      </td>
                      <td>
                        <span className={`chip ${chip.tom}`}>{chip.rotulo}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------------ habite-se */}
      <div className={styles.cabecalho} style={{ marginTop: "1.6rem" }}>
        <h2 className={styles.secaoTitulo}>Habite-se</h2>
        <button
          type="button"
          className="btn-primario"
          style={{ marginLeft: "auto" }}
          onClick={() => setFormHabite((v) => !v)}
        >
          ＋ Registrar habite-se
        </button>
      </div>

      {formHabite ? (
        <FormHabiteSe
          obraId={obraId}
          aoSalvar={() => {
            setFormHabite(false);
            atualizar();
          }}
          aoCancelar={() => setFormHabite(false)}
        />
      ) : null}

      {habiteSe.length === 0 ? (
        <div className={styles.vazio}>
          <div className={styles.vazioIcone} aria-hidden>
            📄
          </div>
          <p className={styles.vazioTitulo}>Habite-se não emitido</p>
          <p className={styles.vazioTexto}>
            O habite-se comprova que a obra foi executada conforme aprovado no
            alvará.
          </p>
        </div>
      ) : (
        <div className={styles.pilha}>
          {habiteSe.map((h) => (
            <div key={h.id} className={styles.card}>
              <div className={styles.visitaCabecalho}>
                <span
                  className={styles.num}
                  style={{ fontSize: "0.95rem", fontWeight: 700 }}
                >
                  Habite-se nº {h.numero}
                </span>
                <span
                  className={`chip ${h.resultado === "APROVADO" ? "chip-verde" : "chip-vermelho"}`}
                >
                  {h.resultado === "APROVADO" ? "Aprovado" : "Reprovado"}
                </span>
                <span className={`chip ${h.parcial ? "chip-ambar" : "chip-cinza"}`}>
                  {h.parcial ? "Parcial" : "Total"}
                </span>
                <span
                  className={`${styles.num} ${styles.contagem}`}
                  style={{ fontSize: "0.78rem" }}
                >
                  {formatarDataCurta(h.dataEmissao)}
                </span>
              </div>

              <div className={styles.gradeCamposCompacta}>
                <div>
                  <div className="rotulo-campo">Área aprovada</div>
                  <div className={`valor-campo ${styles.num}`}>
                    {formatarArea(h.areaAprovadaM2)}
                  </div>
                </div>
                <div>
                  <div className="rotulo-campo">Área executada</div>
                  <div
                    className={`valor-campo ${styles.num}`}
                    style={
                      h.divergenciaProjeto
                        ? { color: "var(--chip-vermelho-tx)", fontWeight: 700 }
                        : undefined
                    }
                  >
                    {formatarArea(h.areaConstruidaExecutadaM2)}
                  </div>
                </div>
              </div>

              {h.divergenciaProjeto ? (
                <div className={styles.alertaAviso} role="alert">
                  <span aria-hidden>⚠️</span>
                  <div>
                    <p className={styles.alertaAvisoTitulo}>
                      Divergência entre área aprovada e executada
                    </p>
                    <div className={styles.alertaAvisoLinhas}>
                      <span>
                        Aprovada:{" "}
                        <strong className={styles.num}>
                          {formatarArea(h.areaAprovadaM2)}
                        </strong>
                      </span>
                      <span>
                        Executada:{" "}
                        <strong className={styles.num}>
                          {formatarArea(h.areaConstruidaExecutadaM2)}
                        </strong>
                      </span>
                      <span className={styles.excedente}>
                        Excedente: {h.excedenteM2 ? formatarArea(h.excedenteM2) : "—"}
                      </span>
                    </div>
                    {h.divergenciaDescricao ? (
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--chip-ambar-tx)",
                          marginTop: "0.45rem",
                        }}
                      >
                        {h.divergenciaDescricao}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/** Formulario de registro de alvará (o sistema registra, nao emite). */
function FormAlvara({
  obraId,
  alvaras,
  aoSalvar,
  aoCancelar,
}: {
  obraId: string;
  alvaras: Alvara[];
  aoSalvar: () => void;
  aoCancelar: () => void;
}) {
  const anoAtual = new Date().getFullYear();
  const [form, setForm] = useState({
    numero: "",
    ano: String(anoAtual),
    tipo: "CONSTRUCAO",
    motivo: "ORIGINAL",
    situacao: "VIGENTE",
    dataEmissao: "",
    dataValidade: "",
    alvaraAnteriorId: "",
    areaTerrenoM2: "",
    areaConstruidaAprovadaM2: "",
    uso: "RESIDENCIAL_UNIFAMILIAR",
    pavimentos: "",
    unidades: "",
    processoAdministrativo: "",
    observacoes: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const exigeAnterior = form.motivo !== "ORIGINAL";
  const indeferido = form.situacao === "INDEFERIDO";

  function set(chave: keyof typeof form, valor: string) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await criarAlvara(obraId, {
        numero: form.numero.trim() || undefined,
        ano: Number(form.ano),
        tipo: form.tipo,
        motivo: form.motivo,
        situacao: form.situacao,
        dataEmissao: form.dataEmissao || undefined,
        dataValidade: form.dataValidade || undefined,
        alvaraAnteriorId: form.alvaraAnteriorId || undefined,
        areaTerrenoM2: form.areaTerrenoM2 || undefined,
        areaConstruidaAprovadaM2: form.areaConstruidaAprovadaM2 || undefined,
        uso: form.uso,
        pavimentos: form.pavimentos ? Number(form.pavimentos) : undefined,
        unidades: form.unidades ? Number(form.unidades) : undefined,
        processoAdministrativo: form.processoAdministrativo.trim() || undefined,
        observacoes: form.observacoes.trim() || undefined,
      });
      aoSalvar();
    } catch (erroApi) {
      setErro(mensagemErro(erroApi));
      setSalvando(false);
    }
  }

  return (
    <form
      className={styles.cardVigente}
      onSubmit={enviar}
      style={{ borderLeftColor: "var(--cor-acento)" }}
    >
      <p className={styles.cardTitulo}>Registrar alvará</p>

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
          <label className={styles.rotuloForm}>Situação do registro</label>
          <select
            value={form.situacao}
            onChange={(e) => set("situacao", e.target.value)}
          >
            <option value="VIGENTE">Vigente (alvará emitido)</option>
            <option value="INDEFERIDO">Indeferido (pedido negado)</option>
          </select>
        </div>
        <div>
          <label className={styles.rotuloForm}>Motivo</label>
          <select
            value={form.motivo}
            onChange={(e) => set("motivo", e.target.value)}
          >
            <option value="ORIGINAL">Alvará inicial</option>
            <option value="REVALIDACAO">Revalidação</option>
            <option value="PRORROGACAO">Prorrogação</option>
            <option value="SEGUNDA_VIA">2ª via</option>
          </select>
        </div>

        {exigeAnterior ? (
          <div className={styles.larguraTotal}>
            <label className={styles.rotuloForm}>Alvará anterior *</label>
            <select
              value={form.alvaraAnteriorId}
              onChange={(e) => set("alvaraAnteriorId", e.target.value)}
            >
              <option value="">Selecione o alvará que está sendo sucedido</option>
              {alvaras.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.numero ? `${a.numero}/${a.ano}` : `—/${a.ano}`} ·{" "}
                  {rotuloMotivoAlvara(a.motivo)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div>
          <label className={styles.rotuloForm}>
            Número {indeferido ? "" : "*"}
          </label>
          <input
            value={form.numero}
            onChange={(e) => set("numero", e.target.value)}
            placeholder={indeferido ? "Dispensado em indeferimento" : "184"}
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Ano *</label>
          <input
            type="number"
            value={form.ano}
            onChange={(e) => set("ano", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Tipo</label>
          <select value={form.tipo} onChange={(e) => set("tipo", e.target.value)}>
            {TIPOS_ALVARA.map((t) => (
              <option key={t} value={t}>
                {rotuloTipoAlvara(t)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.rotuloForm}>Uso</label>
          <select value={form.uso} onChange={(e) => set("uso", e.target.value)}>
            {USOS.map((u) => (
              <option key={u} value={u}>
                {rotuloUso(u)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={styles.rotuloForm}>
            Emissão {indeferido ? "" : "*"}
          </label>
          <input
            type="date"
            value={form.dataEmissao}
            onChange={(e) => set("dataEmissao", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Validade</label>
          <input
            type="date"
            value={form.dataValidade}
            onChange={(e) => set("dataValidade", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Área do terreno (m²)</label>
          <input
            value={form.areaTerrenoM2}
            onChange={(e) => set("areaTerrenoM2", e.target.value)}
            placeholder="360.00"
            inputMode="decimal"
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Área aprovada (m²)</label>
          <input
            value={form.areaConstruidaAprovadaM2}
            onChange={(e) => set("areaConstruidaAprovadaM2", e.target.value)}
            placeholder="212.50"
            inputMode="decimal"
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Pavimentos</label>
          <input
            type="number"
            value={form.pavimentos}
            onChange={(e) => set("pavimentos", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Unidades</label>
          <input
            type="number"
            value={form.unidades}
            onChange={(e) => set("unidades", e.target.value)}
          />
        </div>
        <div className={styles.larguraTotal}>
          <label className={styles.rotuloForm}>Processo administrativo</label>
          <input
            value={form.processoAdministrativo}
            onChange={(e) => set("processoAdministrativo", e.target.value)}
          />
        </div>
        <div className={styles.larguraTotal}>
          <label className={styles.rotuloForm}>Observações</label>
          <textarea
            rows={2}
            value={form.observacoes}
            onChange={(e) => set("observacoes", e.target.value)}
            placeholder={
              indeferido ? "Motivo do indeferimento" : "Observações do registro"
            }
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
          {salvando ? "Salvando…" : "Salvar alvará"}
        </button>
      </div>
    </form>
  );
}

/** Formulario de habite-se; a divergencia de area e derivada no backend. */
function FormHabiteSe({
  obraId,
  aoSalvar,
  aoCancelar,
}: {
  obraId: string;
  aoSalvar: () => void;
  aoCancelar: () => void;
}) {
  const [form, setForm] = useState({
    numero: "",
    dataEmissao: "",
    parcial: "false",
    descricaoParcial: "",
    dataVistoria: "",
    resultado: "APROVADO",
    areaConstruidaExecutadaM2: "",
    divergenciaDescricao: "",
    parecer: "",
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function set(chave: keyof typeof form, valor: string) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await criarHabiteSe(obraId, {
        numero: form.numero.trim(),
        dataEmissao: form.dataEmissao || undefined,
        parcial: form.parcial === "true",
        descricaoParcial: form.descricaoParcial.trim() || undefined,
        dataVistoria: form.dataVistoria || undefined,
        resultado: form.resultado,
        areaConstruidaExecutadaM2: form.areaConstruidaExecutadaM2 || undefined,
        divergenciaDescricao: form.divergenciaDescricao.trim() || undefined,
        parecer: form.parecer.trim() || undefined,
      });
      aoSalvar();
    } catch (erroApi) {
      setErro(mensagemErro(erroApi));
      setSalvando(false);
    }
  }

  return (
    <form className={styles.cardVigente} onSubmit={enviar}>
      <p className={styles.cardTitulo}>Registrar habite-se</p>

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
          <label className={styles.rotuloForm}>Número *</label>
          <input
            value={form.numero}
            onChange={(e) => set("numero", e.target.value)}
            placeholder="27/2026"
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Data de emissão</label>
          <input
            type="date"
            value={form.dataEmissao}
            onChange={(e) => set("dataEmissao", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Resultado *</label>
          <select
            value={form.resultado}
            onChange={(e) => set("resultado", e.target.value)}
          >
            <option value="APROVADO">Aprovado</option>
            <option value="REPROVADO">Reprovado</option>
          </select>
        </div>
        <div>
          <label className={styles.rotuloForm}>Abrangência</label>
          <select
            value={form.parcial}
            onChange={(e) => set("parcial", e.target.value)}
          >
            <option value="false">Total (conclui a obra)</option>
            <option value="true">Parcial</option>
          </select>
        </div>
        {form.parcial === "true" ? (
          <div className={styles.larguraTotal}>
            <label className={styles.rotuloForm}>O que foi liberado</label>
            <input
              value={form.descricaoParcial}
              onChange={(e) => set("descricaoParcial", e.target.value)}
              placeholder="1º e 2º pavimentos"
            />
          </div>
        ) : null}
        <div>
          <label className={styles.rotuloForm}>Data da vistoria</label>
          <input
            type="date"
            value={form.dataVistoria}
            onChange={(e) => set("dataVistoria", e.target.value)}
          />
        </div>
        <div>
          <label className={styles.rotuloForm}>Área executada (m²)</label>
          <input
            value={form.areaConstruidaExecutadaM2}
            onChange={(e) => set("areaConstruidaExecutadaM2", e.target.value)}
            placeholder="238.90"
            inputMode="decimal"
          />
        </div>
        <div className={styles.larguraTotal}>
          <label className={styles.rotuloForm}>
            Descrição da divergência
            <span
              style={{
                fontWeight: 400,
                color: "var(--cor-texto-fraco)",
                marginLeft: 4,
              }}
            >
              (obrigatória se a área executada exceder a aprovada)
            </span>
          </label>
          <textarea
            rows={2}
            value={form.divergenciaDescricao}
            onChange={(e) => set("divergenciaDescricao", e.target.value)}
          />
        </div>
        <div className={styles.larguraTotal}>
          <label className={styles.rotuloForm}>Parecer</label>
          <textarea
            rows={2}
            value={form.parecer}
            onChange={(e) => set("parecer", e.target.value)}
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
          {salvando ? "Salvando…" : "Salvar habite-se"}
        </button>
      </div>
    </form>
  );
}
