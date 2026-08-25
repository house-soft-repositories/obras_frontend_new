"use client";

import { useCallback, useState } from "react";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import { consultarCep, mascararCep } from "@/lib/api/cep";
import {
  buscarPessoas,
  editarObraPrivada,
  type ObraPrivadaDetalhe,
  type PessoaSugestao,
} from "@/lib/api/obras-privadas";
import {
  OPCOES_ANDAMENTO,
  OPCOES_HABITE_SE,
  OPCOES_SITUACAO_ALVARA,
} from "@/lib/ui/obra-privada-labels";
import { BuscaPessoa } from "./busca-pessoa";
import { MapaPonto } from "./mapas";
import styles from "./privadas.module.css";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface FormObra {
  inscricaoImobiliaria: string;
  matriculaRgi: string;
  cartorio: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  uf: string;
  latitude: string;
  longitude: string;
  geoOrigem: string;
  descricao: string;
  observacoes: string;
  dataInicio: string;
  dataPrevistaConclusao: string;
  situacaoAlvara: string;
  andamento: string;
  habiteSe: string;
}

function deDetalhe(d: ObraPrivadaDetalhe): FormObra {
  const o = d.obra;
  return {
    inscricaoImobiliaria: o.inscricaoImobiliaria ?? "",
    matriculaRgi: o.matriculaRgi ?? "",
    cartorio: o.cartorio ?? "",
    cep: o.cep ?? "",
    logradouro: o.logradouro,
    numero: o.numero ?? "",
    complemento: o.complemento ?? "",
    bairro: o.bairro ?? "",
    uf: o.uf,
    latitude: o.latitude ?? "",
    longitude: o.longitude ?? "",
    geoOrigem: o.geoOrigem,
    descricao: o.descricao,
    observacoes: o.observacoes ?? "",
    dataInicio: o.dataInicio ?? "",
    dataPrevistaConclusao: o.dataPrevistaConclusao ?? "",
    situacaoAlvara: o.situacaoAlvara,
    andamento: o.andamento,
    habiteSe: o.habiteSe,
  };
}

/**
 * Edicao dos campos da obra privada (PATCH /obras-privadas/:id). Espelha os
 * blocos do formulario de criacao, menos o codigo — que e imutavel (RN-PRV-01)
 * — e menos os responsaveis tecnicos, que sao uma colecao com endpoints
 * proprios.
 *
 * Campo vazio e enviado como `null` (e nao omitido) para que APAGAR um valor
 * funcione: o PATCH so ignora o que vem `undefined`.
 */
export function EditarObraPrivada({
  detalhe,
  aoSalvar,
  aoCancelar,
}: {
  detalhe: ObraPrivadaDetalhe;
  aoSalvar: () => void;
  aoCancelar: () => void;
}) {
  const [form, setForm] = useState<FormObra>(() => deDetalhe(detalhe));
  const [proprietario, setProprietario] = useState<PessoaSugestao | null>(
    detalhe.proprietario
      ? {
          id: detalhe.proprietario.id,
          nome: detalhe.proprietario.nome,
          documento: detalhe.proprietario.documento,
          tipo: detalhe.proprietario.tipo,
          registroProfissional: null,
        }
      : null,
  );
  const [erros, setErros] = useState<string[]>([]);
  const [avisoCep, setAvisoCep] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const buscarProprietario = useCallback(
    (termo: string) => buscarPessoas(termo),
    [],
  );

  function set<K extends keyof FormObra>(chave: K, valor: FormObra[K]) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  /** Preenche apenas o que estiver vazio: nunca sobrescreve o que ja existe. */
  async function preencherPorCep() {
    setAvisoCep(null);
    const dados = await consultarCep(form.cep);
    if (!dados) {
      setAvisoCep("CEP não encontrado. Preencha o endereço manualmente.");
      return;
    }
    setForm((f) => ({
      ...f,
      logradouro: f.logradouro || (dados.logradouro ?? ""),
      bairro: f.bairro || (dados.bairro ?? ""),
      uf: dados.uf ?? f.uf,
    }));
    setAvisoCep("✓ Logradouro e bairro preenchidos automaticamente");
  }

  function usarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      setAvisoCep("Este navegador não fornece geolocalização.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(7),
          longitude: pos.coords.longitude.toFixed(7),
          geoOrigem: "GPS_DISPOSITIVO",
        }));
      },
      () => setAvisoCep("Não foi possível obter a localização do dispositivo."),
    );
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const problemas: string[] = [];
    if (!proprietario) problemas.push("Selecione o proprietário da obra.");
    if (!form.logradouro.trim()) problemas.push("Informe o logradouro.");
    if (!form.descricao.trim()) problemas.push("Descreva a obra.");
    if (!form.uf) problemas.push("Selecione a UF.");
    setErros(problemas);
    if (problemas.length > 0) return;

    const ouNulo = (v: string) => (v.trim() ? v.trim() : null);

    setSalvando(true);
    try {
      await editarObraPrivada(detalhe.obra.id, {
        proprietarioPessoaId: proprietario!.id,
        descricao: form.descricao.trim(),
        observacoes: ouNulo(form.observacoes),
        inscricaoImobiliaria: ouNulo(form.inscricaoImobiliaria),
        matriculaRgi: ouNulo(form.matriculaRgi),
        cartorio: ouNulo(form.cartorio),
        cep: ouNulo(form.cep),
        logradouro: form.logradouro.trim(),
        numero: ouNulo(form.numero),
        complemento: ouNulo(form.complemento),
        bairro: ouNulo(form.bairro),
        uf: form.uf,
        latitude: ouNulo(form.latitude),
        longitude: ouNulo(form.longitude),
        geoOrigem: form.geoOrigem,
        situacaoAlvara: form.situacaoAlvara,
        andamento: form.andamento,
        habiteSe: form.habiteSe,
        dataInicio: ouNulo(form.dataInicio),
        dataPrevistaConclusao: ouNulo(form.dataPrevistaConclusao),
      });
      aoSalvar();
    } catch (erro) {
      setErros([mensagemErro(erro)]);
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar}>
      {erros.length > 0 ? (
        <div className={styles.faixaErro} role="alert">
          <span aria-hidden>⛔</span>
          <div>
            <p className={styles.faixaErroTitulo}>Verifique o formulário</p>
            {erros.map((e, i) => (
              <p key={i} className={styles.faixaErroTexto}>
                {e}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------- proprietario */}
      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo}>Proprietário</p>
        <BuscaPessoa
          rotulo="Buscar pessoa"
          ajuda="Trocar o proprietário move a obra para outra pessoa; o histórico da obra é preservado."
          buscar={buscarProprietario}
          selecionada={proprietario}
          aoSelecionar={setProprietario}
        />
      </div>

      {/* ------------------------------------------------------- imovel */}
      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo}>Imóvel</p>
        <div className={styles.grade2}>
          <div>
            <label className={styles.rotuloForm}>Inscrição imobiliária</label>
            <input
              value={form.inscricaoImobiliaria}
              onChange={(e) => set("inscricaoImobiliaria", e.target.value)}
              placeholder="02.14.038.0142.001"
            />
          </div>
          <div>
            <label className={styles.rotuloForm}>Matrícula RGI</label>
            <input
              value={form.matriculaRgi}
              onChange={(e) => set("matriculaRgi", e.target.value)}
            />
          </div>
          <div className={styles.larguraTotal}>
            <label className={styles.rotuloForm}>Cartório</label>
            <input
              value={form.cartorio}
              onChange={(e) => set("cartorio", e.target.value)}
            />
          </div>
          <div>
            <label className={styles.rotuloForm}>CEP</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                value={form.cep}
                onChange={(e) => set("cep", mascararCep(e.target.value))}
                placeholder="00000-000"
                inputMode="numeric"
              />
              <button
                type="button"
                className="btn-secundario"
                onClick={() => void preencherPorCep()}
              >
                Buscar
              </button>
            </div>
            {avisoCep ? <span className={styles.dica}>{avisoCep}</span> : null}
          </div>
          <div>
            <label className={styles.rotuloForm}>Número</label>
            <input
              value={form.numero}
              onChange={(e) => set("numero", e.target.value)}
            />
          </div>
          <div className={styles.larguraTotal}>
            <label className={styles.rotuloForm}>Logradouro *</label>
            <input
              value={form.logradouro}
              onChange={(e) => set("logradouro", e.target.value)}
            />
          </div>
          <div>
            <label className={styles.rotuloForm}>Complemento</label>
            <input
              value={form.complemento}
              onChange={(e) => set("complemento", e.target.value)}
            />
          </div>
          <div>
            <label className={styles.rotuloForm}>Bairro</label>
            <input
              value={form.bairro}
              onChange={(e) => set("bairro", e.target.value)}
            />
          </div>
          <div>
            <label className={styles.rotuloForm}>UF *</label>
            <select value={form.uf} onChange={(e) => set("uf", e.target.value)}>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------- localizacao */}
      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo}>Localização</p>
        <div className={styles.grade2}>
          <div>
            <label className={styles.rotuloForm}>Latitude</label>
            <input
              value={form.latitude}
              onChange={(e) => set("latitude", e.target.value)}
              placeholder="-23.5505200"
              inputMode="decimal"
            />
          </div>
          <div>
            <label className={styles.rotuloForm}>Longitude</label>
            <input
              value={form.longitude}
              onChange={(e) => set("longitude", e.target.value)}
              placeholder="-46.6333100"
              inputMode="decimal"
            />
          </div>
          <div>
            <label className={styles.rotuloForm}>Origem da coordenada</label>
            <select
              value={form.geoOrigem}
              onChange={(e) => set("geoOrigem", e.target.value)}
            >
              <option value="MANUAL">Informada manualmente</option>
              <option value="GPS_DISPOSITIVO">GPS do dispositivo</option>
              <option value="CEP">Derivada do CEP</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button
              type="button"
              className="btn-secundario"
              onClick={usarMinhaLocalizacao}
            >
              ⌖ Usar minha localização
            </button>
          </div>
          <div className={styles.larguraTotal}>
            <MapaPonto
              latitude={form.latitude || null}
              longitude={form.longitude || null}
              aoMover={(lat, lng) =>
                setForm((f) => ({
                  ...f,
                  latitude: lat,
                  longitude: lng,
                  geoOrigem: "MANUAL",
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- obra */}
      <div className={styles.cardSecao}>
        <p className={styles.cardTitulo}>Obra</p>
        <div className={styles.grade2}>
          <div className={styles.larguraTotal}>
            <label className={styles.rotuloForm}>Descrição *</label>
            <textarea
              rows={2}
              value={form.descricao}
              onChange={(e) => set("descricao", e.target.value)}
            />
          </div>
          <div>
            <label className={styles.rotuloForm}>Data de início</label>
            <input
              type="date"
              value={form.dataInicio}
              onChange={(e) => set("dataInicio", e.target.value)}
            />
          </div>
          <div>
            <label className={styles.rotuloForm}>Previsão de conclusão</label>
            <input
              type="date"
              value={form.dataPrevistaConclusao}
              onChange={(e) => set("dataPrevistaConclusao", e.target.value)}
            />
          </div>
          <div>
            <label className={styles.rotuloForm}>Situação do alvará</label>
            <select
              value={form.situacaoAlvara}
              onChange={(e) => set("situacaoAlvara", e.target.value)}
            >
              {OPCOES_SITUACAO_ALVARA.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.rotuloForm}>Andamento</label>
            <select
              value={form.andamento}
              onChange={(e) => set("andamento", e.target.value)}
            >
              {OPCOES_ANDAMENTO.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={styles.rotuloForm}>Habite-se</label>
            <select
              value={form.habiteSe}
              onChange={(e) => set("habiteSe", e.target.value)}
            >
              {OPCOES_HABITE_SE.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.rotulo}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.larguraTotal}>
            <span className={styles.dica}>
              Situação do alvará e habite-se são recalculados a partir dos
              registros das abas Licenciamento; o andamento volta a
              &ldquo;Paralisada&rdquo; enquanto houver embargo aberto. Editar
              aqui vale até o próximo registro.
            </span>
          </div>
          <div className={styles.larguraTotal}>
            <label className={styles.rotuloForm}>Observações</label>
            <textarea
              rows={3}
              value={form.observacoes}
              onChange={(e) => set("observacoes", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={styles.rodapeFixo}>
        <button type="button" className="btn-secundario" onClick={aoCancelar}>
          Cancelar
        </button>
        <button type="submit" className="btn-primario" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
