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
  ChipTipo,
  Tabular,
  ValorTexto,
  type ColunaCadastro,
} from "@/components/cadastros/cadastro-ui";
import {
  ErroHttp,
  mensagemErro,
  proxyJson,
} from "@/components/cadastros/proxy-cadastros";
import { EntradaDinheiro } from "@/components/comum/entrada-dinheiro";
import {
  filtrarCadastro,
  moedaBRL,
  resumoRegistros,
  tipoFonteLabel,
} from "@/lib/ui/cadastro-labels";

const TIPOS_FONTE = ["FEDERAL", "ESTADUAL", "MUNICIPAL", "CONVENIO"] as const;
type TipoFonte = (typeof TIPOS_FONTE)[number];

interface Fonte {
  id: string;
  nome: string;
  descricao: string | null;
  codigo: string | null;
  tipo: TipoFonte | null;
  /** Valor em reais como string numerica (ex.: "1000.00") ou null. */
  valorPrevisto: string | null;
  vigencia: string | null;
  ativo: boolean;
}

interface FormFonte {
  codigo: string;
  tipo: string;
  nome: string;
  descricao: string;
  valorPrevisto: string;
  vigencia: string;
}

const FORM_VAZIO: FormFonte = {
  codigo: "",
  tipo: "",
  nome: "",
  descricao: "",
  valorPrevisto: "",
  vigencia: "",
};

export default function FontesPage() {
  const [itens, setItens] = useState<Fonte[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [versao, setVersao] = useState(0);

  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Fonte | null>(null);
  const [form, setForm] = useState<FormFonte>(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    // Lista todas (ativas e inativas) para a coluna Situação e a alternância.
    proxyJson<Fonte[]>("fontes")
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
    () => filtrarCadastro(itens, busca, (f) => [f.nome, f.codigo, f.descricao]),
    [itens, busca],
  );

  function abrirCriar() {
    setForm(FORM_VAZIO);
    setCriando(true);
    setEditando(null);
    setErroForm(null);
  }

  function abrirEditar(fonte: Fonte) {
    setForm({
      codigo: fonte.codigo ?? "",
      tipo: fonte.tipo ?? "",
      nome: fonte.nome,
      descricao: fonte.descricao ?? "",
      valorPrevisto: fonte.valorPrevisto ?? "",
      vigencia: fonte.vigencia ?? "",
    });
    setEditando(fonte);
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
    const valorPrevisto = form.valorPrevisto.trim()
      ? Number(form.valorPrevisto).toFixed(2)
      : "";
    const opcional = (chave: string, valor: string) =>
      valor.trim() ? { [chave]: valor.trim() } : {};
    // No PATCH, campos opcionais limpos sao enviados como null para apagar.
    const ouNulo = (valor: string) => (valor.trim() ? valor.trim() : null);
    try {
      if (editando) {
        await proxyJson(`fontes/${editando.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            nome: form.nome.trim(),
            codigo: ouNulo(form.codigo),
            tipo: form.tipo || null,
            descricao: ouNulo(form.descricao),
            valorPrevisto: valorPrevisto || null,
            vigencia: ouNulo(form.vigencia),
          }),
        });
      } else {
        await proxyJson("fontes", {
          method: "POST",
          body: JSON.stringify({
            nome: form.nome.trim(),
            ...opcional("codigo", form.codigo),
            ...(form.tipo ? { tipo: form.tipo } : {}),
            ...opcional("descricao", form.descricao),
            ...(valorPrevisto ? { valorPrevisto } : {}),
            ...opcional("vigencia", form.vigencia),
          }),
        });
      }
      fecharForm();
      setVersao((n) => n + 1);
    } catch (err) {
      // 409: codigo unico por tenant (RN-FIN-05) — exibido na propria tela.
      if (err instanceof ErroHttp && err.status === 409) {
        setErroForm(
          "Já existe uma fonte com este código no tenant. Informe outro código.",
        );
      } else {
        setErroForm(mensagemErro(err));
      }
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(fonte: Fonte) {
    setErroLista(null);
    try {
      await proxyJson(`fontes/${fonte.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: !fonte.ativo }),
      });
      setVersao((n) => n + 1);
    } catch (err) {
      setErroLista(mensagemErro(err));
    }
  }

  const colunas: ColunaCadastro<Fonte>[] = [
    {
      titulo: "Código",
      render: (f) =>
        f.codigo ? (
          <Tabular mudo>{f.codigo}</Tabular>
        ) : (
          <ValorTexto valor={null} />
        ),
    },
    {
      titulo: "Nome",
      ocultaNoCartao: true,
      render: (f) => <CelulaForte>{f.nome}</CelulaForte>,
    },
    { titulo: "Descrição", render: (f) => <ValorTexto valor={f.descricao} /> },
    {
      titulo: "Tipo",
      render: (f) => <ChipTipo label={tipoFonteLabel(f.tipo)} />,
    },
    {
      titulo: "Valor previsto",
      numerica: true,
      render: (f) =>
        f.valorPrevisto ? (
          <Tabular>{moedaBRL(f.valorPrevisto)}</Tabular>
        ) : (
          <ValorTexto valor={null} />
        ),
    },
    { titulo: "Situação", render: (f) => <ChipSituacao ativo={f.ativo} /> },
  ];

  const emForm = criando || editando !== null;

  if (emForm) {
    return (
      <CadastroPagina>
        <CadastroCabecalho
          titulo={
            <CadastroTrilha
              base="Fontes de recurso"
              atual={editando ? "Editar fonte" : "Nova fonte"}
            />
          }
        />
        <CadastroForm
          aoEnviar={salvar}
          aoCancelar={fecharForm}
          salvando={salvando}
          erro={erroForm}
        >
          <Campo rotulo="Código" dica="Código orçamentário, único por tenant.">
            <input
              value={form.codigo}
              onChange={(e) =>
                setForm((f) => ({ ...f, codigo: e.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="Tipo">
            <select
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
            >
              <option value="">—</option>
              {TIPOS_FONTE.map((t) => (
                <option key={t} value={t}>
                  {tipoFonteLabel(t)}
                </option>
              ))}
            </select>
          </Campo>
          <Campo rotulo="Nome" obrigatorio>
            <input
              required
              minLength={2}
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
          </Campo>
          <Campo rotulo="Descrição">
            <input
              value={form.descricao}
              onChange={(e) =>
                setForm((f) => ({ ...f, descricao: e.target.value }))
              }
            />
          </Campo>
          <Campo rotulo="Valor previsto" dica="Em reais, ex.: R$ 1.000,00.">
            <EntradaDinheiro
              valor={form.valorPrevisto}
              onChange={(valorPrevisto) =>
                setForm((f) => ({ ...f, valorPrevisto }))
              }
            />
          </Campo>
          <Campo rotulo="Vigência" dica="Texto livre, ex.: 2024 a 2027.">
            <input
              value={form.vigencia}
              onChange={(e) =>
                setForm((f) => ({ ...f, vigencia: e.target.value }))
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
        titulo="Fontes de recurso"
        sub={carregando ? "Carregando…" : resumoRegistros(itens.length)}
        acao={
          <button type="button" className="btn-primario" onClick={abrirCriar}>
            + Nova fonte
          </button>
        }
      />
      <CadastroBusca
        valor={busca}
        aoMudar={setBusca}
        placeholder="Buscar por nome, código ou descrição"
      />
      {erroLista && <AvisoCadastro tipo="erro">{erroLista}</AvisoCadastro>}
      {carregando ? (
        <CarregandoCadastro />
      ) : (
        <CadastroTabela
          colunas={colunas}
          itens={filtrados}
          obterId={(f) => f.id}
          tituloCartao={(f) => f.nome}
          acoes={(f) => (
            <>
              <BotaoEditar aoClicar={() => abrirEditar(f)} />
              <BotaoAlternarAtivo
                ativo={f.ativo}
                alvo="fonte"
                aoClicar={() => alternarAtivo(f)}
              />
            </>
          )}
          vazio={
            busca
              ? "Nenhuma fonte encontrada para a busca."
              : "Nenhuma fonte cadastrada."
          }
        />
      )}
    </CadastroPagina>
  );
}
