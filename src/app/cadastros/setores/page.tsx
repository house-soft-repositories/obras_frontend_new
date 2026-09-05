"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AvisoCadastro,
  BotaoAlternarAtivo,
  BotaoEditar,
  CadastroBusca,
  CadastroCabecalho,
  CadastroForm,
  CadastroNota,
  CadastroPagina,
  CadastroTabela,
  CadastroTrilha,
  Campo,
  CarregandoCadastro,
  CelulaForte,
  ChipSituacao,
  ValorTexto,
  type ColunaCadastro,
} from "@/components/cadastros/cadastro-ui";
import {
  mensagemErro,
  proxyJson,
} from "@/components/cadastros/proxy-cadastros";
import { filtrarCadastro, resumoRegistros } from "@/lib/ui/cadastro-labels";

interface Orgao {
  id: string;
  nome: string;
  sigla: string | null;
  ativo: boolean;
}

interface SetorApi {
  id: string;
  nome: string;
  ativo: boolean;
}

interface Setor extends SetorApi {
  orgaoId: string;
  orgaoNome: string;
  orgaoSigla: string | null;
}

interface FormSetor {
  nome: string;
  orgaoId: string;
}

const FORM_VAZIO: FormSetor = {
  nome: "",
  orgaoId: "",
};

export default function SetoresPage() {
  const [orgaos, setOrgaos] = useState<Orgao[]>([]);
  const [itens, setItens] = useState<Setor[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [versao, setVersao] = useState(0);

  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Setor | null>(null);
  const [form, setForm] = useState<FormSetor>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    proxyJson<Orgao[]>("orgaos")
      .then(async (listaOrgaos) => {
        const setoresPorOrgao = await Promise.all(
          listaOrgaos.map(async (orgao) => {
            const setores = await proxyJson<SetorApi[]>(
              `orgaos/${orgao.id}/setores`,
            );
            return setores.map((setor) => ({
              ...setor,
              orgaoId: orgao.id,
              orgaoNome: orgao.nome,
              orgaoSigla: orgao.sigla,
            }));
          }),
        );
        if (!vivo) return;
        setOrgaos(listaOrgaos);
        setItens(setoresPorOrgao.flat());
        setErroLista(null);
      })
      .catch((e) => vivo && setErroLista(mensagemErro(e)))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [versao]);

  const filtrados = useMemo(
    () =>
      filtrarCadastro(itens, busca, (s) => [
        s.nome,
        s.orgaoNome,
        s.orgaoSigla,
      ]),
    [itens, busca],
  );

  function abrirCriar() {
    setForm({ ...FORM_VAZIO, orgaoId: orgaos[0]?.id ?? "" });
    setCriando(true);
    setEditando(null);
    setErroForm(null);
  }

  function abrirEditar(setor: Setor) {
    setForm({
      nome: setor.nome,
      orgaoId: setor.orgaoId,
    });
    setEditando(setor);
    setCriando(false);
    setErroForm(null);
  }

  function fecharForm() {
    setCriando(false);
    setEditando(null);
    setErroForm(null);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErroForm(null);
    setSalvando(true);
    try {
      if (editando) {
        await proxyJson(`orgaos/${editando.orgaoId}/setores/${editando.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            nome: form.nome.trim(),
            orgaoId: form.orgaoId,
          }),
        });
      } else {
        await proxyJson(`orgaos/${form.orgaoId}/setores`, {
          method: "POST",
          body: JSON.stringify({
            nome: form.nome.trim(),
          }),
        });
      }
      fecharForm();
      setVersao((n) => n + 1);
    } catch (err) {
      setErroForm(mensagemErro(err));
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(setor: Setor) {
    setErroLista(null);
    try {
      await proxyJson(`orgaos/${setor.orgaoId}/setores/${setor.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: !setor.ativo }),
      });
      setVersao((n) => n + 1);
    } catch (err) {
      setErroLista(mensagemErro(err));
    }
  }

  const colunas: ColunaCadastro<Setor>[] = [
    {
      titulo: "Nome",
      ocultaNoCartao: true,
      render: (s) => <CelulaForte>{s.nome}</CelulaForte>,
    },
    {
      titulo: "Órgão",
      render: (s) => (
        <span>
          <ValorTexto valor={s.orgaoNome} />
          {s.orgaoSigla && <span className="page-sub"> {s.orgaoSigla}</span>}
        </span>
      ),
    },
    { titulo: "Situação", render: (s) => <ChipSituacao ativo={s.ativo} /> },
  ];

  const emForm = criando || editando !== null;

  if (emForm) {
    return (
      <CadastroPagina>
        <CadastroCabecalho
          titulo={
            <CadastroTrilha
              base="Setores"
              atual={editando ? "Editar setor" : "Novo setor"}
            />
          }
        />
        <CadastroForm
          aoEnviar={salvar}
          aoCancelar={fecharForm}
          salvando={salvando}
          erro={erroForm}
        >
          <Campo rotulo="Nome" obrigatorio>
            <input
              required
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
          </Campo>
          <Campo
            rotulo="Órgão"
            obrigatorio
            dica="Órgão responsável pelo setor."
          >
            <select
              required
              value={form.orgaoId}
              onChange={(e) =>
                setForm((f) => ({ ...f, orgaoId: e.target.value }))
              }
            >
              <option value="">Selecione…</option>
              {orgaos.map((orgao) => (
                <option key={orgao.id} value={orgao.id}>
                  {orgao.sigla ? `${orgao.sigla} - ` : ""}
                  {orgao.nome}
                </option>
              ))}
            </select>
          </Campo>
        </CadastroForm>
      </CadastroPagina>
    );
  }

  return (
    <CadastroPagina>
      <CadastroCabecalho
        titulo="Setores"
        sub={carregando ? "Carregando…" : resumoRegistros(itens.length)}
        descricao="Unidades operacionais organizadas dentro de cada órgão."
        acao={
          <button
            type="button"
            className="btn-primario"
            onClick={abrirCriar}
            disabled={orgaos.length === 0}
          >
            + Novo setor
          </button>
        }
      />
      <CadastroNota titulo="Permissão de administração">
        Você pode criar e editar setores deste tenant.
      </CadastroNota>
      <CadastroBusca
        valor={busca}
        aoMudar={setBusca}
        placeholder="Buscar por setor ou órgão"
      />
      {erroLista && <AvisoCadastro tipo="erro">{erroLista}</AvisoCadastro>}
      {!carregando && orgaos.length === 0 && !erroLista && (
        <AvisoCadastro tipo="aviso">
          Cadastre um órgão antes de criar setores.
        </AvisoCadastro>
      )}
      {carregando ? (
        <CarregandoCadastro />
      ) : (
        <CadastroTabela
          colunas={colunas}
          itens={filtrados}
          obterId={(s) => `${s.orgaoId}:${s.id}`}
          tituloCartao={(s) => s.nome}
          acoes={(s) => (
            <>
              <BotaoEditar aoClicar={() => abrirEditar(s)} />
              <BotaoAlternarAtivo
                ativo={s.ativo}
                alvo="setor"
                aoClicar={() => alternarAtivo(s)}
              />
            </>
          )}
          vazio={
            busca
              ? "Nenhum setor encontrado para a busca."
              : "Nenhum setor cadastrado."
          }
        />
      )}
    </CadastroPagina>
  );
}
