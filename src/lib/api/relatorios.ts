/**
 * Cliente e regras de UI do DashboardRelatoriosContext (E7). Tipos do contrato
 * OpenAPI; logica de serializacao do FiltroObras em query params e cor do
 * semaforo em funcoes PURAS testaveis.
 */
import { ErroApi } from "./obras";

export { ErroApi };

export type SemaforoDesempenho = "VERDE" | "LARANJA" | "VERMELHO";
export type ModoExibicaoObras = "LISTA" | "CARTAO" | "MAPA" | "CALENDARIO";

// Respostas tipadas a mao (o backend nao anota os schemas de resposta no
// OpenAPI; mesmo padrao de contratos/medicoes/financeiro).
export interface QuantificadoresObras {
  orgaoId?: string | null;
  acimaMeta: number;
  prazoVencido: number;
  abaixoMeta: number;
  semStatus: number;
  totalObras: number;
  dataReferencia: string;
}

export interface LocalizacaoObra {
  municipio: string;
  uf: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ItemListaObras {
  obraId: string;
  nome: string;
  statusObra: string;
  estagioAtualNome: string | null;
  prazoConclusaoEstagio: string | null;
  percentualRealizado: number;
  semaforo: SemaforoDesempenho | null;
  orgaoId: string | null;
  localidadeNome: string | null;
  responsavelNome: string | null;
  tags: string[];
  acaoConveniada: string | null;
  prioritaria: boolean;
  empresaExecutora: string | null;
  numeroContrato: string | null;
  localizacoes: LocalizacaoObra[];
  dataCriacao: string;
  ultimaAtualizacao: string | null;
}

export interface DesempenhoObra {
  obraId: string;
  orgaoId: string | null;
  statusObra: string;
  estagioAtualId: string | null;
  prazoConclusao: string | null;
  percentualPrevisto: number;
  percentualRealizado: number;
  semaforo: SemaforoDesempenho | null;
  prazoVencido: boolean;
  dataReferencia: string;
}

export interface FluxoFisicoFinanceiro {
  obraId: string | null;
  orgaoId: string | null;
  contratadoInicial: string;
  aditivadoTotal: string;
  totalContratado: string;
  medidoTotal: string;
  empenhadoTotal: string;
  liquidadoTotal: string;
  pagoTotal: string;
  percentuaisPorIndicador: Record<string, number>;
  percentualFisico: number;
  percentualFinanceiro: number;
  dataReferencia: string;
}

export interface Dashboard {
  quantificadoresPorOrgao: QuantificadoresObras[];
  fluxoAgregado: FluxoFisicoFinanceiro;
}

export interface PaginaObras {
  itens: ItemListaObras[];
  total: number;
}

/** Filtro como estado no front (todos string/array, vindos da URL). */
export interface FiltroObras {
  acaoConveniada?: string;
  eixoId?: string;
  tipologiaId?: string;
  classificacaoId?: string;
  empresaExecutora?: string;
  numeroContrato?: string;
  prioritaria?: string;
  tagIds?: string[];
  orgaoId?: string;
  setorId?: string;
  localidadeId?: string;
  responsavel?: string;
  statusObra?: string[];
  estagioAtual?: string;
  percentualMin?: string;
  percentualMax?: string;
  dataCriacaoDe?: string;
  dataCriacaoAte?: string;
  prazoEstagioDe?: string;
  prazoEstagioAte?: string;
  atualizadoDe?: string;
  atualizadoAte?: string;
  buscaTextual?: string;
}

const CAMPOS_ARRAY: (keyof FiltroObras)[] = ["tagIds", "statusObra"];

/**
 * Serializa o FiltroObras (6 grupos) em URLSearchParams. Arrays viram
 * repeticao do mesmo parametro (OU); vazios sao omitidos. Funcao PURA.
 */
export function serializarFiltro(
  filtro: FiltroObras,
  extra: Record<string, string> = {},
): URLSearchParams {
  const p = new URLSearchParams();
  for (const [chave, valor] of Object.entries(filtro)) {
    if (valor == null) continue;
    if (Array.isArray(valor)) {
      for (const v of valor) if (v) p.append(chave, v);
    } else if (String(valor) !== "") {
      p.set(chave, String(valor));
    }
  }
  for (const [k, v] of Object.entries(extra)) if (v) p.set(k, v);
  return p;
}

/** Le um FiltroObras de volta a partir de URLSearchParams (URL <-> estado). */
export function lerFiltro(params: URLSearchParams): FiltroObras {
  const f: FiltroObras = {};
  for (const chave of new Set(params.keys())) {
    if ((CAMPOS_ARRAY as string[]).includes(chave)) {
      (f as Record<string, unknown>)[chave] = params.getAll(chave);
    } else {
      (f as Record<string, unknown>)[chave] = params.get(chave) ?? undefined;
    }
  }
  return f;
}

/** Cor (hex) do semaforo para a UI; cinza quando sem status (null). */
export function corSemaforo(s: SemaforoDesempenho | null | undefined): string {
  switch (s) {
    case "VERDE":
      return "#16a34a";
    case "LARANJA":
      return "#f59e0b";
    case "VERMELHO":
      return "#dc2626";
    default:
      return "#9ca3af";
  }
}

// =====================================================================
// Chamadas ao backend via proxy autenticado (/api/proxy).
// =====================================================================

async function proxy<T>(caminho: string): Promise<T> {
  const r = await fetch(`/api/proxy/${caminho}`, {
    headers: { "content-type": "application/json" },
  });
  if (!r.ok) {
    const corpo = await r.json().catch(() => ({}));
    throw new ErroApi(r.status, corpo);
  }
  return (await r.json()) as T;
}

const qs = (f: FiltroObras, extra?: Record<string, string>) => {
  const s = serializarFiltro(f, extra).toString();
  return s ? `?${s}` : "";
};

export function obterQuantificadores(f: FiltroObras) {
  return proxy<QuantificadoresObras>(`relatorios/quantificadores${qs(f)}`);
}
export function listarObras(f: FiltroObras) {
  return proxy<PaginaObras>(`relatorios/obras${qs(f)}`);
}
export function listarObrasMapa(f: FiltroObras) {
  return proxy<ItemListaObras[]>(`relatorios/obras/mapa${qs(f)}`);
}
export function listarObrasCalendario(f: FiltroObras) {
  return proxy<ItemListaObras[]>(`relatorios/obras/calendario${qs(f)}`);
}
export function obterDashboard(f: FiltroObras, orgaoId?: string) {
  return proxy<Dashboard>(
    `relatorios/dashboard${qs(f, orgaoId ? { orgaoId } : {})}`,
  );
}

/** URL de exportacao (download direto via proxy), com filtros ativos. */
export function urlExportar(f: FiltroObras, formato: "PDF" | "CSV"): string {
  return `/api/proxy/relatorios/obras/exportar${qs(f, { formato })}`;
}
