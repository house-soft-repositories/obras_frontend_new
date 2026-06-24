"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ACOES_CONVENIADA,
  construirPayloadObra,
  criarObra,
  datasSomenteLeitura,
  ErroApi,
  GUIAS_OBRA,
  MODOS_DURACAO,
  STATUS_OBRA,
  subclassificacaoHabilitada,
  TIPOS_FINANCIAMENTO,
  TIPOS_OBRA,
  atualizarObra,
  aplicarTags,
  type AtualizarObraPayload,
  type ChaveGuia,
  type FormularioObra,
  type OrcamentoPrevisto,
} from "@/lib/api/obras";

export interface OpcaoSelect {
  id: string;
  nome: string;
}

export interface OpcoesObra {
  orgaos: OpcaoSelect[];
  fontes: OpcaoSelect[];
  eixos: OpcaoSelect[];
  classificacoes: OpcaoSelect[];
  tipologias: OpcaoSelect[];
}

export interface ObraFormProps {
  modo: "criar" | "editar";
  opcoes: OpcoesObra;
  obraId?: string;
  valoresIniciais?: Partial<FormularioObra>;
  tagsIniciais?: string;
  /** Painel extra renderizado em cada guia de recurso (apenas no modo editar). */
  guiasRecurso?: Partial<Record<ChaveGuia, React.ReactNode>>;
}

const VAZIO: FormularioObra = {
  nome: "",
  tipo: "OBRA",
  responsavelUsuarioId: "",
  orgaoId: "",
  modoDuracao: "DEFINIDO_PELO_USUARIO",
  tipoFinanciamento: "SEM_OGU",
  acaoConveniada: "NAO",
  orcamentos: [{ fonteId: "", valor: "" }],
};

export function ObraForm({
  modo,
  opcoes,
  obraId,
  valoresIniciais,
  tagsIniciais,
  guiasRecurso,
}: ObraFormProps) {
  const router = useRouter();
  const [guia, setGuia] = useState<ChaveGuia>("projeto");
  const [form, setForm] = useState<FormularioObra>({
    ...VAZIO,
    ...valoresIniciais,
    orcamentos: valoresIniciais?.orcamentos ?? VAZIO.orcamentos,
  });
  const [tags, setTags] = useState(tagsIniciais ?? "");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const subDesabilitada = !subclassificacaoHabilitada(form.tipo);
  const datasTravadas = useMemo(
    () => datasSomenteLeitura(form.modoDuracao ?? "DEFINIDO_PELO_USUARIO"),
    [form.modoDuracao],
  );

  function set<K extends keyof FormularioObra>(
    chave: K,
    valor: FormularioObra[K],
  ) {
    setForm((f) => ({ ...f, [chave]: valor }));
  }

  function setOrcamento(i: number, campo: keyof OrcamentoPrevisto, v: string) {
    setForm((f) => {
      const orcamentos = f.orcamentos.map((o, idx) =>
        idx === i ? { ...o, [campo]: v } : o,
      );
      return { ...f, orcamentos };
    });
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const payload = construirPayloadObra(form);
      const salva =
        modo === "criar"
          ? ((await criarObra(payload)) as { id: string })
          : ((await atualizarObra(
              obraId!,
              payload as unknown as AtualizarObraPayload,
            )) as { id: string });
      const idFinal = salva?.id ?? obraId;
      if (tags.trim() && idFinal) {
        await aplicarTags(idFinal, tags);
      }
      router.push(`/obras/${idFinal}/editar`);
      router.refresh();
    } catch (e) {
      if (e instanceof ErroApi) {
        const corpo = e.corpo as { message?: string | string[] };
        const msg = Array.isArray(corpo?.message)
          ? corpo.message.join(", ")
          : corpo?.message;
        setErro(`Erro ${e.status}: ${msg ?? "falha ao salvar"}`);
      } else {
        setErro("Falha de rede ao salvar");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviar} style={{ maxWidth: 760 }}>
      <nav style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {GUIAS_OBRA.map((g) => (
          <button
            type="button"
            key={g.chave}
            onClick={() => setGuia(g.chave)}
            aria-current={guia === g.chave}
            style={{
              padding: "0.4rem 0.8rem",
              fontWeight: guia === g.chave ? 700 : 400,
              borderBottom: guia === g.chave ? "2px solid #06c" : "2px solid transparent",
            }}
          >
            {g.titulo}
          </button>
        ))}
      </nav>

      {guia === "projeto" && (
        <section style={grade}>
          <Campo label="Nome" obrigatorio>
            <input
              required
              value={form.nome}
              onChange={(e) => set("nome", e.target.value)}
            />
          </Campo>
          <Campo label="Tipo">
            <select
              value={form.tipo}
              onChange={(e) => set("tipo", e.target.value)}
            >
              {TIPOS_OBRA.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Responsavel (usuario id)" obrigatorio>
            <input
              required
              value={form.responsavelUsuarioId}
              onChange={(e) => set("responsavelUsuarioId", e.target.value)}
            />
          </Campo>
          <Campo label="Orgao" obrigatorio>
            <Selecao
              vazio="Selecione o orgao"
              opcoes={opcoes.orgaos}
              valor={form.orgaoId}
              onChange={(v) => set("orgaoId", v)}
            />
          </Campo>
          {modo === "editar" && (
            <Campo label="Status">
              <select
                value={form.status ?? "EM_ABERTO"}
                onChange={(e) => set("status", e.target.value)}
              >
                {STATUS_OBRA.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Campo>
          )}
          <Campo label="Financiamento">
            <select
              value={form.tipoFinanciamento}
              onChange={(e) => set("tipoFinanciamento", e.target.value)}
            >
              {TIPOS_FINANCIAMENTO.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Modo de duracao">
            <select
              value={form.modoDuracao}
              onChange={(e) => set("modoDuracao", e.target.value)}
            >
              {MODOS_DURACAO.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Data inicio">
            <input
              type="date"
              readOnly={datasTravadas}
              value={form.dataInicio ?? ""}
              onChange={(e) => set("dataInicio", e.target.value)}
            />
          </Campo>
          <Campo label="Data prazo">
            <input
              type="date"
              readOnly={datasTravadas}
              value={form.dataPrazo ?? ""}
              onChange={(e) => set("dataPrazo", e.target.value)}
            />
          </Campo>
          <Campo label="Acao conveniada">
            <select
              value={form.acaoConveniada}
              onChange={(e) => set("acaoConveniada", e.target.value)}
            >
              {ACOES_CONVENIADA.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Campo>
          <Campo label="Eixo">
            <Selecao
              vazio="(nenhum)"
              opcoes={opcoes.eixos}
              valor={form.eixoId ?? ""}
              onChange={(v) => set("eixoId", v)}
            />
          </Campo>
          <Campo label="Classificacao">
            <Selecao
              vazio="(nenhuma)"
              opcoes={opcoes.classificacoes}
              valor={form.classificacaoId ?? ""}
              onChange={(v) => set("classificacaoId", v)}
            />
          </Campo>
          <Campo
            label={
              subDesabilitada
                ? "Subclassificacao (Nao se aplica)"
                : "Subclassificacao (id)"
            }
          >
            <input
              disabled={subDesabilitada}
              value={subDesabilitada ? "" : (form.subclassificacaoId ?? "")}
              onChange={(e) => set("subclassificacaoId", e.target.value)}
            />
          </Campo>
          <Campo label="Tipologia">
            <Selecao
              vazio="(nenhuma)"
              opcoes={opcoes.tipologias}
              valor={form.tipologiaId ?? ""}
              onChange={(v) => set("tipologiaId", v)}
            />
          </Campo>
          <Campo label="Prioritaria">
            <input
              type="checkbox"
              checked={!!form.prioritaria}
              onChange={(e) => set("prioritaria", e.target.checked)}
            />
          </Campo>
          <Campo label="Tags (virgula/ponto-e-virgula)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} />
          </Campo>
        </section>
      )}

      {guia === "geral" && (
        <section style={grade}>
          <h3>Orcamento previsto (fonte + valor)</h3>
          {form.orcamentos.map((o, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <Selecao
                vazio="Selecione a fonte"
                opcoes={opcoes.fontes}
                valor={o.fonteId}
                onChange={(v) => setOrcamento(i, "fonteId", v)}
              />
              <input
                placeholder="valor"
                value={o.valor}
                onChange={(e) => setOrcamento(i, "valor", e.target.value)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              set("orcamentos", [...form.orcamentos, { fonteId: "", valor: "" }])
            }
          >
            + adicionar fonte
          </button>
          <Campo label="Unidade de medida">
            <input
              value={form.unidadeMedida ?? ""}
              onChange={(e) => set("unidadeMedida", e.target.value)}
            />
          </Campo>
          <Campo label="Quantidade">
            <input
              value={form.quantidade ?? ""}
              onChange={(e) => set("quantidade", e.target.value)}
            />
          </Campo>
          <Campo label="Programa PPA">
            <input
              value={form.programaPpa ?? ""}
              onChange={(e) => set("programaPpa", e.target.value)}
            />
          </Campo>
          <Campo label="Secretario(a)">
            <input
              value={form.secretario ?? ""}
              onChange={(e) => set("secretario", e.target.value)}
            />
          </Campo>
          <Campo label="Data pactuada">
            <input
              type="date"
              value={form.dataPactuada ?? ""}
              onChange={(e) => set("dataPactuada", e.target.value)}
            />
          </Campo>
        </section>
      )}

      {guia !== "projeto" &&
        guia !== "geral" &&
        (guiasRecurso?.[guia] ?? (
          <p>Salve a obra para gerenciar esta guia.</p>
        ))}

      {erro && (
        <p role="alert" style={{ color: "crimson", marginTop: 12 }}>
          {erro}
        </p>
      )}
      <div style={{ marginTop: 16 }}>
        <button type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : modo === "criar" ? "Criar obra" : "Salvar"}
        </button>
      </div>
    </form>
  );
}

const grade: React.CSSProperties = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "1fr 1fr",
};

function Campo({
  label,
  obrigatorio,
  children,
}: {
  label: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 4 }}>
      <span>
        {label}
        {obrigatorio ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function Selecao({
  opcoes,
  valor,
  onChange,
  vazio,
}: {
  opcoes: OpcaoSelect[];
  valor: string;
  onChange: (v: string) => void;
  vazio: string;
}) {
  return (
    <select value={valor} onChange={(e) => onChange(e.target.value)}>
      <option value="">{vazio}</option>
      {opcoes.map((o) => (
        <option key={o.id} value={o.id}>
          {o.nome}
        </option>
      ))}
    </select>
  );
}
