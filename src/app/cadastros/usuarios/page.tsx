"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AvisoCadastro,
  CadastroBusca,
  CadastroCabecalho,
  CadastroForm,
  CadastroPagina,
  CadastroTabela,
  CadastroTrilha,
  Campo,
  CarregandoCadastro,
  CelulaForte,
  ValorTexto,
  type ColunaCadastro,
} from "@/components/cadastros/cadastro-ui";
import {
  mensagemErro,
  proxyJson,
} from "@/components/cadastros/proxy-cadastros";
import { filtrarCadastro, resumoRegistros } from "@/lib/ui/cadastro-labels";

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: "STAFF" | "USER";
  tenantId?: string | null;
}

interface FormUsuario {
  name: string;
  email: string;
  password: string;
  role: "STAFF" | "USER";
  tenantId: string;
}

const FORM_VAZIO: FormUsuario = {
  name: "",
  email: "",
  password: "",
  role: "USER",
  tenantId: "",
};

export default function UsuariosPage() {
  const [itens, setItens] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [versao, setVersao] = useState(0);

  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState<FormUsuario>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    proxyJson<Usuario[]>("users")
      .then((usuarios) => {
        if (!vivo) return;
        setItens(usuarios);
        setErroLista(null);
      })
      .catch((e) => vivo && setErroLista(mensagemErro(e)))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [versao]);

  const emForm = criando;

  const filtrados = useMemo(
    () => filtrarCadastro(itens, busca, (u) => [u.name, u.email]),
    [itens, busca],
  );

  function abrirCriar() {
    setForm(FORM_VAZIO);
    setCriando(true);
    setErroForm(null);
  }

  function fecharForm() {
    setCriando(false);
    setErroForm(null);
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErroForm(null);

    setSalvando(true);
    try {
      await proxyJson<{ id: string }>("users", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          ...(form.tenantId.trim() ? { tenantId: form.tenantId.trim() } : {}),
        }),
      });
      fecharForm();
      setVersao((n) => n + 1);
    } catch (err) {
      setErroForm(mensagemErro(err));
    } finally {
      setSalvando(false);
    }
  }

  const colunas: ColunaCadastro<Usuario>[] = [
    {
      titulo: "Nome",
      ocultaNoCartao: true,
      render: (u) => <CelulaForte>{u.name}</CelulaForte>,
    },
    { titulo: "E-mail", render: (u) => u.email },
    {
      titulo: "Papel",
      render: (u) => u.role,
    },
    { titulo: "Tenant", render: (u) => <ValorTexto valor={u.tenantId} /> },
  ];

  if (emForm) {
    return (
      <CadastroPagina>
        <CadastroCabecalho
          titulo={<CadastroTrilha base="Usuários" atual="Novo usuário" />}
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
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Campo>
          <Campo rotulo="E-mail" obrigatorio>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </Campo>
          <Campo
            rotulo="Senha inicial"
            obrigatorio
            dica="Mínimo de 6 caracteres."
          >
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="Papel" obrigatorio>
            <select
              required
              value={form.role}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  role: e.target.value as FormUsuario["role"],
                }))
              }
            >
              <option value="USER">Usuário</option>
              <option value="STAFF">Equipe</option>
            </select>
          </Campo>
          <Campo
            rotulo="Tenant ID"
            dica="Opcional para SUPERADMIN; para ADMIN o backend aplica o tenant da sessão."
          >
            <input
              value={form.tenantId}
              onChange={(e) =>
                setForm((f) => ({ ...f, tenantId: e.target.value }))
              }
            />
          </Campo>
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
      {carregando ? (
        <CarregandoCadastro />
      ) : (
        <CadastroTabela
          colunas={colunas}
          itens={filtrados}
          obterId={(u) => u.id}
          tituloCartao={(u) => u.name}
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
