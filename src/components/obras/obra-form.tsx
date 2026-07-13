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
import { EntradaDinheiro } from "@/components/comum/entrada-dinheiro";
import { rotuloEnum, statusObraLabel } from "@/lib/ui/obra-labels";
import estilos from "./obra-form.module.css";

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
  responsaveis: OpcaoSelect[];
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

/** Titulos de exibicao das guias com acentuacao correta (UI PT-BR). */
const TITULOS_GUIA: Record<ChaveGuia, string> = {
  projeto: "Projeto",
  geral: "Geral",
  localizacao: "Localização",
  titularidade: "Titularidade",
  licenciamento: "Licenciamento",
  recebimento: "Recebimento",
};

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

  function cancelar() {
    if (modo === "criar") {
      router.push("/obras");
      return;
    }
    // Edicao: descarta as alteracoes locais e volta aos valores carregados.
    setForm({
      ...VAZIO,
      ...valoresIniciais,
      orcamentos: valoresIniciais?.orcamentos ?? VAZIO.orcamentos,
    });
    setTags(tagsIniciais ?? "");
    setErro(null);
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    for (const o of form.orcamentos) {
      const informado = o.fonteId.trim() !== "" || o.valor.trim() !== "";
      if (!informado) continue;
      const valorNum = Number(o.valor);
      if (!Number.isFinite(valorNum) || valorNum <= 0) {
        setErro("Cada orçamento informado deve ter valor numérico maior que zero");
        return;
      }
    }
    if (form.quantidade != null && form.quantidade.trim() !== "") {
      if (!Number.isFinite(Number(form.quantidade))) {
        setErro("Quantidade deve ser numérica");
        return;
      }
    }
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
      // Avisa o layout de detalhe (RF-14) para re-buscar o cabecalho.
      window.dispatchEvent(new Event("obra:atualizada"));
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
    <form onSubmit={enviar} className={estilos.form}>
      <div className={estilos.cartao}>
        <nav className={estilos.guias}>
          {GUIAS_OBRA.map((g) => (
            <button
              type="button"
              key={g.chave}
              onClick={() => setGuia(g.chave)}
              aria-current={guia === g.chave}
              className={
                guia === g.chave
                  ? `${estilos.guia} ${estilos.guiaAtiva}`
                  : estilos.guia
              }
            >
              {TITULOS_GUIA[g.chave]}
            </button>
          ))}
        </nav>

        {guia === "projeto" && (
          <section className={estilos.grade}>
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
                  <option key={t} value={t}>
                    {rotuloEnum(t)}
                  </option>
                ))}
              </select>
            </Campo>
            {modo === "criar" && (
              <Campo label="Responsável" obrigatorio>
                <Selecao
                  vazio="Selecione o responsável"
                  opcoes={opcoes.responsaveis}
                  valor={form.responsavelUsuarioId}
                  onChange={(v) => set("responsavelUsuarioId", v)}
                  required
                />
              </Campo>
            )}
            <Campo label="Órgão" obrigatorio>
              <Selecao
                vazio="Selecione o órgão"
                opcoes={opcoes.orgaos}
                valor={form.orgaoId}
                onChange={(v) => set("orgaoId", v)}
                required
              />
            </Campo>
            {modo === "editar" && (
              <Campo label="Status">
                <select
                  value={form.status ?? "EM_ABERTO"}
                  onChange={(e) => set("status", e.target.value)}
                >
                  {STATUS_OBRA.map((s) => (
                    <option key={s} value={s}>
                      {statusObraLabel(s)}
                    </option>
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
                  <option key={t} value={t}>
                    {rotuloEnum(t)}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Modo de duração">
              <select
                value={form.modoDuracao}
                onChange={(e) => set("modoDuracao", e.target.value)}
              >
                {MODOS_DURACAO.map((m) => (
                  <option key={m} value={m}>
                    {rotuloEnum(m)}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Data início">
              <EntradaData
                readOnly={datasTravadas}
                valor={form.dataInicio ?? ""}
                onChange={(v) => set("dataInicio", v)}
              />
            </Campo>
            <Campo label="Data prazo">
              <EntradaData
                readOnly={datasTravadas}
                valor={form.dataPrazo ?? ""}
                onChange={(v) => set("dataPrazo", v)}
              />
            </Campo>
            <Campo label="Ação conveniada">
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
            <Campo label="Classificação">
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
                  ? "Subclassificação (Não se aplica)"
                  : "Subclassificação (id)"
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
            <Campo label="Prioritária">
              <input
                type="checkbox"
                checked={!!form.prioritaria}
                onChange={(e) => set("prioritaria", e.target.checked)}
              />
            </Campo>
            <Campo label="Tags (vírgula/ponto-e-vírgula)">
              <input value={tags} onChange={(e) => setTags(e.target.value)} />
            </Campo>
          </section>
        )}

        {guia === "geral" && (
          <section className={estilos.grade}>
            <h3 className={estilos.tituloSecao}>
              Orçamento previsto (fonte + valor)
            </h3>
            {form.orcamentos.map((o, i) => (
              <div key={i} className={estilos.linhaOrcamento}>
                <Selecao
                  vazio="Selecione a fonte"
                  opcoes={opcoes.fontes}
                  valor={o.fonteId}
                  onChange={(v) => setOrcamento(i, "fonteId", v)}
                />
                <EntradaDinheiro
                  valor={o.valor}
                  onChange={(v) => setOrcamento(i, "valor", v)}
                />
              </div>
            ))}
            <div className={estilos.acaoSecundaria}>
              <button
                type="button"
                onClick={() =>
                  set("orcamentos", [
                    ...form.orcamentos,
                    { fonteId: "", valor: "" },
                  ])
                }
              >
                + adicionar fonte
              </button>
            </div>
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
            <Campo label="Secretário(a)">
              <input
                value={form.secretario ?? ""}
                onChange={(e) => set("secretario", e.target.value)}
              />
            </Campo>
            <Campo label="Data pactuada">
              <EntradaData
                valor={form.dataPactuada ?? ""}
                onChange={(v) => set("dataPactuada", v)}
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
          <p role="alert" className={estilos.erro}>
            {erro}
          </p>
        )}

        <div className={estilos.rodape}>
          <button type="button" onClick={cancelar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="btn-primario" disabled={enviando}>
            {enviando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </form>
  );
}

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
    <label className={estilos.campo}>
      <span className={estilos.campoRotulo}>
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
  required,
}: {
  opcoes: OpcaoSelect[];
  valor: string;
  onChange: (v: string) => void;
  vazio: string;
  required?: boolean;
}) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      <option value="">{vazio}</option>
      {opcoes.map((o) => (
        <option key={o.id} value={o.id}>
          {o.nome}
        </option>
      ))}
    </select>
  );
}

/**
 * Campo de data nativo: mantem a digitacao e, ao clicar/focar, abre o
 * calendario do navegador (showPicker). Respeita o modo somente-leitura.
 */
function EntradaData({
  valor,
  onChange,
  readOnly,
}: {
  valor: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  function abrirCalendario(
    e: React.SyntheticEvent<HTMLInputElement>,
  ): void {
    if (readOnly) return;
    const alvo = e.currentTarget as HTMLInputElement & {
      showPicker?: () => void;
    };
    try {
      alvo.showPicker?.();
    } catch {
      /* navegador sem suporte a showPicker: input nativo segue funcionando */
    }
  }
  return (
    <input
      type="date"
      readOnly={readOnly}
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      onClick={abrirCalendario}
      onFocus={abrirCalendario}
    />
  );
}
