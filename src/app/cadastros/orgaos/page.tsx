"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AvisoCadastro,
  BotaoAcao,
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
  ChipTipo,
  Tabular,
  ValorTexto,
  type ColunaCadastro,
} from "@/components/cadastros/cadastro-ui";
import {
  mensagemErro,
  proxyJson,
} from "@/components/cadastros/proxy-cadastros";
import { OrgaoSetores } from "@/components/identidade/orgao-setores";
import {
  filtrarCadastro,
  resumoRegistros,
  tipoOrgaoLabel,
} from "@/lib/ui/cadastro-labels";

const TIPOS_ORGAO = [
  "SECRETARIA",
  "AUTARQUIA",
  "FUNDACAO",
  "EMPRESA_PUBLICA",
] as const;
type TipoOrgao = (typeof TIPOS_ORGAO)[number];

interface Orgao {
  id: string;
  nome: string;
  sigla: string | null;
  tipo: TipoOrgao | null;
  responsavel: string | null;
  email: string | null;
  telefone: string | null;
  localidadeId: string;
  ativo: boolean;
  totalObras: number;
}

interface LocalidadeOpcao {
  id: string;
  nome: string;
  uf: string;
}

interface FormOrgao {
  nome: string;
  sigla: string;
  tipo: string;
  responsavel: string;
  email: string;
  telefone: string;
  localidadeId: string;
}

const FORM_VAZIO: FormOrgao = {
  nome: "",
  sigla: "",
  tipo: "",
  responsavel: "",
  email: "",
  telefone: "",
  localidadeId: "",
};

export default function OrgaosPage() {
  const [itens, setItens] = useState<Orgao[]>([]);
  const [localidades, setLocalidades] = useState<LocalidadeOpcao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [versao, setVersao] = useState(0);

  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Orgao | null>(null);
  const [form, setForm] = useState<FormOrgao>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  /** Orgao com o painel de setores aberto (RN-IDE-03, linha expansivel). */
  const [setoresDoOrgao, setSetoresDoOrgao] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      proxyJson<Orgao[]>("orgaos"),
      proxyJson<LocalidadeOpcao[]>("localidades"),
    ])
      .then(([orgaos, locs]) => {
        if (!vivo) return;
        setItens(orgaos);
        setLocalidades(locs);
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
      filtrarCadastro(itens, busca, (o) => [o.nome, o.sigla, o.responsavel]),
    [itens, busca],
  );

  function abrirCriar() {
    setForm(FORM_VAZIO);
    setCriando(true);
    setEditando(null);
    setErroForm(null);
  }

  function abrirEditar(o: Orgao) {
    setForm({
      nome: o.nome,
      sigla: o.sigla ?? "",
      tipo: o.tipo ?? "",
      responsavel: o.responsavel ?? "",
      email: o.email ?? "",
      telefone: o.telefone ?? "",
      localidadeId: o.localidadeId,
    });
    setEditando(o);
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
    const opcional = (chave: string, valor: string) =>
      valor.trim() ? { [chave]: valor.trim() } : {};
    // No PATCH, campos opcionais limpos sao enviados como null para apagar.
    const ouNulo = (valor: string) => (valor.trim() ? valor.trim() : null);
    try {
      if (editando) {
        await proxyJson(`orgaos/${editando.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            nome: form.nome.trim(),
            localidadeId: form.localidadeId,
            sigla: ouNulo(form.sigla),
            tipo: form.tipo || null,
            responsavel: ouNulo(form.responsavel),
            email: ouNulo(form.email),
            telefone: ouNulo(form.telefone),
          }),
        });
      } else {
        await proxyJson("orgaos", {
          method: "POST",
          body: JSON.stringify({
            nome: form.nome.trim(),
            localidadeId: form.localidadeId,
            ...opcional("sigla", form.sigla),
            ...(form.tipo ? { tipo: form.tipo } : {}),
            ...opcional("responsavel", form.responsavel),
            ...opcional("email", form.email),
            ...opcional("telefone", form.telefone),
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

  async function alternarAtivo(o: Orgao) {
    setErroLista(null);
    try {
      await proxyJson(`orgaos/${o.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: !o.ativo }),
      });
      setVersao((n) => n + 1);
    } catch (err) {
      setErroLista(mensagemErro(err));
    }
  }

  const colunas: ColunaCadastro<Orgao>[] = [
    {
      titulo: "Nome",
      ocultaNoCartao: true,
      render: (o) => <CelulaForte>{o.nome}</CelulaForte>,
    },
    { titulo: "Sigla", render: (o) => <ValorTexto valor={o.sigla} /> },
    {
      titulo: "Tipo",
      render: (o) => <ChipTipo label={tipoOrgaoLabel(o.tipo)} />,
    },
    {
      titulo: "Responsável",
      render: (o) => <ValorTexto valor={o.responsavel} />,
    },
    {
      titulo: "Obras",
      numerica: true,
      render: (o) => <Tabular>{o.totalObras}</Tabular>,
    },
    { titulo: "Situação", render: (o) => <ChipSituacao ativo={o.ativo} /> },
  ];

  const emForm = criando || editando !== null;

  if (emForm) {
    return (
      <CadastroPagina>
        <CadastroCabecalho
          titulo={
            <CadastroTrilha
              base="Órgãos"
              atual={editando ? "Editar órgão" : "Novo órgão"}
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
          <Campo rotulo="Sigla">
            <input
              value={form.sigla}
              onChange={(e) =>
                setForm((f) => ({ ...f, sigla: e.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="Tipo">
            <select
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
            >
              <option value="">—</option>
              {TIPOS_ORGAO.map((t) => (
                <option key={t} value={t}>
                  {tipoOrgaoLabel(t)}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Responsável">
            <input
              value={form.responsavel}
              onChange={(e) =>
                setForm((f) => ({ ...f, responsavel: e.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="E-mail institucional">
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="Telefone">
            <input
              value={form.telefone}
              placeholder="(00) 0000-0000"
              onChange={(e) =>
                setForm((f) => ({ ...f, telefone: e.target.value }))
              }
            />
          </Campo>
          <Campo
            rotulo="Localidade"
            obrigatorio
            dica="Localidade sede do órgão (obrigatória)."
          >
            <select
              required
              value={form.localidadeId}
              onChange={(e) =>
                setForm((f) => ({ ...f, localidadeId: e.target.value }))
              }
            >
              <option value="">Selecione…</option>
              {localidades.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nome} ({l.uf})
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
        titulo="Órgãos"
        sub={carregando ? "Carregando…" : resumoRegistros(itens.length)}
        acao={
          <button type="button" className="btn-primario" onClick={abrirCriar}>
            + Novo órgão
          </button>
        }
      />
      <CadastroBusca
        valor={busca}
        aoMudar={setBusca}
        placeholder="Buscar por nome, sigla ou responsável"
      />
      {erroLista && <AvisoCadastro tipo="erro">{erroLista}</AvisoCadastro>}
      {carregando ? (
        <CarregandoCadastro />
      ) : (
        <CadastroTabela
          colunas={colunas}
          itens={filtrados}
          obterId={(o) => o.id}
          tituloCartao={(o) => o.nome}
          acoes={(o) => (
            <>
              <BotaoEditar aoClicar={() => abrirEditar(o)} />
              <BotaoAcao
                titulo={`Setores de ${o.nome}`}
                expandido={setoresDoOrgao === o.id}
                aoClicar={() =>
                  setSetoresDoOrgao((atual) => (atual === o.id ? null : o.id))
                }
              >
                Setores
              </BotaoAcao>
              <BotaoAlternarAtivo
                ativo={o.ativo}
                alvo="órgão"
                aoClicar={() => alternarAtivo(o)}
              />
            </>
          )}
          painelExpandido={(o) =>
            setoresDoOrgao === o.id ? (
              <OrgaoSetores orgaoId={o.id} embutido />
            ) : null
          }
          vazio={
            busca
              ? "Nenhum órgão encontrado para a busca."
              : "Nenhum órgão cadastrado."
          }
        />
      )}
    </CadastroPagina>
  );
}
