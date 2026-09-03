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
  ChipSituacao,
  Tabular,
  type ColunaCadastro,
} from "@/components/cadastros/cadastro-ui";
import {
  mensagemErro,
  proxyJson,
} from "@/components/cadastros/proxy-cadastros";
import { filtrarCadastro, resumoRegistros } from "@/lib/ui/cadastro-labels";

interface Tenant {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
}

interface FormTenant {
  nome: string;
  slug: string;
  cnpj: string;
}

const FORM_VAZIO: FormTenant = { nome: "", slug: "", cnpj: "" };

export default function TenantsPage() {
  const [itens, setItens] = useState<Tenant[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [versao, setVersao] = useState(0);

  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState<FormTenant>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    proxyJson<Tenant[]>("tenancies")
      .then((d) => {
        if (!vivo) return;
        setItens(d);
        setErroLista(null);
      })
      .catch(() => {
        if (!vivo) return;
        setItens([]);
        setErroLista("Acesso restrito a SUPERADMIN ou API indisponível.");
      })
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [versao]);

  const filtrados = useMemo(
    () => filtrarCadastro(itens, busca, (t) => [t.nome, t.slug]),
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
      const cnpj = form.cnpj.replace(/\D/g, "");
      if (cnpj && cnpj.length !== 14) {
        setErroForm("Informe um CNPJ com 14 dígitos.");
        return;
      }
      await proxyJson("tenancies", {
        method: "POST",
        body: JSON.stringify({
          name: form.nome.trim(),
          slug: form.slug.trim(),
          ...(cnpj ? { cnpj } : {}),
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

  const colunas: ColunaCadastro<Tenant>[] = [
    {
      titulo: "Nome",
      ocultaNoCartao: true,
      render: (t) => <CelulaForte>{t.nome}</CelulaForte>,
    },
    { titulo: "Slug", render: (t) => <Tabular mudo>{t.slug}</Tabular> },
    { titulo: "Situação", render: (t) => <ChipSituacao ativo={t.ativo} /> },
  ];

  if (criando) {
    return (
      <CadastroPagina>
        <CadastroCabecalho
          titulo={<CadastroTrilha base="Tenants" atual="Novo tenant" />}
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
            rotulo="Slug"
            obrigatorio
            dica="kebab-case, ex.: prefeitura-demo."
          >
            <input
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            />
          </Campo>
          <Campo rotulo="CNPJ">
            <input
              value={form.cnpj}
              placeholder="00.000.000/0000-00"
              onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
            />
          </Campo>
        </CadastroForm>
      </CadastroPagina>
    );
  }

  return (
    <CadastroPagina>
      <CadastroCabecalho
        titulo="Tenants"
        sub={carregando ? "Carregando…" : resumoRegistros(itens.length)}
        acao={
          <button type="button" className="btn-primario" onClick={abrirCriar}>
            + Novo tenant
          </button>
        }
      />
      <CadastroBusca
        valor={busca}
        aoMudar={setBusca}
        placeholder="Buscar por nome ou slug"
      />
      {erroLista && <AvisoCadastro tipo="erro">{erroLista}</AvisoCadastro>}
      {carregando ? (
        <CarregandoCadastro />
      ) : (
        <CadastroTabela
          colunas={colunas}
          itens={filtrados}
          obterId={(t) => t.id}
          tituloCartao={(t) => t.nome}
          vazio={
            busca
              ? "Nenhum tenant encontrado para a busca."
              : "Nenhum tenant cadastrado."
          }
        />
      )}
    </CadastroPagina>
  );
}
