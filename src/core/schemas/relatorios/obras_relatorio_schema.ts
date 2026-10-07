import { z } from "zod";

/**
 * Schemas dos endpoints agregados de relatórios (DashboardRelatoriosContext).
 * Contrato real do backend — paridade com obras_frontend_legado
 * (`src/lib/api/relatorios.ts`): dinheiro chega como STRING ("4500.00"),
 * `acaoConveniada` é string|null, `localizacoes` são objetos e o filtro
 * trabalha com strings/arrays vindos da URL.
 *
 * Tipos nunca são duplicados à mão: tudo deriva de `z.infer` + utilitários
 * do TypeScript (`Omit`/`Pick`/`Partial`). A normalização de RESPOSTA vive
 * dentro das actions (`core/actions/relatorios/`); aqui ficam só schemas e
 * funções puras (serialização, leitura da URL, semáforo, paginação).
 */

// ---------------------------------------------------------------------
// Blocos tolerantes
// ---------------------------------------------------------------------

/** Dinheiro do backend: string ("4500.00") ou number; inválido vira 0. */
const valorMonetarioSchema = z.coerce.number().catch(0);

/** Contador/percentual: number; inválido ou ausente vira 0. */
const contadorSchema = z.coerce.number().catch(0);

const SEMAFOROS = ["VERDE", "LARANJA", "VERMELHO"] as const;

const semaforoSchema = z
  .enum(SEMAFOROS)
  .nullish()
  .catch(null);

const textoOpcionalSchema = z.string().nullish().catch(null);

/** Booleano do item: boolean; aceita "true"/"false" por tolerância. */
const booleanToleranteSchema = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((v): boolean => (typeof v === "string" ? v === "true" : v))
  .catch(false);

// ---------------------------------------------------------------------
// Schemas do contrato
// ---------------------------------------------------------------------

export const localizacaoObraSchema = z
  .object({
    localidade: z.string().catch(""),
    uf: z.string().catch(""),
    latitude: z.number().nullish().catch(null),
    longitude: z.number().nullish().catch(null),
  });

export const itemListaObrasSchema = z
  .object({
    obraId: z.string(),
    codigo: z.string().catch(""),
    nome: z.string().catch(""),
    tipo: z.string().catch(""),
    statusObra: z.string().catch(""),
    estagioAtualNome: textoOpcionalSchema,
    prazoConclusaoEstagio: textoOpcionalSchema,
    percentualRealizado: contadorSchema,
    percentualFinanceiro: contadorSchema,
    semaforo: semaforoSchema,
    orgaoId: textoOpcionalSchema,
    orgaoNome: textoOpcionalSchema,
    localidadeNome: textoOpcionalSchema,
    responsavelNome: textoOpcionalSchema,
    tags: z.array(z.string()).catch([]),
    acaoConveniada: textoOpcionalSchema,
    prioritaria: booleanToleranteSchema,
    empresaExecutora: textoOpcionalSchema,
    numeroContrato: textoOpcionalSchema,
    localizacoes: z.array(localizacaoObraSchema).catch([]),
    dataCriacao: z.string().catch(""),
    ultimaAtualizacao: textoOpcionalSchema,
  });

export const quantificadoresObrasSchema = z
  .object({
    orgaoId: z.string().nullish(),
    acimaMeta: contadorSchema,
    prazoVencido: contadorSchema,
    abaixoMeta: contadorSchema,
    semStatus: contadorSchema,
    totalObras: contadorSchema,
    dataReferencia: z.string().catch(""),
  });

export const desempenhoObraSchema = z
  .object({
    obraId: z.string(),
    orgaoId: textoOpcionalSchema,
    statusObra: z.string().catch(""),
    estagioAtualId: textoOpcionalSchema,
    prazoConclusao: textoOpcionalSchema,
    percentualPrevisto: contadorSchema,
    percentualRealizado: contadorSchema,
    semaforo: semaforoSchema,
    prazoVencido: booleanToleranteSchema,
    dataReferencia: z.string().catch(""),
  });

export const fluxoFisicoFinanceiroSchema = z
  .object({
    obraId: textoOpcionalSchema,
    orgaoId: textoOpcionalSchema,
    contratadoInicial: valorMonetarioSchema,
    aditivadoTotal: valorMonetarioSchema,
    totalContratado: valorMonetarioSchema,
    medidoTotal: valorMonetarioSchema,
    empenhadoTotal: valorMonetarioSchema,
    liquidadoTotal: valorMonetarioSchema,
    pagoTotal: valorMonetarioSchema,
    percentuaisPorIndicador: z.record(z.string(), contadorSchema).catch({}),
    percentualFisico: contadorSchema,
    percentualFinanceiro: contadorSchema,
    dataReferencia: z.string().catch(""),
  });

export const contagemPorStatusSchema = z
  .object({
    total: contadorSchema,
    emAberto: contadorSchema,
    emDesenvolvimento: contadorSchema,
    concluidas: contadorSchema,
    paralisadas: contadorSchema,
    canceladas: contadorSchema,
  });

export const obrasPorOrgaoItemSchema = z
  .object({
    orgaoId: z.string().catch(""),
    orgaoNome: z.string().catch(""),
    total: contadorSchema,
  });

const FLUXO_ZERADO = {
  contratadoInicial: 0,
  aditivadoTotal: 0,
  totalContratado: 0,
  medidoTotal: 0,
  empenhadoTotal: 0,
  liquidadoTotal: 0,
  pagoTotal: 0,
  percentuaisPorIndicador: {} as Record<string, number>,
  percentualFisico: 0,
  percentualFinanceiro: 0,
  dataReferencia: "",
};

const CONTAGEM_ZERADA = {
  total: 0,
  emAberto: 0,
  emDesenvolvimento: 0,
  concluidas: 0,
  paralisadas: 0,
  canceladas: 0,
};

/**
 * GET /api/relatorios/dashboard. Cada seção tem fallback próprio: uma seção
 * fora do contrato zera só ela em vez de derrubar o dashboard inteiro.
 */
export const dashboardSchema = z
  .object({
    quantificadoresPorOrgao: z.array(quantificadoresObrasSchema).catch([]),
    fluxoAgregado: fluxoFisicoFinanceiroSchema.catch(FLUXO_ZERADO),
    contagemPorStatus: contagemPorStatusSchema.catch(CONTAGEM_ZERADA),
    obrasPorOrgao: z.array(obrasPorOrgaoItemSchema).catch([]),
  })
  .catch({
    quantificadoresPorOrgao: [],
    fluxoAgregado: FLUXO_ZERADO,
    contagemPorStatus: CONTAGEM_ZERADA,
    obrasPorOrgao: [],
  });

/** GET /api/relatorios/obras (paginado). Itens inválidos caem no parse individual da action. */
export const paginaObrasSchema = z
  .object({
    itens: z.array(z.unknown()).catch([]),
    total: contadorSchema,
  })
  .catch({ itens: [], total: 0 });

/** Filtro como estado no front: tudo string/array, vindo da URL (RN-REL-06..12). */
export const filtroObrasSchema = z.object({
  tipo: z.string().optional(),
  acaoConveniada: z.string().optional(),
  eixoId: z.string().optional(),
  tipologiaId: z.string().optional(),
  classificacaoId: z.string().optional(),
  empresaExecutora: z.string().optional(),
  numeroContrato: z.string().optional(),
  prioritaria: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  orgaoId: z.string().optional(),
  setorId: z.string().optional(),
  localidadeId: z.string().optional(),
  responsavel: z.string().optional(),
  statusObra: z.array(z.string()).optional(),
  estagioAtual: z.string().optional(),
  percentualMin: z.string().optional(),
  percentualMax: z.string().optional(),
  dataCriacaoDe: z.string().optional(),
  dataCriacaoAte: z.string().optional(),
  prazoEstagioDe: z.string().optional(),
  prazoEstagioAte: z.string().optional(),
  atualizadoDe: z.string().optional(),
  atualizadoAte: z.string().optional(),
  buscaTextual: z.string().optional(),
});

// ---------------------------------------------------------------------
// Tipos: sempre derivados (z.infer + Omit/Pick/Partial)
// ---------------------------------------------------------------------

export type SemaforoDesempenho = z.infer<typeof semaforoSchema>;
export type LocalizacaoObra = z.infer<typeof localizacaoObraSchema>;
export type ItemListaObras = z.infer<typeof itemListaObrasSchema>;
export type QuantificadoresObras = z.infer<typeof quantificadoresObrasSchema>;
export type DesempenhoObra = z.infer<typeof desempenhoObraSchema>;
export type FluxoFisicoFinanceiro = z.infer<typeof fluxoFisicoFinanceiroSchema>;
export type ContagemPorStatus = z.infer<typeof contagemPorStatusSchema>;
export type ObrasPorOrgaoItem = z.infer<typeof obrasPorOrgaoItemSchema>;
export type Dashboard = z.infer<typeof dashboardSchema>;
export type PaginaObras = z.infer<typeof paginaObrasSchema>;
export type FiltroObras = z.infer<typeof filtroObrasSchema>;

/** Paginação (pagina/tamanho) dos endpoints paginados. */
export interface PaginacaoRelatorio {
  pagina: number;
  tamanho: number;
}

/** Entrada da consulta paginada: filtros + paginação opcional. */
export type ConsultaObrasRelatorio = FiltroObras & Partial<PaginacaoRelatorio>;

/**
 * Filtro da tela de relatório: consulta paginada + aliases legados do
 * formulário (`q` vira `buscaTextual`, `status` entra em `statusObra`).
 */
export type FiltroRelatorioObras = ConsultaObrasRelatorio & {
  q?: string;
  status?: string;
};

/** Filtros dos endpoints agregados (dashboard/quantificadores/exportação): sem paginação. */
export type FiltroAgregado = Omit<
  FiltroObras & PaginacaoRelatorio,
  "pagina" | "tamanho"
>;

export interface ItemFluxoRelatorio {
  nome: string;
  valor: number;
}

export interface ItemPercentualRelatorio {
  nome: string;
  percentual: number;
}

/** View model do dashboard: recorte do Dashboard + fluxo convertido p/ número. */
export type ResumoDashboard = Pick<
  Dashboard,
  "contagemPorStatus" | "obrasPorOrgao"
> & {
  fluxoFinanceiro: ItemFluxoRelatorio[];
  fisicoVsFinanceiro: ItemPercentualRelatorio[];
};

/** Resposta da listagem para a tela: página + quantificadores + paginação. */
export type RelatorioObrasPagina = Omit<PaginaObras, "itens"> & {
  itens: ItemListaObras[];
  quantificadores: QuantificadoresObras;
} & PaginacaoRelatorio;

/** Download de relatório (base64) para o client salvar via blob. */
export interface ReportDownload {
  base64: string;
  fileName: string;
  contentType: string;
}

// ---------------------------------------------------------------------
// Funções puras (paridade com o legado)
// ---------------------------------------------------------------------

export const TAMANHO_PAGINA_RELATORIO = 50;
export const TAMANHO_MAXIMO_RELATORIO = 200;

const CAMPOS_ARRAY = ["tagIds", "statusObra"] as const;

/** Chaves válidas do filtro (do schema): a URL nunca vaza `pagina`/`tamanho` p/ o filtro. */
const CHAVES_FILTRO = new Set(Object.keys(filtroObrasSchema.shape));

/**
 * Serializa o FiltroObras em URLSearchParams. Arrays repetem o parâmetro
 * (OU); vazios são omitidos. `extra` adiciona params fora do filtro
 * (ex.: `formato` na exportação).
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

/** Lê um FiltroObras da query string (só chaves do schema; arrays via getAll). */
export function lerFiltro(params: URLSearchParams): FiltroObras {
  const f: FiltroObras = {};
  for (const chave of params.keys()) {
    if (!CHAVES_FILTRO.has(chave)) continue;
    if ((CAMPOS_ARRAY as readonly string[]).includes(chave)) {
      const valores = params.getAll(chave).filter(Boolean);
      if (valores.length > 0)
        (f as Record<string, unknown>)[chave] = valores;
    } else {
      const valor = params.get(chave);
      if (valor) (f as Record<string, unknown>)[chave] = valor;
    }
  }
  return f;
}

/** Cor (hex) do semáforo para a UI; cinza quando sem status (null). */
export function corSemaforo(
  semaforo: SemaforoDesempenho | null | undefined,
): string {
  switch (semaforo) {
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

/** Normaliza pagina/tamanho (default 50, teto 200). */
export function normalizarPaginacao(
  pagina?: number,
  tamanho?: number,
): PaginacaoRelatorio {
  return {
    pagina:
      pagina !== undefined && Number.isFinite(pagina) && pagina >= 1
        ? Math.floor(pagina)
        : 1,
    tamanho:
      tamanho !== undefined && Number.isFinite(tamanho) && tamanho >= 1
        ? Math.min(Math.floor(tamanho), TAMANHO_MAXIMO_RELATORIO)
        : TAMANHO_PAGINA_RELATORIO,
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Mantém apenas UUIDs válidos; devolve undefined quando nada resta. */
export function apenasUuids(
  valores: string[] | undefined,
): string[] | undefined {
  const validos = (valores ?? []).filter((v) => UUID_RE.test(v.trim()));
  return validos.length > 0 ? validos : undefined;
}

/**
 * Query string do GET /api/relatorios/obras: filtros + `pagina`/`tamanho`
 * explícitos (nomes do FiltroObrasDto). `tagIds` é saneado para só UUIDs
 * porque o DTO valida com IsUUID.
 */
export function montarConsultaObras(
  filtro: FiltroObras,
  paginacao: Partial<PaginacaoRelatorio> = {},
): string {
  const { pagina, tamanho } = normalizarPaginacao(
    paginacao.pagina,
    paginacao.tamanho,
  );
  const saneado: FiltroObras = { ...filtro, tagIds: apenasUuids(filtro.tagIds) };
  if (!saneado.tagIds) delete saneado.tagIds;
  return serializarFiltro(saneado, {
    pagina: String(pagina),
    tamanho: String(tamanho),
  }).toString();
}

/** Total de páginas (mínimo 1, mesmo sem resultados). */
export function totalPaginas(
  total: number,
  tamanho: number = TAMANHO_PAGINA_RELATORIO,
): number {
  return Math.max(1, Math.ceil(total / tamanho));
}
