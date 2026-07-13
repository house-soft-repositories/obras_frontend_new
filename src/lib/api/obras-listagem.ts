/**
 * Regras de UI da listagem de Obras (E2-08) sobre o endpoint de leitura do
 * DashboardRelatoriosContext (GET /relatorios/obras), em funcoes puras
 * testaveis: sincronia do estado (FiltroObras + pagina) com a query string,
 * montagem da consulta ao backend (params `pagina`/`tamanho` do
 * FiltroObrasDto), rotulos legiveis, calculo das barras de percentual,
 * paginacao visivel e payload de duplicacao (RN-OBR-19).
 */
import type { DuplicarObraPayload } from "./obras";
import { ErroApi } from "./obras";
import {
  serializarFiltro,
  type FiltroObras,
  type PaginaObras,
} from "./relatorios";

/**
 * Tamanho de pagina enviado ao backend. Espelha o default do FiltroObrasDto
 * (`tamanho ?? 50`); enviado explicitamente para o calculo de "Mostrando
 * X–Y de Z" nao depender do default do servidor.
 */
export const TAMANHO_PAGINA = 50;

/** Estado da listagem sincronizado com a URL: filtros + pagina atual. */
export interface EstadoListagemObras {
  filtro: FiltroObras;
  pagina: number;
}

/** Chaves escalares do FiltroObras usadas pela tela (valor unico na URL). */
const CHAVES_ESCALARES = [
  "buscaTextual",
  "tipo",
  "orgaoId",
  "eixoId",
  "tipologiaId",
  "classificacaoId",
  "acaoConveniada",
  "prioritaria",
] as const;

type ChaveEscalar = (typeof CHAVES_ESCALARES)[number];

/** Chaves do painel "Mais filtros" (define se ele abre ja expandido). */
const CHAVES_AVANCADAS: (keyof FiltroObras)[] = [
  "eixoId",
  "tipologiaId",
  "classificacaoId",
  "tagIds",
  "acaoConveniada",
  "prioritaria",
];

/** Le o estado da listagem a partir da query string da URL. */
export function lerEstadoListagem(
  params: URLSearchParams,
): EstadoListagemObras {
  const filtro: FiltroObras = {};
  for (const chave of CHAVES_ESCALARES) {
    const valor = params.get(chave);
    if (valor) filtro[chave as ChaveEscalar] = valor;
  }
  const statusObra = params.getAll("statusObra").filter(Boolean);
  if (statusObra.length > 0) filtro.statusObra = statusObra;
  const tagIds = params.getAll("tagIds").filter(Boolean);
  if (tagIds.length > 0) filtro.tagIds = tagIds;

  const pagina = Number(params.get("pagina"));
  return {
    filtro,
    pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
  };
}

/**
 * Query string da barra de endereco (sem `tamanho`; omite `pagina` 1 para a
 * URL padrao ficar limpa). Usa a serializacao oficial do FiltroObras.
 */
export function estadoParaQueryString(estado: EstadoListagemObras): string {
  const extra: Record<string, string> =
    estado.pagina > 1 ? { pagina: String(estado.pagina) } : {};
  return serializarFiltro(estado.filtro, extra).toString();
}

/**
 * Query string enviada ao GET /relatorios/obras: filtros + `pagina`/`tamanho`
 * explicitos (nomes do FiltroObrasDto do backend). `tagIds` e saneado para
 * apenas UUIDs porque o DTO valida com IsUUID (evita 400 na listagem).
 */
export function montarConsultaObras(estado: EstadoListagemObras): string {
  const filtro: FiltroObras = {
    ...estado.filtro,
    tagIds: apenasUuids(estado.filtro.tagIds),
  };
  return serializarFiltro(filtro, {
    pagina: String(estado.pagina),
    tamanho: String(TAMANHO_PAGINA),
  }).toString();
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Mantem apenas UUIDs validos; devolve undefined quando nada resta. */
export function apenasUuids(
  valores: string[] | undefined,
): string[] | undefined {
  const validos = (valores ?? []).filter((v) => UUID_RE.test(v.trim()));
  return validos.length > 0 ? validos : undefined;
}

/**
 * Atualiza um filtro e devolve a nova query string da URL. Qualquer mudanca
 * de filtro volta para a pagina 1; valor vazio ("" ou []) remove o filtro.
 */
export function aplicarFiltroListagem(
  estado: EstadoListagemObras,
  chave: keyof FiltroObras,
  valor: string | string[],
): string {
  const filtro: FiltroObras = { ...estado.filtro };
  const vazio = Array.isArray(valor) ? valor.length === 0 : valor === "";
  if (vazio) {
    delete filtro[chave];
  } else {
    (filtro as Record<string, unknown>)[chave] = valor;
  }
  return estadoParaQueryString({ filtro, pagina: 1 });
}

/** Muda de pagina mantendo os filtros; devolve a nova query string. */
export function irParaPagina(
  estado: EstadoListagemObras,
  pagina: number,
): string {
  return estadoParaQueryString({ ...estado, pagina });
}

/** Total de paginas (minimo 1, mesmo sem resultados). */
export function totalPaginas(
  total: number,
  tamanho: number = TAMANHO_PAGINA,
): number {
  return Math.max(1, Math.ceil(total / tamanho));
}

/**
 * Janela de ate 5 paginas centrada na atual, grudando nas bordas
 * (ex.: atual 5 de 10 -> [3,4,5,6,7]; atual 10 de 10 -> [6,7,8,9,10]).
 */
export function paginasVisiveis(atual: number, total: number): number[] {
  const JANELA = 5;
  const quantidade = Math.min(JANELA, Math.max(1, total));
  let inicio = atual - Math.floor(JANELA / 2);
  inicio = Math.min(inicio, total - quantidade + 1);
  inicio = Math.max(1, inicio);
  return Array.from({ length: quantidade }, (_, i) => inicio + i);
}

/** Texto "Mostrando X–Y de Z" da barra de paginacao. */
export function resumoPaginacao(
  pagina: number,
  total: number,
  tamanho: number = TAMANHO_PAGINA,
): string {
  if (total <= 0) return "Mostrando 0 de 0";
  const de = (pagina - 1) * tamanho + 1;
  const ate = Math.min(pagina * tamanho, total);
  return `Mostrando ${de}–${ate} de ${total}`;
}

/** Sub do cabecalho: "{total} obras cadastradas", com plural correto. */
export function resumoTotalObras(total: number): string {
  return total === 1 ? "1 obra cadastrada" : `${total} obras cadastradas`;
}

/** Rotulo legivel do TipoObra (enum do backend) para o select e celulas. */
export function tipoObraLabel(tipo: string): string {
  switch (tipo) {
    case "OBRA":
      return "Obra";
    case "AQUISICAO":
      return "Aquisição";
    case "SERVICOS":
      return "Serviços";
    case "INVESTIMENTO_PRIVADO":
      return "Investimento privado";
    case "PROGRAMA_PROJETO":
      return "Programa/Projeto";
    default:
      return tipo;
  }
}

/** Rotulo legivel da acao conveniada (enum AcaoConveniada do backend). */
export function acaoConveniadaLabel(acao: string): string {
  switch (acao) {
    case "NAO":
      return "Não conveniada";
    case "FEDERAL":
      return "Federal";
    case "ESTADUAL":
      return "Estadual";
    default:
      return acao;
  }
}

/** Largura (0–100) do preenchimento das barras de percentual. */
export function larguraBarra(percentual: number): number {
  if (!Number.isFinite(percentual) || percentual < 0) return 0;
  return Math.min(100, percentual);
}

/** Valor exibido ao lado da barra ("N%", inteiro arredondado, nunca < 0). */
export function percentualLabel(percentual: number): string {
  const valor = Number.isFinite(percentual) ? Math.max(0, percentual) : 0;
  return `${Math.round(valor)}%`;
}

/** Cor do preenchimento: verde a partir de 100%; senao a cor base da coluna. */
export function corBarra(percentual: number, corBase: string): string {
  return percentual >= 100 ? "var(--sem-verde)" : corBase;
}

/** Ha filtro avancado ativo? (abre o painel "Mais filtros" ja expandido) */
export function temFiltroAvancado(filtro: FiltroObras): boolean {
  return CHAVES_AVANCADAS.some((chave) => {
    const valor = filtro[chave];
    return Array.isArray(valor) ? valor.length > 0 : Boolean(valor);
  });
}

/**
 * Busca uma pagina de obras em GET /api/proxy/relatorios/obras (proxy
 * autenticado). O fetch e injetavel para teste em vitest node.
 */
export async function buscarPaginaObras(
  estado: EstadoListagemObras,
  fetchFn: typeof fetch = fetch,
): Promise<PaginaObras> {
  const r = await fetchFn(
    `/api/proxy/relatorios/obras?${montarConsultaObras(estado)}`,
    { headers: { "content-type": "application/json" } },
  );
  if (!r.ok) {
    const corpo = await r.json().catch(() => ({}));
    throw new ErroApi(r.status, corpo);
  }
  return (await r.json()) as PaginaObras;
}

// ---------------------------------------------------------------------
// Duplicacao (RN-OBR-19) — usada pelo DuplicarObraModal.
// ---------------------------------------------------------------------

export interface FormularioDuplicacao {
  nome: string;
  responsavelUsuarioId: string;
  dataInicio: string;
  dataPrazo: string;
  copiarArquivos: boolean;
  manterEquipe: boolean;
  copiarEstagios: boolean;
}

/** Monta o payload de duplicacao com as 3 opcoes (RN-OBR-19). */
export function construirPayloadDuplicacao(
  form: FormularioDuplicacao,
): DuplicarObraPayload {
  return {
    nome: form.nome,
    responsavelUsuarioId: form.responsavelUsuarioId,
    dataInicio: form.dataInicio,
    dataPrazo: form.dataPrazo,
    copiarArquivos: form.copiarArquivos,
    manterEquipe: form.manterEquipe,
    copiarEstagios: form.copiarEstagios,
  };
}
