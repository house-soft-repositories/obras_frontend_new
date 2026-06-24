/**
 * Cliente e regras de UI do CronogramaContext (E3-07/E3-08). Os tipos de
 * request vem do contrato OpenAPI (types.gen.ts via `pnpm gen:api`); as regras
 * refletidas no client (arvore de subatividades, filtros Todos/Ativas/Minhas)
 * ficam em funcoes puras, testaveis sem renderizar componentes.
 */
import { ErroApi } from "./obras";
import type { components } from "./types.gen";

export { ErroApi };

export type CriarEstagioPayload = components["schemas"]["CriarEstagioDto"];
export type AtualizarEstagioPayload =
  components["schemas"]["AtualizarEstagioDto"];
export type ReordenarItem = components["schemas"]["ReordenarItemDto"];
export type CriarAcompanhamentoPayload =
  components["schemas"]["CriarAcompanhamentoDto"];
export type CriarComentarioPayload =
  components["schemas"]["CriarComentarioDto"];

export type ModoDuracaoEstagio =
  | "NAO_INFORMADO"
  | "DIAS_CORRIDOS"
  | "PRAZO_EXECUCAO_CONTRATO";
export type TipoValorAcompanhamento = "PERCENTUAL" | "FINANCEIRO" | "NUMERICO";
export type FiltroEstagio = "todos" | "ativas" | "minhas";

export const MODOS_DURACAO_ESTAGIO: ModoDuracaoEstagio[] = [
  "NAO_INFORMADO",
  "DIAS_CORRIDOS",
  "PRAZO_EXECUCAO_CONTRATO",
];
export const TIPOS_VALOR: TipoValorAcompanhamento[] = [
  "PERCENTUAL",
  "FINANCEIRO",
  "NUMERICO",
];
export const FILTROS_ESTAGIO: { chave: FiltroEstagio; titulo: string }[] = [
  { chave: "todos", titulo: "Todos" },
  { chave: "ativas", titulo: "Ativas" },
  { chave: "minhas", titulo: "Minhas" },
];

/** Estagio retornado pela API (entidade do CronogramaContext). */
export interface Estagio {
  id: string;
  obraId: string;
  estagioPaiId: string | null;
  descricao: string;
  ordem: number;
  ativo: boolean;
  modoDuracao: ModoDuracaoEstagio;
  dataInicio: string | null;
  dataPrazo: string | null;
  totalDias: number | null;
  estagioPrecedenteId: string | null;
  responsavelUsuarioId: string | null;
  obraVinculadaId: string | null;
  tipoValor: TipoValorAcompanhamento | null;
  percentualRealizado: string | null;
  concluido: boolean;
  dataConclusao: string | null;
  latitude: string | null;
  longitude: string | null;
}

export interface Acompanhamento {
  id: string;
  estagioId: string;
  dataReferencia: string;
  valorMeta: string | null;
  valorRealizado: string | null;
  criadoEm: string;
}

export interface Comentario {
  id: string;
  estagioId: string;
  autorUsuarioId: string;
  texto: string;
  criadoEm: string;
}

export interface EstagioAtual {
  id: string;
  descricao: string;
  dataInicio: string | null;
  dataPrazo: string | null;
  percentualRealizado: string | null;
}

export interface DatasAgregadas {
  dataInicio: string | null;
  dataPrazo: string | null;
}

/** Estagio raiz com suas subatividades aninhadas (1 nivel — RN-CRO-08). */
export interface EstagioArvore extends Estagio {
  subatividades: Estagio[];
}

/**
 * Monta a arvore (raizes + subatividades) a partir da lista plana, preservando
 * a ordem. Subatividades orfas (pai ausente na lista) sao ignoradas.
 */
export function montarArvore(estagios: Estagio[]): EstagioArvore[] {
  const porOrdem = [...estagios].sort((a, b) => a.ordem - b.ordem);
  const raizes = porOrdem.filter((e) => e.estagioPaiId == null);
  return raizes.map((raiz) => ({
    ...raiz,
    subatividades: porOrdem.filter((e) => e.estagioPaiId === raiz.id),
  }));
}

/**
 * Aplica o filtro de visao (RN-CRO-22). "ativas" = ativo e nao concluido;
 * "minhas" = sob responsabilidade do usuario; "todos" = tudo. O filtro
 * preserva subatividades cujo pai permanece visivel.
 */
export function filtrarEstagios(
  estagios: Estagio[],
  filtro: FiltroEstagio,
  usuarioId: string | null,
): Estagio[] {
  if (filtro === "ativas") {
    return estagios.filter((e) => e.ativo && !e.concluido);
  }
  if (filtro === "minhas") {
    return estagios.filter((e) => e.responsavelUsuarioId === usuarioId);
  }
  return estagios;
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

/** Campos brutos do formulario de estagio (vindos dos inputs). */
export interface FormularioEstagio {
  descricao: string;
  estagioPaiId?: string;
  ativo?: boolean;
  modoDuracao?: ModoDuracaoEstagio | string;
  dataInicio?: string;
  dataPrazo?: string;
  totalDias?: string;
  estagioPrecedenteId?: string;
  responsavelUsuarioId?: string;
  latitude?: string;
  longitude?: string;
}

/**
 * Monta o payload de criacao de estagio. No modo DIAS_CORRIDOS envia data de
 * inicio + (total_dias OU data_prazo); nos demais modos descarta as datas.
 */
export function construirPayloadEstagio(
  form: FormularioEstagio,
): CriarEstagioPayload {
  const base: Record<string, unknown> = {
    descricao: form.descricao,
    estagioPaiId: form.estagioPaiId,
    ativo: form.ativo,
    modoDuracao: form.modoDuracao,
    estagioPrecedenteId: form.estagioPrecedenteId,
    responsavelUsuarioId: form.responsavelUsuarioId,
  };
  if (form.modoDuracao === "DIAS_CORRIDOS") {
    base.dataInicio = form.dataInicio;
    if (form.totalDias) base.totalDias = Number(form.totalDias);
    else base.dataPrazo = form.dataPrazo;
  }
  if (form.latitude) base.latitude = Number(form.latitude);
  if (form.longitude) base.longitude = Number(form.longitude);
  return limpar(base) as unknown as CriarEstagioPayload;
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

const base = (obraId: string) => `obras/${obraId}/estagios`;

export function listarEstagios(obraId: string, filtro: FiltroEstagio = "todos") {
  return proxy<Estagio[]>(`${base(obraId)}?filtro=${filtro}`);
}

export function criarEstagio(obraId: string, payload: CriarEstagioPayload) {
  return proxy<Estagio>(base(obraId), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function atualizarEstagio(
  obraId: string,
  id: string,
  payload: AtualizarEstagioPayload,
) {
  return proxy<Estagio>(`${base(obraId)}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function excluirEstagio(obraId: string, id: string) {
  return proxy<void>(`${base(obraId)}/${id}`, { method: "DELETE" });
}

export function excluirLoteEstagios(obraId: string, ids: string[]) {
  return proxy<void>(`${base(obraId)}/lote`, {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
}

export function reordenarEstagios(obraId: string, itens: ReordenarItem[]) {
  return proxy<{ ok: boolean }>(`${base(obraId)}/reordenar`, {
    method: "PATCH",
    body: JSON.stringify({ itens }),
  });
}

export function assumirEstagio(obraId: string, id: string) {
  return proxy<Estagio>(`${base(obraId)}/${id}/assumir`, { method: "POST" });
}

export function concluirEstagio(obraId: string, id: string) {
  return proxy<Estagio>(`${base(obraId)}/${id}/concluir`, { method: "POST" });
}

export function duplicarEstagio(obraId: string, id: string) {
  return proxy<Estagio>(`${base(obraId)}/${id}/duplicar`, { method: "POST" });
}

export function criarEstagiosPredefinidos(obraId: string) {
  return proxy<Estagio[]>(`${base(obraId)}/predefinidos`, { method: "POST" });
}

export function gravarPercentualDireto(
  obraId: string,
  id: string,
  percentualRealizado: number,
) {
  return proxy<Estagio>(`${base(obraId)}/${id}/percentual-direto`, {
    method: "PATCH",
    body: JSON.stringify({ percentualRealizado }),
  });
}

export function obterEstagioAtual(obraId: string) {
  return proxy<EstagioAtual | null>(`${base(obraId)}/atual`);
}

export function obterDatasAgregadas(obraId: string) {
  return proxy<DatasAgregadas>(`${base(obraId)}/datas-agregadas`);
}

export function listarAcompanhamentos(obraId: string, estagioId: string) {
  return proxy<Acompanhamento[]>(
    `${base(obraId)}/${estagioId}/acompanhamentos`,
  );
}

export function criarAcompanhamento(
  obraId: string,
  estagioId: string,
  payload: CriarAcompanhamentoPayload,
) {
  return proxy<Acompanhamento>(`${base(obraId)}/${estagioId}/acompanhamentos`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function excluirAcompanhamento(
  obraId: string,
  estagioId: string,
  id: string,
) {
  return proxy<void>(`${base(obraId)}/${estagioId}/acompanhamentos/${id}`, {
    method: "DELETE",
  });
}

export function listarComentarios(obraId: string, estagioId: string) {
  return proxy<Comentario[]>(`${base(obraId)}/${estagioId}/comentarios`);
}

export function criarComentario(
  obraId: string,
  estagioId: string,
  payload: CriarComentarioPayload,
) {
  return proxy<Comentario>(`${base(obraId)}/${estagioId}/comentarios`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
