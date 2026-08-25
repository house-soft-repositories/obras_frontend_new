"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mensagemErro } from "@/components/cadastros/proxy-cadastros";
import styles from "@/components/obras-privadas/privadas.module.css";
import { cnpjValido, consultarCnpj, limparCnpj } from "@/lib/api/cnpj";
import {
  criarPessoa,
  criarProfissional,
  editarPessoa,
  listarPessoas,
  listarProfissionais,
  type Pessoa,
  type ProfissionalTecnico,
} from "@/lib/api/obras-privadas";
import {
  limparDocumento,
  mascararDocumento,
  mascararPorTipo,
  problemaDocumento,
  rotuloDocumento,
  siglaTipoPessoa,
  type TipoPessoa,
} from "@/lib/ui/documento";
import { rotuloConselho } from "@/lib/ui/obra-privada-labels";
import {
  limparTelefone,
  mascararTelefone,
  telefoneValido,
} from "@/lib/ui/telefone";

const UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

interface FormPessoa {
  tipo: TipoPessoa;
  nome: string;
  nomeFantasia: string;
  documento: string;
  rg: string;
  orgaoExpedidor: string;
  email: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  ativo: boolean;
}

interface FormProfissional {
  conselho: string;
  numeroRegistro: string;
  ufRegistro: string;
  titulo: string;
}

const PROF_VAZIO: FormProfissional = {
  conselho: "CREA",
  numeroRegistro: "",
  ufRegistro: "",
  titulo: "",
};

/** Retorno da consulta de CNPJ exibido sob o campo. */
type Consulta = { tipo: "ok" | "erro" | "info"; texto: string };

function formVazio(): FormPessoa {
  return {
    tipo: "FISICA",
    nome: "",
    nomeFantasia: "",
    documento: "",
    rg: "",
    orgaoExpedidor: "",
    email: "",
    telefone: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    uf: "",
    ativo: true,
  };
}

function deEntidade(p: Pessoa): FormPessoa {
  return {
    tipo: p.tipo,
    nome: p.nome,
    nomeFantasia: p.nomeFantasia ?? "",
    documento: mascararDocumento(p.documento),
    rg: p.rg ?? "",
    orgaoExpedidor: p.orgaoExpedidor ?? "",
    email: p.email ?? "",
    telefone: mascararTelefone(p.telefone ?? ""),
    cep: p.cep ?? "",
    logradouro: p.logradouro ?? "",
    numero: p.numero ?? "",
    complemento: p.complemento ?? "",
    bairro: p.bairro ?? "",
    cidade: p.cidade ?? "",
    uf: p.uf ?? "",
    ativo: p.ativo,
  };
}

/**
 * Cadastro de pessoas PF/PJ (RN-PRV-02): base de proprietarios de obra privada
 * e de responsaveis tecnicos. Segue o padrao das telas de `/cadastros`: lista e
 * formulario na MESMA pagina, alternados por estado, sem troca de rota.
 *
 * O perfil profissional (CREA/CAU/CFT) e concedido a partir daqui em vez de
 * ter tela propria: ele e uma extensao da pessoa, nao um cadastro paralelo.
 */
export default function PessoasPage() {
  const [itens, setItens] = useState<Pessoa[]>([]);
  const [profissionais, setProfissionais] = useState<ProfissionalTecnico[]>([]);
  const [busca, setBusca] = useState("");
  const [versao, setVersao] = useState(0);
  const [erroLista, setErroLista] = useState<string | null>(null);
  /** Versao ja refletida no estado; `carregando` deriva da comparacao. */
  const [versaoCarregada, setVersaoCarregada] = useState(-1);

  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);
  const [form, setForm] = useState<FormPessoa>(formVazio());
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [conceder, setConceder] = useState<string | null>(null);
  const [formProf, setFormProf] = useState<FormProfissional>(PROF_VAZIO);
  /** Marca o perfil profissional para ser criado junto com a pessoa nova. */
  const [comoProfissional, setComoProfissional] = useState(false);

  const [consulta, setConsulta] = useState<Consulta | null>(null);
  /** Ultimo CNPJ consultado, para nao repetir a chamada a cada tecla. */
  const cnpjConsultado = useRef("");

  useEffect(() => {
    let vivo = true;
    Promise.all([listarPessoas({ limit: 100 }), listarProfissionais()])
      .then(([pagina, profs]) => {
        if (!vivo) return;
        setItens(pagina.itens);
        setProfissionais(profs);
        setErroLista(null);
      })
      .catch((e) => {
        if (vivo) setErroLista(mensagemErro(e));
      })
      .finally(() => {
        // Marcar a versao no fim substitui um `setCarregando(true)` sincrono
        // no corpo do efeito, proibido por react-hooks/set-state-in-effect.
        if (vivo) setVersaoCarregada(versao);
      });
    return () => {
      vivo = false;
    };
  }, [versao]);

  const carregando = versaoCarregada !== versao;

  const registroPorPessoa = useMemo(
    () => new Map(profissionais.map((p) => [p.pessoaId, p])),
    [profissionais],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return itens;
    const digitos = limparDocumento(busca);
    return itens.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        (p.nomeFantasia ?? "").toLowerCase().includes(termo) ||
        (digitos.length > 0 && p.documento.includes(digitos)),
    );
  }, [itens, busca]);

  function set<K extends keyof FormPessoa>(chave: K, valor: FormPessoa[K]) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  function abrirNovo() {
    setForm(formVazio());
    setCriando(true);
    setEditando(null);
    setErroForm(null);
    setComoProfissional(false);
    setFormProf(PROF_VAZIO);
    setConsulta(null);
    cnpjConsultado.current = "";
  }

  function abrirEdicao(p: Pessoa) {
    setForm(deEntidade(p));
    setEditando(p.id);
    setCriando(false);
    setErroForm(null);
    setComoProfissional(false);
    setConsulta(null);
    // Nao reconsultar o CNPJ ja gravado ao abrir para edicao.
    cnpjConsultado.current = limparCnpj(p.documento);
  }

  function fecharForm() {
    setCriando(false);
    setEditando(null);
    setComoProfissional(false);
    setConsulta(null);
    cnpjConsultado.current = "";
  }

  /**
   * Mascara o documento conforme o tipo e, quando PJ, consulta a BrasilAPI
   * (Receita Federal) ao completar 14 digitos validos — mesmo comportamento do
   * cadastro de empresas contratadas em obras publicas. So preenche campos
   * ainda vazios: o que o usuario digitou nunca e sobrescrito.
   */
  async function aoMudarDocumento(valor: string) {
    const mascarado = mascararPorTipo(valor, form.tipo);
    set("documento", mascarado);
    if (form.tipo !== "JURIDICA") return;

    const digitos = limparCnpj(mascarado);
    if (digitos.length < 14) {
      setConsulta(null);
      cnpjConsultado.current = "";
      return;
    }
    if (!cnpjValido(digitos)) {
      setConsulta({
        tipo: "erro",
        texto: "CNPJ inválido: dígitos verificadores não conferem",
      });
      return;
    }
    if (cnpjConsultado.current === digitos) return;
    cnpjConsultado.current = digitos;
    setConsulta({ tipo: "info", texto: "Consultando CNPJ na Receita Federal…" });

    const resultado = await consultarCnpj(digitos);
    // Resposta antiga (o usuario ja digitou outro CNPJ): ignora.
    if (cnpjConsultado.current !== digitos) return;

    if (resultado.status === "nao-encontrado") {
      setConsulta({
        tipo: "erro",
        texto:
          "CNPJ não encontrado na Receita Federal — confira o número digitado",
      });
      return;
    }
    if (resultado.status === "indisponivel") {
      setConsulta({
        tipo: "info",
        texto:
          "Consulta de CNPJ indisponível no momento; preencha os dados manualmente",
      });
      return;
    }

    const d = resultado.dados;
    const ouAtual = (atual: string, novo: string | null) =>
      atual.trim() ? atual : (novo ?? "");
    setForm((f) => ({
      ...f,
      nome: ouAtual(f.nome, d.razaoSocial),
      nomeFantasia: ouAtual(f.nomeFantasia, d.nomeFantasia),
      email: ouAtual(f.email, d.email),
      telefone: f.telefone.trim()
        ? f.telefone
        : mascararTelefone(d.telefone ?? ""),
      cep: ouAtual(f.cep, d.cep),
      logradouro: ouAtual(f.logradouro, d.logradouro),
      numero: ouAtual(f.numero, d.numero),
      complemento: ouAtual(f.complemento, d.complemento),
      bairro: ouAtual(f.bairro, d.bairro),
      cidade: ouAtual(f.cidade, d.cidade),
      uf: ouAtual(f.uf, d.uf),
    }));
    setConsulta({
      tipo: "ok",
      texto: `Encontrado: ${d.razaoSocial}${
        d.situacaoCadastral ? ` (situação: ${d.situacaoCadastral})` : ""
      }`,
    });
  }

  const opcional = (v: string) => (v.trim() ? v.trim() : undefined);
  const ouNulo = (v: string) => (v.trim() ? v.trim() : null);

  /**
   * O perfil profissional so e oferecido no cadastro NOVO de pessoa fisica —
   * mesma regra do botao "Tornar profissional tecnico" da listagem.
   */
  const criarProfissionalJunto =
    criando && comoProfissional && form.tipo === "FISICA";

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErroForm(null);

    if (!form.nome.trim()) {
      setErroForm("Informe o nome ou a razão social.");
      return;
    }
    const documento = limparDocumento(form.documento);
    const problemaDoc = problemaDocumento(documento, form.tipo);
    if (problemaDoc) {
      setErroForm(problemaDoc);
      return;
    }
    // Telefone e opcional, mas se preenchido tem de estar completo.
    const telefone = limparTelefone(form.telefone);
    if (telefone && !telefoneValido(telefone)) {
      setErroForm("Telefone incompleto: informe DDD e número.");
      return;
    }
    // Validado antes de criar a pessoa: se so descobrissemos o registro vazio
    // depois, a pessoa ja estaria gravada e o reenvio bateria em 409.
    if (criarProfissionalJunto && !formProf.numeroRegistro.trim()) {
      setErroForm("Informe o número do registro no conselho.");
      return;
    }

    setSalvando(true);
    try {
      if (editando) {
        await editarPessoa(editando, {
          tipo: form.tipo,
          documento,
          nome: form.nome.trim(),
          nomeFantasia: ouNulo(form.nomeFantasia),
          rg: ouNulo(form.rg),
          orgaoExpedidor: ouNulo(form.orgaoExpedidor),
          email: ouNulo(form.email),
          telefone: telefone || null,
          cep: ouNulo(form.cep),
          logradouro: ouNulo(form.logradouro),
          numero: ouNulo(form.numero),
          complemento: ouNulo(form.complemento),
          bairro: ouNulo(form.bairro),
          cidade: ouNulo(form.cidade),
          uf: ouNulo(form.uf),
          ativo: form.ativo,
        });
      } else {
        const nova = await criarPessoa({
          tipo: form.tipo,
          documento,
          nome: form.nome.trim(),
          ...(opcional(form.nomeFantasia)
            ? { nomeFantasia: opcional(form.nomeFantasia) }
            : {}),
          ...(opcional(form.rg) ? { rg: opcional(form.rg) } : {}),
          ...(opcional(form.orgaoExpedidor)
            ? { orgaoExpedidor: opcional(form.orgaoExpedidor) }
            : {}),
          ...(opcional(form.email) ? { email: opcional(form.email) } : {}),
          ...(telefone ? { telefone } : {}),
          ...(opcional(form.cep) ? { cep: opcional(form.cep) } : {}),
          ...(opcional(form.logradouro)
            ? { logradouro: opcional(form.logradouro) }
            : {}),
          ...(opcional(form.numero) ? { numero: opcional(form.numero) } : {}),
          ...(opcional(form.complemento)
            ? { complemento: opcional(form.complemento) }
            : {}),
          ...(opcional(form.bairro) ? { bairro: opcional(form.bairro) } : {}),
          ...(opcional(form.cidade) ? { cidade: opcional(form.cidade) } : {}),
          ...(opcional(form.uf) ? { uf: opcional(form.uf) } : {}),
        });

        if (criarProfissionalJunto) {
          try {
            await criarProfissional({
              pessoaId: nova.id,
              conselho: formProf.conselho,
              numeroRegistro: formProf.numeroRegistro.trim(),
              ufRegistro: formProf.ufRegistro || undefined,
              titulo: formProf.titulo.trim() || undefined,
            });
          } catch (e) {
            // A pessoa JA foi gravada: reenviar o formulario bateria em 409 no
            // documento. Fecha, recarrega e avisa na listagem — de onde o
            // registro profissional pode ser concedido numa segunda tentativa.
            fecharForm();
            setVersao((v) => v + 1);
            setErroForm(
              `Pessoa cadastrada, mas o registro profissional falhou: ${mensagemErro(e)}`,
            );
            return;
          }
        }
      }
      fecharForm();
      setVersao((v) => v + 1);
    } catch (e) {
      setErroForm(mensagemErro(e));
    } finally {
      setSalvando(false);
    }
  }

  async function salvarProfissional(pessoaId: string) {
    setErroForm(null);
    if (!formProf.numeroRegistro.trim()) {
      setErroForm("Informe o número do registro no conselho.");
      return;
    }
    try {
      await criarProfissional({
        pessoaId,
        conselho: formProf.conselho,
        numeroRegistro: formProf.numeroRegistro.trim(),
        ufRegistro: formProf.ufRegistro || undefined,
        titulo: formProf.titulo.trim() || undefined,
      });
      setConceder(null);
      setFormProf(PROF_VAZIO);
      setVersao((v) => v + 1);
    } catch (e) {
      setErroForm(mensagemErro(e));
    }
  }

  const emForm = criando || editando !== null;

  if (emForm) {
    return (
      <main style={{ padding: "1.5rem 1.75rem" }}>
        <nav className={styles.trilha}>
          <button
            type="button"
            className={styles.trilhaLink}
            onClick={fecharForm}
          >
            Pessoas
          </button>
          <span className={styles.trilhaSep}>›</span>
          <span>{editando ? "Editar pessoa" : "Nova pessoa"}</span>
        </nav>

        <h1 className="page-titulo" style={{ marginTop: "0.75rem" }}>
          {editando ? "Editar pessoa" : "Nova pessoa"}
        </h1>
        <p className="page-sub">
          Cadastro usado como proprietário de obra privada e como base do perfil
          de responsável técnico.
        </p>

        <form className={styles.formulario} onSubmit={salvar}>
          {erroForm ? (
            <div className={styles.faixaErro} role="alert">
              <span aria-hidden>⛔</span>
              <div>
                <p className={styles.faixaErroTexto}>{erroForm}</p>
              </div>
            </div>
          ) : null}

          <div className={styles.card}>
            <p className={styles.cardTitulo}>Identificação</p>
            <div className={styles.grade2}>
              <div>
                <label className={styles.rotuloForm}>Tipo *</label>
                <select
                  value={form.tipo}
                  onChange={(e) => {
                    set("tipo", e.target.value as TipoPessoa);
                    set("documento", "");
                    setConsulta(null);
                    cnpjConsultado.current = "";
                  }}
                >
                  <option value="FISICA">Pessoa física (PF)</option>
                  <option value="JURIDICA">Pessoa jurídica (PJ)</option>
                </select>
              </div>
              <div>
                <label className={styles.rotuloForm}>
                  {rotuloDocumento(form.tipo)} *
                </label>
                <input
                  value={form.documento}
                  onChange={(e) => void aoMudarDocumento(e.target.value)}
                  placeholder={
                    form.tipo === "FISICA"
                      ? "000.000.000-00"
                      : "00.000.000/0000-00"
                  }
                  inputMode="numeric"
                  maxLength={form.tipo === "FISICA" ? 14 : 18}
                />
                {consulta ? (
                  <span
                    className={`${styles.dica} ${
                      consulta.tipo === "erro"
                        ? styles.dicaErro
                        : consulta.tipo === "ok"
                          ? styles.dicaOk
                          : ""
                    }`}
                  >
                    {consulta.texto}
                  </span>
                ) : form.tipo === "JURIDICA" ? (
                  <span className={styles.dica}>
                    Ao completar o CNPJ, os dados vêm da Receita Federal.
                  </span>
                ) : null}
              </div>
              <div className={styles.larguraTotal}>
                <label className={styles.rotuloForm}>
                  {form.tipo === "FISICA" ? "Nome completo *" : "Razão social *"}
                </label>
                <input
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                />
              </div>
              {form.tipo === "JURIDICA" ? (
                <div className={styles.larguraTotal}>
                  <label className={styles.rotuloForm}>Nome fantasia</label>
                  <input
                    value={form.nomeFantasia}
                    onChange={(e) => set("nomeFantasia", e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className={styles.rotuloForm}>RG</label>
                    <input
                      value={form.rg}
                      onChange={(e) => set("rg", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={styles.rotuloForm}>Órgão expedidor</label>
                    <input
                      value={form.orgaoExpedidor}
                      onChange={(e) => set("orgaoExpedidor", e.target.value)}
                      placeholder="SSP/SP"
                    />
                  </div>
                </>
              )}
              <div>
                <label className={styles.rotuloForm}>E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div>
                <label className={styles.rotuloForm}>Telefone</label>
                <input
                  value={form.telefone}
                  onChange={(e) =>
                    set("telefone", mascararTelefone(e.target.value))
                  }
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                  maxLength={15}
                />
              </div>

              {criando && form.tipo === "FISICA" ? (
                <div className={styles.blocoOpcional}>
                  <label className={styles.caixaSelecao}>
                    <input
                      type="checkbox"
                      checked={comoProfissional}
                      onChange={(e) => setComoProfissional(e.target.checked)}
                    />
                    Cadastrar também como profissional técnico
                  </label>
                  <p className={styles.caixaSelecaoTexto}>
                    Concede o perfil de responsável técnico (CREA/CAU/CFT) já no
                    cadastro, sem precisar voltar à listagem.
                  </p>

                  {comoProfissional ? (
                    <div className={styles.grade2} style={{ marginTop: "0.9rem" }}>
                      <div>
                        <label className={styles.rotuloForm}>Conselho *</label>
                        <select
                          value={formProf.conselho}
                          onChange={(e) =>
                            setFormProf((f) => ({
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
                          value={formProf.numeroRegistro}
                          onChange={(e) =>
                            setFormProf((f) => ({
                              ...f,
                              numeroRegistro: e.target.value,
                            }))
                          }
                          placeholder="0123456789"
                        />
                      </div>
                      <div>
                        <label className={styles.rotuloForm}>UF do registro</label>
                        <select
                          value={formProf.ufRegistro}
                          onChange={(e) =>
                            setFormProf((f) => ({
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
                      <div>
                        <label className={styles.rotuloForm}>Título</label>
                        <input
                          value={formProf.titulo}
                          onChange={(e) =>
                            setFormProf((f) => ({ ...f, titulo: e.target.value }))
                          }
                          placeholder="Eng. Civil"
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.cardSecao}>
            <p className={styles.cardTitulo}>Endereço</p>
            <div className={styles.grade2}>
              <div>
                <label className={styles.rotuloForm}>CEP</label>
                <input
                  value={form.cep}
                  onChange={(e) => set("cep", e.target.value)}
                  placeholder="00000-000"
                />
              </div>
              <div>
                <label className={styles.rotuloForm}>Número</label>
                <input
                  value={form.numero}
                  onChange={(e) => set("numero", e.target.value)}
                />
              </div>
              <div className={styles.larguraTotal}>
                <label className={styles.rotuloForm}>Logradouro</label>
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
                <label className={styles.rotuloForm}>Cidade</label>
                <input
                  value={form.cidade}
                  onChange={(e) => set("cidade", e.target.value)}
                />
              </div>
              <div>
                <label className={styles.rotuloForm}>UF</label>
                <select value={form.uf} onChange={(e) => set("uf", e.target.value)}>
                  <option value="">—</option>
                  {UFS.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
              {editando ? (
                <div>
                  <label className={styles.rotuloForm}>Situação</label>
                  <select
                    value={form.ativo ? "1" : "0"}
                    onChange={(e) => set("ativo", e.target.value === "1")}
                  >
                    <option value="1">Ativa</option>
                    <option value="0">Inativa</option>
                  </select>
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.rodapeFixo}>
            <button type="button" className="btn-secundario" onClick={fecharForm}>
              Cancelar
            </button>
            <button type="submit" className="btn-primario" disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main style={{ padding: "1.5rem 1.75rem" }}>
      <div className={styles.cabecalho}>
        <div>
          <h1 className="page-titulo">Pessoas</h1>
          <p className="page-sub">
            Proprietários e profissionais técnicos das obras privadas
          </p>
        </div>
        <button
          type="button"
          className="btn-primario"
          style={{ marginLeft: "auto" }}
          onClick={abrirNovo}
        >
          ＋ Nova pessoa
        </button>
      </div>

      <div className={styles.filtros}>
        <div className={styles.buscaCampo}>
          <span aria-hidden>🔍</span>
          <input
            className={styles.buscaInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou CPF/CNPJ…"
            aria-label="Buscar pessoa"
          />
        </div>
      </div>

      {erroLista ? (
        <div className={styles.faixaErro} role="alert" style={{ marginTop: "1rem" }}>
          <span aria-hidden>⛔</span>
          <div style={{ flex: 1 }}>
            <p className={styles.faixaErroTexto}>{erroLista}</p>
          </div>
          <button
            type="button"
            className={styles.botaoFantasma}
            onClick={() => setVersao((v) => v + 1)}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {erroForm && !emForm ? (
        <div className={styles.faixaErro} role="alert" style={{ marginTop: "1rem" }}>
          <span aria-hidden>⛔</span>
          <div>
            <p className={styles.faixaErroTexto}>{erroForm}</p>
          </div>
        </div>
      ) : null}

      {carregando ? (
        <div className={styles.carregando}>
          <div className={styles.carregandoTitulo}>
            <span className={styles.spinner} aria-hidden />
            Carregando pessoas…
          </div>
        </div>
      ) : filtrados.length === 0 ? (
        <div className={styles.vazio}>
          <div className={styles.vazioIcone} aria-hidden>
            👤
          </div>
          <p className={styles.vazioTitulo}>Nenhuma pessoa cadastrada</p>
          <p className={styles.vazioTexto}>
            Cadastre o proprietário antes de registrar a obra privada.
          </p>
        </div>
      ) : (
        <div className={styles.tabelaCard}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Documento</th>
                <th>Tipo</th>
                <th>Registro profissional</th>
                <th>Contato</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => {
                const prof = registroPorPessoa.get(p.id);
                return (
                  <tr key={p.id}>
                    <td>
                      <span className={styles.celulaForte}>{p.nome}</span>
                      {p.nomeFantasia ? (
                        <span className={styles.celulaFraca}>
                          {p.nomeFantasia}
                        </span>
                      ) : null}
                    </td>
                    <td className={styles.num}>
                      {mascararDocumento(p.documento)}
                    </td>
                    <td>
                      <span
                        className={`chip ${p.tipo === "FISICA" ? "chip-cinza" : "chip-roxo"}`}
                      >
                        {siglaTipoPessoa(p.tipo)}
                      </span>
                      {!p.ativo ? (
                        <span className="chip chip-cinza" style={{ marginLeft: 4 }}>
                          Inativa
                        </span>
                      ) : null}
                    </td>
                    <td>
                      {prof ? (
                        <span className="chip chip-teal">
                          {rotuloConselho(prof.conselho)} {prof.numeroRegistro}
                        </span>
                      ) : conceder === p.id ? (
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                          <select
                            value={formProf.conselho}
                            onChange={(e) =>
                              setFormProf((f) => ({ ...f, conselho: e.target.value }))
                            }
                            style={{ minHeight: 34, width: 90 }}
                          >
                            <option value="CREA">CREA</option>
                            <option value="CAU">CAU</option>
                            <option value="CFT">CFT</option>
                          </select>
                          <input
                            value={formProf.numeroRegistro}
                            onChange={(e) =>
                              setFormProf((f) => ({
                                ...f,
                                numeroRegistro: e.target.value,
                              }))
                            }
                            placeholder="Nº do registro"
                            style={{ minHeight: 34, width: 130 }}
                          />
                          <button
                            type="button"
                            className={styles.botaoFantasma}
                            onClick={() => void salvarProfissional(p.id)}
                          >
                            Salvar
                          </button>
                          <button
                            type="button"
                            className={styles.botaoFantasma}
                            onClick={() => setConceder(null)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : p.tipo === "FISICA" ? (
                        <button
                          type="button"
                          className={styles.botaoLink}
                          onClick={() => setConceder(p.id)}
                        >
                          ＋ Tornar profissional técnico
                        </button>
                      ) : (
                        <span style={{ color: "var(--cor-texto-apagado)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={styles.num}>
                        {p.telefone ? mascararTelefone(p.telefone) : "—"}
                      </span>
                      {p.email ? (
                        <span className={styles.celulaFraca}>{p.email}</span>
                      ) : null}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        type="button"
                        className={styles.botaoAcao}
                        title="Editar"
                        onClick={() => abrirEdicao(p)}
                      >
                        ✎
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
