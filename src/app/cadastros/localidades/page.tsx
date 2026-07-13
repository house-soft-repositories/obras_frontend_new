"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AvisoCadastro,
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
  ChipTipo,
  Tabular,
  ValorTexto,
  type ColunaCadastro,
} from "@/components/cadastros/cadastro-ui";
import {
  mensagemErro,
  proxyJson,
} from "@/components/cadastros/proxy-cadastros";
import {
  filtrarCadastro,
  resumoRegistros,
  tipoLocalidadeLabel,
} from "@/lib/ui/cadastro-labels";

const TIPOS_LOCALIDADE = [
  "BAIRRO",
  "DISTRITO",
  "REGIAO",
  "ZONA_RURAL",
] as const;
type TipoLocalidade = (typeof TIPOS_LOCALIDADE)[number];

interface Localidade {
  id: string;
  nome: string;
  uf: string;
  codigoIbge: string | null;
  tipo: TipoLocalidade | null;
  municipio: string | null;
  observacoes: string | null;
  totalObras: number;
}

interface FormLocalidade {
  nome: string;
  tipo: string;
  municipio: string;
  uf: string;
  codigoIbge: string;
  observacoes: string;
}

const FORM_VAZIO: FormLocalidade = {
  nome: "",
  tipo: "",
  municipio: "",
  uf: "",
  codigoIbge: "",
  observacoes: "",
};

export default function LocalidadesPage() {
  const [itens, setItens] = useState<Localidade[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [versao, setVersao] = useState(0);

  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Localidade | null>(null);
  const [form, setForm] = useState<FormLocalidade>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    proxyJson<Localidade[]>("localidades")
      .then((d) => {
        if (!vivo) return;
        setItens(d);
        setErroLista(null);
      })
      .catch((e) => vivo && setErroLista(mensagemErro(e)))
      .finally(() => vivo && setCarregando(false));
    return () => {
      vivo = false;
    };
  }, [versao]);

  const filtrados = useMemo(
    () => filtrarCadastro(itens, busca, (l) => [l.nome, l.municipio, l.uf]),
    [itens, busca],
  );

  function abrirCriar() {
    setForm(FORM_VAZIO);
    setCriando(true);
    setEditando(null);
    setErroForm(null);
  }

  function abrirEditar(l: Localidade) {
    setForm({
      nome: l.nome,
      tipo: l.tipo ?? "",
      municipio: l.municipio ?? "",
      uf: l.uf,
      codigoIbge: l.codigoIbge ?? "",
      observacoes: l.observacoes ?? "",
    });
    setEditando(l);
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
    const uf = form.uf.trim().toUpperCase();
    const opcional = (chave: string, valor: string) =>
      valor.trim() ? { [chave]: valor.trim() } : {};
    // No PATCH, campos opcionais limpos sao enviados como null para apagar.
    const ouNulo = (valor: string) => (valor.trim() ? valor.trim() : null);
    try {
      if (editando) {
        await proxyJson(`localidades/${editando.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            nome: form.nome.trim(),
            uf,
            tipo: form.tipo || null,
            municipio: ouNulo(form.municipio),
            codigoIbge: ouNulo(form.codigoIbge),
            observacoes: ouNulo(form.observacoes),
          }),
        });
      } else {
        await proxyJson("localidades", {
          method: "POST",
          body: JSON.stringify({
            nome: form.nome.trim(),
            uf,
            ...(form.tipo ? { tipo: form.tipo } : {}),
            ...opcional("municipio", form.municipio),
            ...opcional("codigoIbge", form.codigoIbge),
            ...opcional("observacoes", form.observacoes),
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

  const colunas: ColunaCadastro<Localidade>[] = [
    {
      titulo: "Nome",
      ocultaNoCartao: true,
      render: (l) => <CelulaForte>{l.nome}</CelulaForte>,
    },
    {
      titulo: "Tipo",
      render: (l) => <ChipTipo label={tipoLocalidadeLabel(l.tipo)} />,
    },
    { titulo: "Município", render: (l) => <ValorTexto valor={l.municipio} /> },
    { titulo: "UF", render: (l) => l.uf },
    {
      titulo: "Obras",
      numerica: true,
      render: (l) => <Tabular>{l.totalObras}</Tabular>,
    },
  ];

  const emForm = criando || editando !== null;

  if (emForm) {
    return (
      <CadastroPagina>
        <CadastroCabecalho
          titulo={
            <CadastroTrilha
              base="Localidades"
              atual={editando ? "Editar localidade" : "Nova localidade"}
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
          <Campo rotulo="Tipo">
            <select
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
            >
              <option value="">—</option>
              {TIPOS_LOCALIDADE.map((t) => (
                <option key={t} value={t}>
                  {tipoLocalidadeLabel(t)}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Município">
            <input
              value={form.municipio}
              onChange={(e) =>
                setForm((f) => ({ ...f, municipio: e.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="UF" obrigatorio dica="Sigla com 2 letras, ex.: PI.">
            <input
              required
              maxLength={2}
              pattern="[A-Za-z]{2}"
              title="UF com 2 letras"
              value={form.uf}
              onChange={(e) => setForm((f) => ({ ...f, uf: e.target.value }))}
              style={{ textTransform: "uppercase" }}
            />
          </Campo>
          <Campo rotulo="Código IBGE">
            <input
              value={form.codigoIbge}
              inputMode="numeric"
              onChange={(e) =>
                setForm((f) => ({ ...f, codigoIbge: e.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="Observações" full>
            <textarea
              value={form.observacoes}
              onChange={(e) =>
                setForm((f) => ({ ...f, observacoes: e.target.value }))
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
        titulo="Localidades"
        sub={carregando ? "Carregando…" : resumoRegistros(itens.length)}
        acao={
          <button type="button" className="btn-primario" onClick={abrirCriar}>
            + Nova localidade
          </button>
        }
      />
      <CadastroBusca
        valor={busca}
        aoMudar={setBusca}
        placeholder="Buscar por nome, município ou UF"
      />
      {erroLista && <AvisoCadastro tipo="erro">{erroLista}</AvisoCadastro>}
      {carregando ? (
        <CarregandoCadastro />
      ) : (
        <CadastroTabela
          colunas={colunas}
          itens={filtrados}
          obterId={(l) => l.id}
          tituloCartao={(l) => l.nome}
          acoes={(l) => <BotaoEditar aoClicar={() => abrirEditar(l)} />}
          vazio={
            busca
              ? "Nenhuma localidade encontrada para a busca."
              : "Nenhuma localidade cadastrada."
          }
        />
      )}
    </CadastroPagina>
  );
}
