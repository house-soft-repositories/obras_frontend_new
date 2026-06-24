/**
 * Cliente e regras de UI do ObrasContext (E2-07/E2-08). Os tipos vem do
 * contrato OpenAPI gerado (types.gen.ts via `pnpm gen:api`). As regras de
 * dominio refletidas no client (RN-OBR-13, RN-OBR-04) ficam em funcoes puras,
 * testaveis sem renderizar componentes.
 */
import type { components } from "./types.gen";

export type CriarObraPayload = components["schemas"]["CriarObraDto"];
export type AtualizarObraPayload = components["schemas"]["AtualizarObraDto"];
export type OrcamentoPrevisto = components["schemas"]["OrcamentoPrevistoDto"];
export type DuplicarObraPayload = components["schemas"]["DuplicarObraDto"];

export type TipoObra =
  | "AQUISICAO"
  | "INVESTIMENTO_PRIVADO"
  | "OBRA"
  | "PROGRAMA_PROJETO"
  | "SERVICOS";
export type StatusObra =
  | "EM_ABERTO"
  | "EM_DESENVOLVIMENTO"
  | "CONCLUIDO"
  | "PARALISADO"
  | "CANCELADO";
export type ModoDuracao =
  | "DEFINIDO_PELO_USUARIO"
  | "ESTAGIO_ATUAL"
  | "TOTAL_ATIVIDADES"
  | "EXECUCAO_CONTRATO";

export const TIPOS_OBRA: TipoObra[] = [
  "AQUISICAO",
  "INVESTIMENTO_PRIVADO",
  "OBRA",
  "PROGRAMA_PROJETO",
  "SERVICOS",
];
export const STATUS_OBRA: StatusObra[] = [
  "EM_ABERTO",
  "EM_DESENVOLVIMENTO",
  "CONCLUIDO",
  "PARALISADO",
  "CANCELADO",
];
export const MODOS_DURACAO: ModoDuracao[] = [
  "DEFINIDO_PELO_USUARIO",
  "ESTAGIO_ATUAL",
  "TOTAL_ATIVIDADES",
  "EXECUCAO_CONTRATO",
];
export const TIPOS_FINANCIAMENTO = [
  "COM_OGU",
  "SEM_OGU",
  "INVESTIMENTO_PRIVADO",
] as const;
export const ACOES_CONVENIADA = ["NAO", "FEDERAL", "ESTADUAL"] as const;

/** As 6 guias do cadastro/edicao de Obra (manual 10.1). */
export const GUIAS_OBRA = [
  { chave: "projeto", titulo: "Projeto" },
  { chave: "geral", titulo: "Geral" },
  { chave: "localizacao", titulo: "Localizacao" },
  { chave: "titularidade", titulo: "Titularidade" },
  { chave: "licenciamento", titulo: "Licenciamento" },
  { chave: "recebimento", titulo: "Recebimento" },
] as const;

export type ChaveGuia = (typeof GUIAS_OBRA)[number]["chave"];

/** RN-OBR-13: a subclassificacao so se aplica quando o tipo da obra e OBRA. */
export function subclassificacaoHabilitada(tipo: TipoObra | string): boolean {
  return tipo === "OBRA";
}

/** RN-OBR-04: nos modos de duracao automaticos as datas ficam somente leitura. */
export function datasSomenteLeitura(modo: ModoDuracao | string): boolean {
  return modo !== "DEFINIDO_PELO_USUARIO";
}

/** Quebra a entrada de tags por virgula/ponto-e-virgula e deduplica. */
export function parseTagsEntrada(entrada: string): string[] {
  const vistos = new Set<string>();
  const out: string[] = [];
  for (const bruto of (entrada ?? "").split(/[,;]/)) {
    const nome = bruto.trim();
    if (!nome) continue;
    const chave = nome.toLowerCase();
    if (vistos.has(chave)) continue;
    vistos.add(chave);
    out.push(nome);
  }
  return out;
}

/** Campos brutos do formulario de Obra (todos string, vindos dos inputs). */
export interface FormularioObra {
  nome: string;
  tipo: TipoObra | string;
  status?: StatusObra | string;
  responsavelUsuarioId: string;
  orgaoId: string;
  setorId?: string;
  localidadeId?: string;
  descricao?: string;
  tipoFinanciamento?: string;
  modoDuracao?: string;
  dataInicio?: string;
  dataPrazo?: string;
  acaoConveniada?: string;
  eixoId?: string;
  classificacaoId?: string;
  subclassificacaoId?: string;
  tipologiaId?: string;
  subtipologiaId?: string;
  prioritaria?: boolean;
  unidadeMedida?: string;
  quantidade?: string;
  secretario?: string;
  dataPactuada?: string;
  programaPpa?: string;
  acaoEstrategica?: string;
  acaoOrcamentaria?: string;
  orcamentos: OrcamentoPrevisto[];
}

/** Remove chaves vazias/undefined para nao enviar campos em branco. */
function limpar<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out as Partial<T>;
}

/**
 * Monta o payload de criacao a partir do formulario, aplicando RN-OBR-13:
 * subclassificacao_id e descartado quando o tipo nao e OBRA.
 */
export function construirPayloadObra(form: FormularioObra): CriarObraPayload {
  const base = { ...form };
  if (!subclassificacaoHabilitada(form.tipo)) {
    delete base.subclassificacaoId;
  }
  const payload = limpar(base) as Record<string, unknown>;
  payload.orcamentos = form.orcamentos.filter(
    (o) => o.fonteId && o.valor !== "",
  );
  return payload as unknown as CriarObraPayload;
}

// --- Chamadas ao backend via proxy autenticado (/api/proxy) ---

async function proxy<T>(caminho: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`/api/proxy/${caminho}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!r.ok) {
    const corpo = await r.json().catch(() => ({}));
    throw new ErroApi(r.status, corpo);
  }
  return (r.status === 204 ? undefined : await r.json()) as T;
}

/** Erro de API que expoe o status (ex.: 422 da RN-OBR-02). */
export class ErroApi extends Error {
  constructor(
    readonly status: number,
    readonly corpo: unknown,
  ) {
    super(`API ${status}`);
  }
}

export function criarObra(payload: CriarObraPayload) {
  return proxy("obras", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function atualizarObra(id: string, payload: AtualizarObraPayload) {
  return proxy(`obras/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function excluirObra(id: string) {
  return proxy(`obras/${id}`, { method: "DELETE" });
}

export function duplicarObra(id: string, payload: DuplicarObraPayload) {
  return proxy(`obras/${id}/duplicar`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function aplicarTags(obraId: string, tags: string) {
  return proxy(`obras/${obraId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tags }),
  });
}
