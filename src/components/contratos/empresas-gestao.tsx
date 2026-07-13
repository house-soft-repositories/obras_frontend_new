"use client";

import { useMemo, useRef, useState } from "react";
import {
  AvisoCadastro,
  BotaoEditar,
  BotaoPerigo,
  CadastroBusca,
  CadastroCabecalho,
  CadastroForm,
  CadastroPagina,
  CadastroTabela,
  CadastroTrilha,
  Campo,
  CelulaForte,
  ChipSituacao,
  GrupoCampos,
  Tabular,
  ValorTexto,
  type ColunaCadastro,
} from "@/components/cadastros/cadastro-ui";
import s from "@/components/cadastros/cadastros.module.css";
import {
  atualizarEmpresa,
  criarEmpresa,
  ErroApi,
  excluirEmpresa,
  listarEmpresas,
  validarEmpresa,
  type EmpresaContratada,
} from "@/lib/api/contratos";
import {
  cnpjValido,
  consultarCnpj,
  limparCnpj,
  mascararCnpj,
} from "@/lib/api/cnpj";
import { filtrarCadastro, resumoRegistros } from "@/lib/ui/cadastro-labels";

/** Item da listagem: cadastro + situacao logica e total de contratos. */
export type EmpresaListagemItem = EmpresaContratada & {
  ativo: boolean;
  totalContratos: number;
};

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

interface FormEmpresa {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  responsavel: string;
  cargoResponsavel: string;
  email: string;
  ativo: boolean;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  telefones: string[];
}

const VAZIO: FormEmpresa = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  responsavel: "",
  cargoResponsavel: "",
  email: "",
  ativo: true,
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  uf: "",
  telefones: [""],
};

function paraForm(e: EmpresaListagemItem): FormEmpresa {
  return {
    razaoSocial: e.razaoSocial,
    nomeFantasia: e.nomeFantasia ?? "",
    cnpj: e.cnpj,
    responsavel: e.responsavel ?? "",
    cargoResponsavel: e.cargoResponsavel ?? "",
    email: e.email ?? "",
    ativo: e.ativo,
    cep: e.cep ?? "",
    logradouro: e.logradouro ?? "",
    numero: e.numero ?? "",
    complemento: e.complemento ?? "",
    bairro: e.bairro ?? "",
    cidade: e.cidade ?? "",
    uf: e.uf ?? "",
    telefones: e.telefones.length > 0 ? e.telefones : [""],
  };
}

export function EmpresasGestao({
  empresasIniciais,
  podeEditar,
}: {
  empresasIniciais: EmpresaListagemItem[];
  podeEditar: boolean;
}) {
  const [empresas, setEmpresas] =
    useState<EmpresaListagemItem[]>(empresasIniciais);
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState<FormEmpresa>(VAZIO);
  const [erro, setErro] = useState<string | null>(null);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [consulta, setConsulta] = useState<{
    tipo: "info" | "ok" | "erro";
    texto: string;
  } | null>(null);
  const cnpjConsultado = useRef("");

  const filtradas = useMemo(
    () =>
      filtrarCadastro(empresas, busca, (e) => [
        e.razaoSocial,
        e.nomeFantasia,
        e.cnpj,
      ]),
    [empresas, busca],
  );

  async function recarregar() {
    try {
      setEmpresas((await listarEmpresas()) as EmpresaListagemItem[]);
    } catch (e) {
      setErro(mensagemErro(e));
    }
  }

  function abrirCriar() {
    setForm(VAZIO);
    setCriando(true);
    setEditandoId(null);
    setErro(null);
    setErroForm(null);
    setConsulta(null);
    cnpjConsultado.current = "";
  }

  function abrirEditar(e: EmpresaListagemItem) {
    setForm(paraForm(e));
    setEditandoId(e.id);
    setCriando(false);
    setErro(null);
    setErroForm(null);
    setConsulta(null);
    // Nao reconsultar o CNPJ ja gravado ao abrir para edicao.
    cnpjConsultado.current = limparCnpj(e.cnpj);
  }

  function fechar() {
    setCriando(false);
    setEditandoId(null);
    setForm(VAZIO);
    setErroForm(null);
    setConsulta(null);
    cnpjConsultado.current = "";
  }

  /**
   * Mascara o CNPJ enquanto digita e, ao completar 14 digitos validos,
   * consulta a BrasilAPI (Receita Federal) uma unica vez por numero:
   * encontrado -> preenche nome/e-mail/telefone vazios; 404 -> avisa que o
   * CNPJ nao existe; API fora -> orienta a preencher manualmente.
   */
  async function aoMudarCnpj(valor: string) {
    const mascarado = mascararCnpj(valor);
    setForm((f) => ({ ...f, cnpj: mascarado }));
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
    setConsulta({
      tipo: "info",
      texto: "Consultando CNPJ na Receita Federal...",
    });
    const resultado = await consultarCnpj(digitos);
    // Resposta antiga (usuario ja digitou outro CNPJ): ignora.
    if (cnpjConsultado.current !== digitos) return;
    if (resultado.status === "nao-encontrado") {
      setConsulta({
        tipo: "erro",
        texto:
          "CNPJ não encontrado na Receita Federal — confira o número digitado",
      });
    } else if (resultado.status === "indisponivel") {
      setConsulta({
        tipo: "info",
        texto:
          "Consulta de CNPJ indisponível no momento; preencha os dados manualmente",
      });
    } else {
      const d = resultado.dados;
      // Preenche apenas campos ainda vazios (nao sobrescreve o que o usuario digitou).
      const ouAtual = (atual: string, novo: string | null) =>
        atual.trim() ? atual : (novo ?? "");
      setForm((f) => ({
        ...f,
        razaoSocial: ouAtual(f.razaoSocial, d.razaoSocial),
        nomeFantasia: ouAtual(f.nomeFantasia, d.nomeFantasia),
        email: ouAtual(f.email, d.email),
        responsavel: ouAtual(f.responsavel, d.responsavel),
        cargoResponsavel: ouAtual(f.cargoResponsavel, d.cargoResponsavel),
        cep: ouAtual(f.cep, d.cep),
        logradouro: ouAtual(f.logradouro, d.logradouro),
        numero: ouAtual(f.numero, d.numero),
        complemento: ouAtual(f.complemento, d.complemento),
        bairro: ouAtual(f.bairro, d.bairro),
        cidade: ouAtual(f.cidade, d.cidade),
        uf: ouAtual(f.uf, d.uf),
        telefones: f.telefones.some((t) => t.trim())
          ? f.telefones
          : [d.telefone ?? ""],
      }));
      setConsulta({
        tipo: "ok",
        texto: `Encontrado: ${d.razaoSocial}${
          d.situacaoCadastral ? ` (situação: ${d.situacaoCadastral})` : ""
        }`,
      });
    }
  }

  function setTelefone(i: number, valor: string) {
    setForm((f) => {
      const tels = [...f.telefones];
      tels[i] = valor;
      return { ...f, telefones: tels };
    });
  }
  function addTelefone() {
    setForm((f) => ({ ...f, telefones: [...f.telefones, ""] }));
  }
  function removerTelefone(i: number) {
    setForm((f) => ({
      ...f,
      telefones: f.telefones.filter((_, idx) => idx !== i),
    }));
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErroForm(null);
    const problemas = validarEmpresa(form);
    if (problemas.length > 0) {
      setErroForm(problemas.join(", "));
      return;
    }
    setSalvando(true);
    const opcional = (chave: string, valor: string) =>
      valor.trim() ? { [chave]: valor.trim() } : {};
    const payload = {
      razaoSocial: form.razaoSocial.trim(),
      cnpj: form.cnpj.trim(),
      ativo: form.ativo,
      ...opcional("nomeFantasia", form.nomeFantasia),
      ...opcional("responsavel", form.responsavel),
      ...opcional("cargoResponsavel", form.cargoResponsavel),
      ...opcional("email", form.email),
      ...opcional("cep", form.cep),
      ...opcional("logradouro", form.logradouro),
      ...opcional("numero", form.numero),
      ...opcional("complemento", form.complemento),
      ...opcional("bairro", form.bairro),
      ...opcional("cidade", form.cidade),
      ...opcional("uf", form.uf),
      telefones: form.telefones.map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (editandoId) {
        await atualizarEmpresa(editandoId, payload);
      } else {
        await criarEmpresa(payload);
      }
      await recarregar();
      fechar();
    } catch (err) {
      setErroForm(mensagemErro(err));
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(e: EmpresaListagemItem) {
    if (!confirm(`Excluir a empresa "${e.razaoSocial}"?`)) return;
    setErro(null);
    try {
      await excluirEmpresa(e.id);
      await recarregar();
    } catch (err) {
      setErro(mensagemErro(err));
    }
  }

  const colunas: ColunaCadastro<EmpresaListagemItem>[] = [
    {
      titulo: "Razão social",
      ocultaNoCartao: true,
      render: (e) => (
        <CelulaForte>
          {e.razaoSocial}
          {e.nomeFantasia ? ` (${e.nomeFantasia})` : ""}
        </CelulaForte>
      ),
    },
    { titulo: "CNPJ", render: (e) => <Tabular>{e.cnpj}</Tabular> },
    { titulo: "Contato", render: (e) => <ValorTexto valor={e.email} /> },
    {
      titulo: "Contratos",
      numerica: true,
      render: (e) => <Tabular>{e.totalContratos}</Tabular>,
    },
    { titulo: "Situação", render: (e) => <ChipSituacao ativo={e.ativo} /> },
  ];

  const emForm = (criando || editandoId !== null) && podeEditar;

  if (emForm) {
    return (
      <CadastroPagina>
        <CadastroCabecalho
          titulo={
            <CadastroTrilha
              base="Empresas contratadas"
              atual={editandoId ? "Editar empresa" : "Nova empresa"}
            />
          }
        />
        <CadastroForm
          aoEnviar={salvar}
          aoCancelar={fechar}
          salvando={salvando}
          erro={erroForm}
        >
          <Campo
            rotulo="CNPJ"
            obrigatorio
            dica={
              consulta && (
                <span
                  className={
                    consulta.tipo === "erro"
                      ? s.dicaErro
                      : consulta.tipo === "ok"
                        ? s.dicaOk
                        : undefined
                  }
                >
                  {consulta.texto}
                </span>
              )
            }
          >
            <input
              required
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              maxLength={18}
              value={form.cnpj}
              onChange={(ev) => aoMudarCnpj(ev.target.value)}
            />
          </Campo>
          <Campo rotulo="Razão social" obrigatorio>
            <input
              required
              value={form.razaoSocial}
              onChange={(ev) =>
                setForm((f) => ({ ...f, razaoSocial: ev.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="Nome fantasia">
            <input
              value={form.nomeFantasia}
              onChange={(ev) =>
                setForm((f) => ({ ...f, nomeFantasia: ev.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="Situação">
            <select
              value={form.ativo ? "true" : "false"}
              onChange={(ev) =>
                setForm((f) => ({ ...f, ativo: ev.target.value === "true" }))
              }
            >
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </select>
          </Campo>
          <Campo rotulo="Responsável">
            <input
              value={form.responsavel}
              onChange={(ev) =>
                setForm((f) => ({ ...f, responsavel: ev.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="Cargo do responsável">
            <input
              value={form.cargoResponsavel}
              onChange={(ev) =>
                setForm((f) => ({ ...f, cargoResponsavel: ev.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="E-mail">
            <input
              type="email"
              value={form.email}
              onChange={(ev) =>
                setForm((f) => ({ ...f, email: ev.target.value }))
              }
            />
          </Campo>

          <GrupoCampos titulo="Endereço">
            <Campo rotulo="CEP">
              <input
                value={form.cep}
                placeholder="00000-000"
                onChange={(ev) =>
                  setForm((f) => ({ ...f, cep: ev.target.value }))
                }
              />
            </Campo>
            <Campo rotulo="Logradouro">
              <input
                value={form.logradouro}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, logradouro: ev.target.value }))
                }
              />
            </Campo>
            <Campo rotulo="Número">
              <input
                value={form.numero}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, numero: ev.target.value }))
                }
              />
            </Campo>
            <Campo rotulo="Complemento">
              <input
                value={form.complemento}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, complemento: ev.target.value }))
                }
              />
            </Campo>
            <Campo rotulo="Bairro">
              <input
                value={form.bairro}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, bairro: ev.target.value }))
                }
              />
            </Campo>
            <Campo rotulo="Cidade">
              <input
                value={form.cidade}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, cidade: ev.target.value }))
                }
              />
            </Campo>
            <Campo rotulo="UF">
              <input
                maxLength={2}
                value={form.uf}
                onChange={(ev) =>
                  setForm((f) => ({ ...f, uf: ev.target.value }))
                }
              />
            </Campo>
          </GrupoCampos>

          <GrupoCampos titulo="Telefones">
            {form.telefones.map((t, i) => (
              <Campo key={i} rotulo={`Telefone ${i + 1}`} full>
                <span className={s.linhaCampos}>
                  <input
                    value={t}
                    placeholder="(00) 00000-0000"
                    onChange={(ev) => setTelefone(i, ev.target.value)}
                  />
                  <button type="button" onClick={() => removerTelefone(i)}>
                    Remover
                  </button>
                </span>
              </Campo>
            ))}
            <div className={s.campoFull}>
              <button type="button" onClick={addTelefone}>
                + Adicionar telefone
              </button>
            </div>
          </GrupoCampos>
        </CadastroForm>
      </CadastroPagina>
    );
  }

  return (
    <CadastroPagina>
      <CadastroCabecalho
        titulo="Empresas contratadas"
        sub={resumoRegistros(empresas.length)}
        acao={
          podeEditar ? (
            <button type="button" className="btn-primario" onClick={abrirCriar}>
              + Nova empresa
            </button>
          ) : undefined
        }
      />
      <CadastroBusca
        valor={busca}
        aoMudar={setBusca}
        placeholder="Buscar por nome ou CNPJ"
      />
      {erro && <AvisoCadastro tipo="erro">{erro}</AvisoCadastro>}
      <CadastroTabela
        colunas={colunas}
        itens={filtradas}
        obterId={(e) => e.id}
        tituloCartao={(e) => (
          <>
            {e.razaoSocial}
            {e.nomeFantasia ? ` (${e.nomeFantasia})` : ""}
          </>
        )}
        acoes={
          podeEditar
            ? (e) => (
                <>
                  <BotaoEditar aoClicar={() => abrirEditar(e)} />
                  <BotaoPerigo
                    titulo={`Excluir ${e.razaoSocial}`}
                    aoClicar={() => excluir(e)}
                  >
                    Excluir
                  </BotaoPerigo>
                </>
              )
            : undefined
        }
        vazio={
          busca
            ? "Nenhuma empresa encontrada para a busca."
            : "Nenhuma empresa cadastrada."
        }
      />
    </CadastroPagina>
  );
}
