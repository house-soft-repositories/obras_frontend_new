"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AvisoCadastro,
  BotaoAlternarAtivo,
  BotaoEditar,
  CadastroBusca,
  CadastroCabecalho,
  CadastroForm,
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
import {
  filtrarCadastro,
  montarAtribuicaoPerfil,
  PERFIS_ATRIBUIVEIS,
  resumoRegistros,
} from "@/lib/ui/cadastro-labels";
import { perfilLabel } from "@/lib/ui/obra-labels";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  orgaoId: string | null;
  setorId: string | null;
  localidadeId: string | null;
  ativo: boolean;
  ultimoAcessoEm: string | null;
  /** Perfis atribuidos (PerfilUsuario[]), expostos pela listagem. */
  perfis: string[];
}

interface OrgaoOpcao {
  id: string;
  nome: string;
}

interface SetorOpcao {
  id: string;
  nome: string;
  ativo: boolean;
}

interface LocalidadeOpcao {
  id: string;
  nome: string;
  uf: string;
}

interface FormUsuario {
  nome: string;
  email: string;
  senha: string;
  orgaoId: string;
  setorId: string;
  localidadeId: string;
  perfil: string;
}

const FORM_VAZIO: FormUsuario = {
  nome: "",
  email: "",
  senha: "",
  orgaoId: "",
  setorId: "",
  localidadeId: "",
  perfil: "",
};

export default function UsuariosPage() {
  const [itens, setItens] = useState<Usuario[]>([]);
  const [orgaos, setOrgaos] = useState<OrgaoOpcao[]>([]);
  const [localidades, setLocalidades] = useState<LocalidadeOpcao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [versao, setVersao] = useState(0);

  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<FormUsuario>(FORM_VAZIO);
  /** Setores carregados, marcados com o orgao a que pertencem. */
  const [setoresCarregados, setSetoresCarregados] = useState<{
    orgaoId: string;
    lista: SetorOpcao[];
  }>({ orgaoId: "", lista: [] });
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      proxyJson<Usuario[]>("usuarios"),
      proxyJson<OrgaoOpcao[]>("orgaos"),
      proxyJson<LocalidadeOpcao[]>("localidades"),
    ])
      .then(([usuarios, orgs, locs]) => {
        if (!vivo) return;
        setItens(usuarios);
        setOrgaos(orgs);
        setLocalidades(locs);
        setErroLista(null);
      })
      .catch((e) => vivo && setErroLista(mensagemErro(e)))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [versao]);

  const emForm = criando || editando !== null;

  // Setores do orgao selecionado no formulario (GET /orgaos/:id/setores).
  useEffect(() => {
    if (!emForm || !form.orgaoId) return;
    const orgaoId = form.orgaoId;
    let vivo = true;
    proxyJson<SetorOpcao[]>(`orgaos/${orgaoId}/setores`)
      .then((d) => vivo && setSetoresCarregados({ orgaoId, lista: d }))
      .catch(() => vivo && setSetoresCarregados({ orgaoId, lista: [] }));
    return () => {
      vivo = false;
    };
  }, [emForm, form.orgaoId]);

  // So exibe a lista quando ela corresponde ao orgao atualmente selecionado.
  const setores =
    setoresCarregados.orgaoId === form.orgaoId ? setoresCarregados.lista : [];

  const nomesOrgaos = useMemo(
    () => new Map(orgaos.map((o) => [o.id, o.nome])),
    [orgaos],
  );

  const filtrados = useMemo(
    () => filtrarCadastro(itens, busca, (u) => [u.nome, u.email]),
    [itens, busca],
  );

  function abrirCriar() {
    setForm(FORM_VAZIO);
    setCriando(true);
    setEditando(null);
    setErroForm(null);
    setAviso(null);
  }

  function abrirEditar(u: Usuario) {
    setForm({
      nome: u.nome,
      email: u.email,
      senha: "",
      orgaoId: u.orgaoId ?? "",
      setorId: u.setorId ?? "",
      localidadeId: u.localidadeId ?? "",
      perfil: "",
    });
    setEditando(u);
    setCriando(false);
    setErroForm(null);
    setAviso(null);
  }

  function fecharForm() {
    setCriando(false);
    setEditando(null);
    setErroForm(null);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErroForm(null);

    if (editando) {
      setSalvando(true);
      try {
        await proxyJson(`usuarios/${editando.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            nome: form.nome.trim(),
            // Orgao nao pode ser esvaziado (RN-IDE-01): so envia se selecionado.
            ...(form.orgaoId ? { orgaoId: form.orgaoId } : {}),
            // Setor/localidade limpos sao enviados como null para desvincular.
            setorId: form.setorId || null,
            localidadeId: form.localidadeId || null,
          }),
        });
        fecharForm();
        setVersao((n) => n + 1);
      } catch (err) {
        setErroForm(mensagemErro(err));
      } finally {
        setSalvando(false);
      }
      return;
    }

    // Criacao: valida a coerencia do perfil ANTES de criar o usuario.
    const atribuicao = montarAtribuicaoPerfil(
      form.perfil,
      form.orgaoId || null,
    );
    if (atribuicao && !atribuicao.ok) {
      setErroForm(atribuicao.erro);
      return;
    }
    setSalvando(true);
    try {
      const criado = await proxyJson<{ id: string }>("usuarios", {
        method: "POST",
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
          orgaoId: form.orgaoId,
          ...(form.setorId ? { setorId: form.setorId } : {}),
          ...(form.localidadeId ? { localidadeId: form.localidadeId } : {}),
        }),
      });
      if (atribuicao?.ok) {
        try {
          await proxyJson(`usuarios/${criado.id}/atribuicoes`, {
            method: "POST",
            body: JSON.stringify(atribuicao.payload),
          });
        } catch (err) {
          setAviso(
            `Usuário criado, mas o perfil ${perfilLabel(
              atribuicao.payload.perfil,
            )} não foi atribuído (${mensagemErro(err)}).`,
          );
        }
      }
      fecharForm();
      setVersao((n) => n + 1);
    } catch (err) {
      setErroForm(mensagemErro(err));
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(u: Usuario) {
    setErroLista(null);
    try {
      await proxyJson(`usuarios/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: !u.ativo }),
      });
      setVersao((n) => n + 1);
    } catch (err) {
      setErroLista(mensagemErro(err));
    }
  }

  const colunas: ColunaCadastro<Usuario>[] = [
    {
      titulo: "Nome",
      ocultaNoCartao: true,
      render: (u) => <CelulaForte>{u.nome}</CelulaForte>,
    },
    { titulo: "E-mail", render: (u) => u.email },
    {
      titulo: "Perfil",
      render: (u) =>
        u.perfis.length > 0 ? (
          <span className="chip chip-azul">{perfilLabel(u.perfis[0])}</span>
        ) : (
          <ValorTexto valor={null} />
        ),
    },
    {
      titulo: "Órgão",
      render: (u) => (
        <ValorTexto valor={u.orgaoId ? nomesOrgaos.get(u.orgaoId) : null} />
      ),
    },
    { titulo: "Status", render: (u) => <ChipSituacao ativo={u.ativo} /> },
  ];

  if (emForm) {
    const setorAtualForaDaLista =
      form.setorId !== "" && !setores.some((s) => s.id === form.setorId);
    return (
      <CadastroPagina>
        <CadastroCabecalho
          titulo={
            <CadastroTrilha
              base="Usuários"
              atual={editando ? "Editar usuário" : "Novo usuário"}
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
            rotulo="E-mail"
            obrigatorio={!editando}
            dica={editando ? "O e-mail não pode ser alterado." : undefined}
          >
            <input
              type="email"
              required={!editando}
              disabled={editando !== null}
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </Campo>
          {!editando && (
            <Campo
              rotulo="Senha inicial"
              obrigatorio
              dica="Mínimo de 6 caracteres."
            >
              <input
                type="password"
                required
                minLength={6}
                value={form.senha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, senha: e.target.value }))
                }
              />
            </Campo>
          )}
          <Campo rotulo="Órgão" obrigatorio={!editando}>
            <select
              required={!editando}
              value={form.orgaoId}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  orgaoId: e.target.value,
                  setorId: "",
                }))
              }
            >
              <option value="">Selecione…</option>
              {orgaos.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.nome}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Setor" dica="Opcional; setores do órgão selecionado.">
            <select
              value={form.setorId}
              disabled={!form.orgaoId}
              onChange={(e) =>
                setForm((f) => ({ ...f, setorId: e.target.value }))
              }
            >
              <option value="">—</option>
              {setorAtualForaDaLista && (
                <option value={form.setorId}>(setor atual)</option>
              )}
              {setores.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.nome}
                  {st.ativo ? "" : " (inativo)"}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Localidade" dica="Opcional; domicílio do usuário.">
            <select
              value={form.localidadeId}
              onChange={(e) =>
                setForm((f) => ({ ...f, localidadeId: e.target.value }))
              }
            >
              <option value="">—</option>
              {localidades.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome} ({l.uf})
                </option>
              ))}
            </select>
          </Campo>
          {!editando && (
            <Campo
              rotulo="Perfil (opcional)"
              dica="Gestor exige órgão selecionado; a atribuição é feita após a criação."
            >
              <select
                value={form.perfil}
                onChange={(e) =>
                  setForm((f) => ({ ...f, perfil: e.target.value }))
                }
              >
                <option value="">Sem perfil</option>
                {PERFIS_ATRIBUIVEIS.map((p) => (
                  <option key={p} value={p}>
                    {perfilLabel(p)}
                  </option>
                ))}
              </select>
            </Campo>
          )}
        </CadastroForm>
      </CadastroPagina>
    );
  }

  return (
    <CadastroPagina>
      <CadastroCabecalho
        titulo="Usuários"
        sub={carregando ? "Carregando…" : resumoRegistros(itens.length)}
        acao={
          <button type="button" className="btn-primario" onClick={abrirCriar}>
            + Novo usuário
          </button>
        }
      />
      <CadastroBusca
        valor={busca}
        aoMudar={setBusca}
        placeholder="Buscar por nome ou e-mail"
      />
      {erroLista && <AvisoCadastro tipo="erro">{erroLista}</AvisoCadastro>}
      {aviso && <AvisoCadastro tipo="aviso">{aviso}</AvisoCadastro>}
      {carregando ? (
        <CarregandoCadastro />
      ) : (
        <CadastroTabela
          colunas={colunas}
          itens={filtrados}
          obterId={(u) => u.id}
          tituloCartao={(u) => u.nome}
          acoes={(u) => (
            <>
              <BotaoEditar aoClicar={() => abrirEditar(u)} />
              <BotaoAlternarAtivo
                ativo={u.ativo}
                alvo="usuário"
                aoClicar={() => alternarAtivo(u)}
              />
            </>
          )}
          vazio={
            busca
              ? "Nenhum usuário encontrado para a busca."
              : "Nenhum usuário cadastrado."
          }
        />
      )}
    </CadastroPagina>
  );
}
