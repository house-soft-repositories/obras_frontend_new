"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import { consultarCep, mascararCep } from "@/lib/api/cep";
import {
  buscarPessoas,
  buscarProfissionais,
  criarObraPrivada,
  criarPessoa,
  criarProfissional,
  criarResponsavel,
  type PessoaSugestao,
} from "@/lib/api/obras-privadas";
import {
  limparDocumento,
  mascararPorTipo,
  problemaDocumento,
  rotuloDocumento,
  type TipoPessoa,
} from "@/lib/ui/documento";
import {
  OPCOES_ANDAMENTO,
  OPCOES_HABITE_SE,
  OPCOES_SITUACAO_ALVARA,
  rotuloPapelRt,
} from "@/lib/ui/obra-privada-labels";
import { BuscaPessoa } from "./busca-pessoa";
import { MapaPonto } from "./mapas";
import styles from "./privadas.module.css";

interface ResponsavelForm {
  profissional: PessoaSugestao | null;
  papel: string;
  tipoDocumento: string;
  numeroDocumento: string;
  dataDocumento: string;
}

const PAPEIS = [
  "PROJETO_ARQUITETONICO",
  "PROJETO_ESTRUTURAL",
  "PROJETO_COMPLEMENTAR",
  "EXECUCAO",
];

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

function responsavelVazio(): ResponsavelForm {
  return {
    profissional: null,
    papel: "EXECUCAO",
    tipoDocumento: "ART",
    numeroDocumento: "",
    dataDocumento: "",
  };
}

/** Cadastro rapido de profissional tecnico, feito sem sair do formulario. */
interface FormRt {
  nome: string;
  documento: string;
  conselho: string;
  numeroRegistro: string;
  ufRegistro: string;
  titulo: string;
}

function rtVazio(): FormRt {
  return {
    nome: "",
    documento: "",
    conselho: "CREA",
    numeroRegistro: "",
    ufRegistro: "",
    titulo: "",
  };
}

/**
 * Cadastro de obra privada. Cinco blocos, na ordem do design: proprietario,
 * imovel, localizacao, obra e responsaveis tecnicos.
 *
 * O proprietario e escolhido por busca-enquanto-digita, com cadastro inline
 * quando nao existe — obrigar a sair da tela para criar a pessoa e voltar
 * perderia todo o resto do formulario.
 *
 * Os responsaveis tecnicos sao gravados APOS a obra, em chamadas separadas: o
 * vinculo depende do id da obra. Se um vinculo falhar, a obra ja existe e o
 * erro e reportado sem perder o cadastro — o usuario completa na tela de
 * detalhe.
 */
export function ObraPrivadaForm() {
  const router = useRouter();

  const [proprietario, setProprietario] = useState<PessoaSugestao | null>(null);
  const [novaPessoa, setNovaPessoa] = useState(false);
  const [salvandoPessoa, setSalvandoPessoa] = useState(false);
  const [formPessoa, setFormPessoa] = useState({
    tipo: "FISICA" as TipoPessoa,
    nome: "",
    documento: "",
    telefone: "",
    email: "",
  });

  const [form, setForm] = useState({
    inscricaoImobiliaria: "",
    matriculaRgi: "",
    cartorio: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    uf: "SP",
    latitude: "",
    longitude: "",
    geoOrigem: "MANUAL",
    descricao: "",
    dataInicio: "",
    dataPrevistaConclusao: "",
    situacaoAlvara: "SEM_ALVARA",
    andamento: "EM_ANDAMENTO",
    habiteSe: "NAO_SOLICITADO",
  });

  const [responsaveis, setResponsaveis] = useState<ResponsavelForm[]>([]);
  /** Indice do responsavel cujo cadastro rapido de profissional esta aberto. */
  const [novoRt, setNovoRt] = useState<number | null>(null);
  const [salvandoRt, setSalvandoRt] = useState(false);
  const [formRt, setFormRt] = useState<FormRt>(rtVazio());
  const [erros, setErros] = useState<string[]>([]);
  const [avisoCep, setAvisoCep] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  function set<K extends keyof typeof form>(chave: K, valor: string) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  const buscarProprietario = useCallback(
    (termo: string) => buscarPessoas(termo),
    [],
  );
  const buscarRt = useCallback(
    (termo: string) =>
      buscarProfissionais(termo).then((lista) =>
        lista.map<PessoaSugestao>((p) => ({
          id: p.id,
          nome: p.nome,
          documento: p.documento,
          tipo: "FISICA",
          registroProfissional: p.registro,
        })),
      ),
    [],
  );

  /** Preenche apenas o que estiver vazio: nunca sobrescreve o que foi digitado. */
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

  async function salvarPessoa() {
    const documento = limparDocumento(formPessoa.documento);
    if (!formPessoa.nome.trim()) {
      setErros(["Informe o nome ou a razão social da pessoa."]);
      return;
    }
    const problema = problemaDocumento(documento, formPessoa.tipo);
    if (problema) {
      setErros([problema]);
      return;
    }
    setSalvandoPessoa(true);
    setErros([]);
    try {
      const criada = await criarPessoa({
        tipo: formPessoa.tipo,
        nome: formPessoa.nome.trim(),
        documento,
        telefone: formPessoa.telefone.trim() || undefined,
        email: formPessoa.email.trim() || undefined,
      });
      setProprietario({
        id: criada.id,
        nome: criada.nome,
        documento: criada.documento,
        tipo: criada.tipo,
        registroProfissional: null,
      });
      setNovaPessoa(false);
      setFormPessoa({
        tipo: "FISICA",
        nome: "",
        documento: "",
        telefone: "",
        email: "",
      });
    } catch (erro) {
      setErros([mensagemErro(erro)]);
    } finally {
      setSalvandoPessoa(false);
    }
  }

  /**
   * Cadastra o profissional tecnico sem sair do formulario da obra e ja o
   * seleciona no responsavel correspondente.
   *
   * O perfil profissional e uma EXTENSAO da pessoa, nao um cadastro paralelo:
   * se o CPF ja existe, reaproveita a pessoa e apenas concede o registro —
   * criar outra pessoa com o mesmo CPF seria recusado pelo backend (409) e
   * duplicaria alguem que talvez ja seja proprietario de outra obra.
   */
  async function salvarRt(indice: number) {
    const documento = limparDocumento(formRt.documento);
    if (!formRt.nome.trim()) {
      setErros(["Informe o nome do profissional."]);
      return;
    }
    const problema = problemaDocumento(documento, "FISICA");
    if (problema) {
      setErros([problema]);
      return;
    }
    if (!formRt.numeroRegistro.trim()) {
      setErros(["Informe o número do registro no conselho."]);
      return;
    }

    setSalvandoRt(true);
    setErros([]);
    try {
      const encontradas = await buscarPessoas(documento, "FISICA");
      const existente = encontradas.find(
        (p) => limparDocumento(p.documento) === documento,
      );
      const pessoaId = existente
        ? existente.id
        : (
            await criarPessoa({
              tipo: "FISICA",
              nome: formRt.nome.trim(),
              documento,
            })
          ).id;

      const profissional = await criarProfissional({
        pessoaId,
        conselho: formRt.conselho,
        numeroRegistro: formRt.numeroRegistro.trim(),
        ufRegistro: formRt.ufRegistro || undefined,
        titulo: formRt.titulo.trim() || undefined,
      });

      setResponsaveis((lista) =>
        lista.map((item, j) =>
          j === indice
            ? {
                ...item,
                profissional: {
                  id: profissional.id,
                  nome: profissional.nome,
                  documento: profissional.documento,
                  tipo: "FISICA",
                  registroProfissional: profissional.registro,
                },
              }
            : item,
        ),
      );
      setNovoRt(null);
      setFormRt(rtVazio());
    } catch (erro) {
      // O 409 de "ja possui perfil" e o desfecho mais provavel de quem cadastra
      // sem procurar antes; a mensagem crua do backend nao diz o que fazer.
      const texto = mensagemErro(erro);
      setErros([
        /ja possui perfil|já possui perfil/i.test(texto)
          ? `${formRt.nome.trim() || "Esta pessoa"} já é profissional técnico. Busque pelo nome, CPF ou nº do registro no campo acima em vez de cadastrar de novo.`
          : texto,
      ]);
    } finally {
      setSalvandoRt(false);
    }
  }

  function validar(): string[] {
    const problemas: string[] = [];
    if (!proprietario) problemas.push("Selecione o proprietário da obra.");
    if (!form.logradouro.trim()) problemas.push("Informe o logradouro.");
    if (!form.descricao.trim()) problemas.push("Descreva a obra.");
    if (!form.uf) problemas.push("Selecione a UF.");
    responsaveis.forEach((r, i) => {
      if (!r.profissional) {
        problemas.push(`Responsável ${i + 1}: selecione o profissional.`);
      }
      if (!r.numeroDocumento.trim()) {
        problemas.push(
          `Responsável ${i + 1}: informe o número da ${r.tipoDocumento}.`,
        );
      }
    });
    return problemas;
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const problemas = validar();
    setErros(problemas);
    if (problemas.length > 0) return;

    setSalvando(true);
    try {
      const obra = await criarObraPrivada({
        descricao: form.descricao.trim(),
        proprietarioPessoaId: proprietario!.id,
        inscricaoImobiliaria: form.inscricaoImobiliaria.trim() || undefined,
        matriculaRgi: form.matriculaRgi.trim() || undefined,
        cartorio: form.cartorio.trim() || undefined,
        cep: form.cep.trim() || undefined,
        logradouro: form.logradouro.trim(),
        numero: form.numero.trim() || undefined,
        complemento: form.complemento.trim() || undefined,
        bairro: form.bairro.trim() || undefined,
        uf: form.uf,
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
        geoOrigem: form.geoOrigem,
        situacaoAlvara: form.situacaoAlvara,
        andamento: form.andamento,
        habiteSe: form.habiteSe,
        dataInicio: form.dataInicio || undefined,
        dataPrevistaConclusao: form.dataPrevistaConclusao || undefined,
      });

      // Vinculos dependem do id da obra, entao vem depois. Falha aqui nao
      // desfaz a obra: informamos e o usuario completa no detalhe.
      const falhas: string[] = [];
      for (const r of responsaveis) {
        try {
          await criarResponsavel(obra.id, {
            profissionalTecnicoId: r.profissional!.id,
            papel: r.papel,
            tipoDocumento: r.tipoDocumento,
            numeroDocumento: r.numeroDocumento.trim(),
            dataDocumento: r.dataDocumento || undefined,
          });
        } catch (erro) {
          falhas.push(`${r.profissional!.nome}: ${mensagemErro(erro)}`);
        }
      }
      if (falhas.length > 0) {
        setErros([
          `A obra ${obra.codigo} foi criada, mas alguns responsáveis não foram vinculados:`,
          ...falhas,
        ]);
        setSalvando(false);
        return;
      }
      router.push(`/obras-privadas/${obra.id}`);
    } catch (erro) {
      setErros([mensagemErro(erro)]);
      setSalvando(false);
    }
  }

  return (
    <main style={{ padding: "1.5rem 1.75rem" }}>
      <nav className={styles.trilha}>
        <Link href="/obras-privadas" className={styles.trilhaLink}>
          Obras privadas
        </Link>
        <span className={styles.trilhaSep}>›</span>
        <span>Nova obra privada</span>
      </nav>

      <div style={{ marginTop: "0.75rem" }}>
        <h1 className="page-titulo">Nova obra privada</h1>
        <p className="page-sub">
          Cadastro de obra de terceiro para fiscalização municipal.
        </p>
      </div>

      <form className={styles.formulario} onSubmit={enviar}>
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

        {/* ------------------------------------------------ proprietario */}
        <div className={styles.card}>
          <p className={styles.cardTitulo}>Proprietário</p>
          <p className={styles.cardSub}>
            Busque por nome ou CPF/CNPJ. Se não existir, cadastre uma nova
            pessoa.
          </p>
          <BuscaPessoa
            rotulo="Buscar pessoa"
            buscar={buscarProprietario}
            selecionada={proprietario}
            aoSelecionar={setProprietario}
            acaoExtra={
              !proprietario ? (
                <button
                  type="button"
                  className={styles.botaoLink}
                  style={{ marginTop: "0.75rem" }}
                  onClick={() => setNovaPessoa((v) => !v)}
                >
                  ＋ Cadastrar nova pessoa
                </button>
              ) : null
            }
          />

          {novaPessoa && !proprietario ? (
            <div className={styles.blocoInline}>
              <p className={styles.blocoInlineTitulo}>Cadastrar nova pessoa</p>
              <div className={styles.grade2}>
                <div>
                  <label className={styles.rotuloForm}>
                    Nome / Razão social *
                  </label>
                  <input
                    value={formPessoa.nome}
                    onChange={(e) =>
                      setFormPessoa((p) => ({ ...p, nome: e.target.value }))
                    }
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className={styles.rotuloForm}>Tipo *</label>
                  <select
                    value={formPessoa.tipo}
                    onChange={(e) =>
                      setFormPessoa((p) => ({
                        ...p,
                        tipo: e.target.value as TipoPessoa,
                        documento: "",
                      }))
                    }
                  >
                    <option value="FISICA">Pessoa física (PF)</option>
                    <option value="JURIDICA">Pessoa jurídica (PJ)</option>
                  </select>
                </div>
                <div>
                  <label className={styles.rotuloForm}>
                    {rotuloDocumento(formPessoa.tipo)} *
                  </label>
                  <input
                    value={formPessoa.documento}
                    onChange={(e) =>
                      setFormPessoa((p) => ({
                        ...p,
                        documento: mascararPorTipo(e.target.value, p.tipo),
                      }))
                    }
                    placeholder={
                      formPessoa.tipo === "FISICA"
                        ? "000.000.000-00"
                        : "00.000.000/0000-00"
                    }
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className={styles.rotuloForm}>Telefone</label>
                  <input
                    value={formPessoa.telefone}
                    onChange={(e) =>
                      setFormPessoa((p) => ({ ...p, telefone: e.target.value }))
                    }
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className={styles.larguraTotal}>
                  <label className={styles.rotuloForm}>E-mail</label>
                  <input
                    type="email"
                    value={formPessoa.email}
                    onChange={(e) =>
                      setFormPessoa((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="pessoa@email.com"
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.55rem",
                  justifyContent: "flex-end",
                  marginTop: "0.85rem",
                }}
              >
                <button
                  type="button"
                  className="btn-secundario"
                  onClick={() => setNovaPessoa(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn-primario"
                  onClick={salvarPessoa}
                  disabled={salvandoPessoa}
                >
                  {salvandoPessoa ? "Salvando…" : "Salvar pessoa"}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* ------------------------------------------------------ imovel */}
        <div className={styles.cardSecao}>
          <p className={styles.cardTitulo}>Imóvel</p>
          <div className={styles.grade2}>
            <div>
              <label className={styles.rotuloForm}>Inscrição imobiliária</label>
              <input
                value={form.inscricaoImobiliaria}
                onChange={(e) => set("inscricaoImobiliaria", e.target.value)}
                placeholder="00.00.000.0000.000"
              />
            </div>
            <div>
              <label className={styles.rotuloForm}>Matrícula RGI</label>
              <input
                value={form.matriculaRgi}
                onChange={(e) => set("matriculaRgi", e.target.value)}
                placeholder="00000"
              />
            </div>
            <div>
              <label className={styles.rotuloForm}>Cartório</label>
              <input
                value={form.cartorio}
                onChange={(e) => set("cartorio", e.target.value)}
                placeholder="1º Ofício de Registro de Imóveis"
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
                  className={styles.botaoFantasma}
                  onClick={() => void preencherPorCep()}
                >
                  Buscar
                </button>
              </div>
              {avisoCep ? (
                <p
                  style={{
                    fontSize: "0.72rem",
                    marginTop: "0.3rem",
                    color: avisoCep.startsWith("✓")
                      ? "var(--cor-acento)"
                      : "var(--chip-ambar-tx)",
                  }}
                  role="status"
                >
                  {avisoCep}
                </p>
              ) : null}
            </div>
            <div className={styles.larguraTotal}>
              <label className={styles.rotuloForm}>Logradouro *</label>
              <input
                value={form.logradouro}
                onChange={(e) => set("logradouro", e.target.value)}
                placeholder="Rua das Acácias"
              />
            </div>
            <div>
              <label className={styles.rotuloForm}>Número</label>
              <input
                value={form.numero}
                onChange={(e) => set("numero", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className={styles.rotuloForm}>Complemento</label>
              <input
                value={form.complemento}
                onChange={(e) => set("complemento", e.target.value)}
                placeholder="Bloco / apto / fundos"
              />
            </div>
            <div>
              <label className={styles.rotuloForm}>Bairro</label>
              <input
                value={form.bairro}
                onChange={(e) => set("bairro", e.target.value)}
                placeholder="Centro"
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

        {/* ------------------------------------------------- localizacao */}
        <div className={styles.cardSecao}>
          <p className={styles.cardTitulo}>Localização</p>
          <p className={styles.cardSub}>
            Clique no mapa para ajustar a posição exata da obra.
          </p>
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
          <div className={styles.grade2} style={{ marginTop: "0.8rem" }}>
            <div>
              <label className={styles.rotuloForm}>Latitude</label>
              <input
                value={form.latitude}
                onChange={(e) => set("latitude", e.target.value)}
                placeholder="-23.5505200"
              />
            </div>
            <div>
              <label className={styles.rotuloForm}>Longitude</label>
              <input
                value={form.longitude}
                onChange={(e) => set("longitude", e.target.value)}
                placeholder="-46.6333100"
              />
            </div>
          </div>
          <button
            type="button"
            className={styles.botaoFantasma}
            style={{ marginTop: "0.7rem" }}
            onClick={usarMinhaLocalizacao}
          >
            ⌖ Usar minha localização
          </button>
        </div>

        {/* -------------------------------------------------------- obra */}
        <div className={styles.cardSecao}>
          <p className={styles.cardTitulo}>Obra</p>
          <div className={styles.grade2}>
            <div className={styles.larguraTotal}>
              <label className={styles.rotuloForm}>Descrição *</label>
              <textarea
                rows={3}
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="Ex.: Construção de residência unifamiliar de 2 pavimentos."
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
          </div>
        </div>

        {/* --------------------------------------- responsaveis tecnicos */}
        <div className={styles.cardSecao}>
          <div className={styles.cabecalho}>
            <div>
              <p className={styles.cardTitulo} style={{ marginBottom: 0 }}>
                Responsáveis técnicos
              </p>
              <p className={styles.cardSub} style={{ margin: "0.25rem 0 0" }}>
                Um registro por profissional e papel na obra.
              </p>
            </div>
            <button
              type="button"
              className="btn-primario"
              style={{ marginLeft: "auto" }}
              onClick={() =>
                setResponsaveis((r) => [...r, responsavelVazio()])
              }
            >
              ＋ Adicionar
            </button>
          </div>

          {responsaveis.length === 0 ? (
            <div className={styles.vazio}>
              <div className={styles.vazioIcone} aria-hidden>
                📐
              </div>
              <p className={styles.vazioTitulo}>
                Nenhum responsável técnico informado
              </p>
              <p className={styles.vazioTexto}>
                Adicione ao menos um profissional com ART, RRT ou TRT. Obra sem
                responsável técnico é indício de irregularidade.
              </p>
            </div>
          ) : (
            <div className={styles.pilha}>
              {responsaveis.map((r, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid var(--cor-borda-sutil)",
                    background: "var(--cor-superficie-sutil)",
                    borderRadius: "10px",
                    padding: "0.85rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                      marginBottom: "0.7rem",
                    }}
                  >
                    <span className="chip chip-teal">Responsável {i + 1}</span>
                    <button
                      type="button"
                      className="btn-perigo"
                      style={{ marginLeft: "auto", minHeight: 34 }}
                      onClick={() =>
                        setResponsaveis((lista) =>
                          lista.filter((_, j) => j !== i),
                        )
                      }
                    >
                      Remover
                    </button>
                  </div>
                  <div className={styles.grade2}>
                    <div className={styles.larguraTotal}>
                      <BuscaPessoa
                        rotulo="Profissional"
                        placeholder="Nome, CPF ou nº do CREA/CAU…"
                        ajuda="Digite ao menos 3 caracteres para buscar entre os profissionais cadastrados."
                        buscar={buscarRt}
                        selecionada={r.profissional}
                        aoSelecionar={(p) =>
                          setResponsaveis((lista) =>
                            lista.map((item, j) =>
                              j === i ? { ...item, profissional: p } : item,
                            ),
                          )
                        }
                        acaoExtra={
                          !r.profissional ? (
                            <button
                              type="button"
                              className={styles.botaoLink}
                              style={{ marginTop: "0.75rem" }}
                              onClick={() => {
                                setFormRt(rtVazio());
                                setNovoRt((atual) => (atual === i ? null : i));
                              }}
                            >
                              ＋ Cadastrar novo profissional
                            </button>
                          ) : null
                        }
                      />

                      {novoRt === i && !r.profissional ? (
                        <div className={styles.blocoInline}>
                          <p className={styles.blocoInlineTitulo}>
                            Cadastrar novo profissional técnico
                          </p>
                          <div className={styles.grade2}>
                            <div className={styles.larguraTotal}>
                              <label className={styles.rotuloForm}>
                                Nome completo *
                              </label>
                              <input
                                value={formRt.nome}
                                onChange={(e) =>
                                  setFormRt((f) => ({
                                    ...f,
                                    nome: e.target.value,
                                  }))
                                }
                                placeholder="Nome do responsável técnico"
                              />
                            </div>
                            <div>
                              <label className={styles.rotuloForm}>CPF *</label>
                              <input
                                value={formRt.documento}
                                onChange={(e) =>
                                  setFormRt((f) => ({
                                    ...f,
                                    documento: mascararPorTipo(
                                      e.target.value,
                                      "FISICA",
                                    ),
                                  }))
                                }
                                placeholder="000.000.000-00"
                                inputMode="numeric"
                                maxLength={14}
                              />
                              <span className={styles.dica}>
                                Se o CPF já estiver cadastrado, a pessoa é
                                reaproveitada e só recebe o registro.
                              </span>
                            </div>
                            <div>
                              <label className={styles.rotuloForm}>
                                Conselho *
                              </label>
                              <select
                                value={formRt.conselho}
                                onChange={(e) =>
                                  setFormRt((f) => ({
                                    ...f,
                                    conselho: e.target.value,
                                  }))
                                }
                              >
                                <option value="CREA">CREA</option>
                                <option value="CAU">CAU</option>
                                <option value="CFT">CFT</option>
                              </select>
                            </div>
                            <div>
                              <label className={styles.rotuloForm}>
                                Nº do registro *
                              </label>
                              <input
                                value={formRt.numeroRegistro}
                                onChange={(e) =>
                                  setFormRt((f) => ({
                                    ...f,
                                    numeroRegistro: e.target.value,
                                  }))
                                }
                                placeholder="0123456789"
                              />
                            </div>
                            <div>
                              <label className={styles.rotuloForm}>
                                UF do registro
                              </label>
                              <select
                                value={formRt.ufRegistro}
                                onChange={(e) =>
                                  setFormRt((f) => ({
                                    ...f,
                                    ufRegistro: e.target.value,
                                  }))
                                }
                              >
                                <option value="">—</option>
                                {UFS.map((uf) => (
                                  <option key={uf} value={uf}>
                                    {uf}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className={styles.larguraTotal}>
                              <label className={styles.rotuloForm}>Título</label>
                              <input
                                value={formRt.titulo}
                                onChange={(e) =>
                                  setFormRt((f) => ({
                                    ...f,
                                    titulo: e.target.value,
                                  }))
                                }
                                placeholder="Eng. Civil"
                              />
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.55rem",
                              justifyContent: "flex-end",
                              marginTop: "0.85rem",
                            }}
                          >
                            <button
                              type="button"
                              className="btn-secundario"
                              onClick={() => setNovoRt(null)}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              className="btn-primario"
                              onClick={() => void salvarRt(i)}
                              disabled={salvandoRt}
                            >
                              {salvandoRt ? "Salvando…" : "Salvar profissional"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    <div>
                      <label className={styles.rotuloForm}>Papel</label>
                      <select
                        value={r.papel}
                        onChange={(e) =>
                          setResponsaveis((lista) =>
                            lista.map((item, j) =>
                              j === i ? { ...item, papel: e.target.value } : item,
                            ),
                          )
                        }
                      >
                        {PAPEIS.map((p) => (
                          <option key={p} value={p}>
                            {rotuloPapelRt(p)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={styles.rotuloForm}>
                        Tipo de documento
                      </label>
                      <select
                        value={r.tipoDocumento}
                        onChange={(e) =>
                          setResponsaveis((lista) =>
                            lista.map((item, j) =>
                              j === i
                                ? { ...item, tipoDocumento: e.target.value }
                                : item,
                            ),
                          )
                        }
                      >
                        <option value="ART">ART (CREA)</option>
                        <option value="RRT">RRT (CAU)</option>
                        <option value="TRT">TRT (CFT)</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.rotuloForm}>Número</label>
                      <input
                        value={r.numeroDocumento}
                        onChange={(e) =>
                          setResponsaveis((lista) =>
                            lista.map((item, j) =>
                              j === i
                                ? { ...item, numeroDocumento: e.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder="0000000000"
                      />
                    </div>
                    <div>
                      <label className={styles.rotuloForm}>Data</label>
                      <input
                        type="date"
                        value={r.dataDocumento}
                        onChange={(e) =>
                          setResponsaveis((lista) =>
                            lista.map((item, j) =>
                              j === i
                                ? { ...item, dataDocumento: e.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.rodapeFixo}>
          <Link href="/obras-privadas" className="btn-secundario">
            Cancelar
          </Link>
          <button type="submit" className="btn-primario" disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </form>
    </main>
  );
}
