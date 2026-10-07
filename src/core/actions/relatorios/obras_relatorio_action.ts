"use server";

import api from "@/core/rest_client/api";
import { obraErrorTranslator } from "@/core/errors/obra_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import type ServerActionResult from "@/core/types/server_action_result";
import {
  dashboardSchema,
  desempenhoObraSchema,
  fluxoFisicoFinanceiroSchema,
  itemListaObrasSchema,
  montarConsultaObras,
  normalizarPaginacao,
  paginaObrasSchema,
  quantificadoresObrasSchema,
  serializarFiltro,
  type DesempenhoObra,
  type FiltroAgregado,
  type FiltroObras,
  type FiltroRelatorioObras,
  type FluxoFisicoFinanceiro,
  type ItemListaObras,
  type RelatorioObrasPagina,
  type ReportDownload,
  type ResumoDashboard,
} from "@/core/schemas/relatorios/obras_relatorio_schema";

function traduzirErro(error: unknown, fallback: string): string {
  if (error instanceof HttpClientException)
    return obraErrorTranslator.translate(error);
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function numero(valor: unknown): number {
  const n = Number(valor);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Resumo do dashboard via GET /api/relatorios/dashboard. A normalização
 * para o ResumoDashboard das telas acontece aqui dentro: contagem e obras
 * por órgão passam direto; o fluxo (dinheiro como string no backend) é
 * convertido para número como no gráfico do legado.
 */
export async function obterResumoDashboard(
  filtro: FiltroAgregado = {},
): Promise<ResumoDashboard> {
  try {
    const qs = serializarFiltro(filtro).toString();
    const res = await api.auth.get<unknown>(
      `/api/relatorios/dashboard${qs ? `?${qs}` : ""}`,
      { next: { tags: ["relatorios-dashboard"] } },
    );
    const dash = dashboardSchema.parse(res.data);

    const obrasPorOrgao = [...dash.obrasPorOrgao]
      .map((item) => ({
        orgaoId: item.orgaoId || "sem-orgao",
        orgaoNome:
          item.orgaoNome && item.orgaoNome.trim()
            ? item.orgaoNome
            : "Sem órgão",
        total: numero(item.total),
      }))
      .sort((a, b) => b.total - a.total);

    const fluxo = dash.fluxoAgregado;
    return {
      contagemPorStatus: dash.contagemPorStatus,
      obrasPorOrgao,
      fluxoFinanceiro: [
        { nome: "Contratado", valor: numero(fluxo.totalContratado) },
        { nome: "Medido", valor: numero(fluxo.medidoTotal) },
        { nome: "Empenhado", valor: numero(fluxo.empenhadoTotal) },
        { nome: "Liquidado", valor: numero(fluxo.liquidadoTotal) },
        { nome: "Pago", valor: numero(fluxo.pagoTotal) },
      ],
      fisicoVsFinanceiro: [
        { nome: "Físico", percentual: Math.round(numero(fluxo.percentualFisico)) },
        {
          nome: "Financeiro",
          percentual: Math.round(numero(fluxo.percentualFinanceiro)),
        },
      ],
    };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
      throw error;
    throw new Error(
      traduzirErro(error, "Não foi possível carregar o resumo do dashboard."),
    );
  }
}

/**
 * Lista + quantificadores via GET /api/relatorios/obras (paginado) e
 * GET /api/relatorios/quantificadores. Aliases legados do formulário
 * (`q` -> `buscaTextual`, `status` -> `statusObra`) são resolvidos aqui;
 * itens fora do contrato são descartados sem derrubar a página.
 */
export async function listarObrasRelatorio(
  filtro: FiltroRelatorioObras = {},
): Promise<RelatorioObrasPagina> {
  const { q, status, pagina, tamanho, ...restante } = filtro;
  const { pagina: paginaAtual, tamanho: tamanhoAtual } = normalizarPaginacao(
    pagina,
    tamanho,
  );
  const buscaTextual =
    restante.buscaTextual?.trim() || q?.trim() || undefined;
  const statusObra = [
    ...(restante.statusObra ?? []),
    ...(status?.trim() ? [status.trim()] : []),
  ];
  const consulta: FiltroObras = {
    ...restante,
    ...(buscaTextual ? { buscaTextual } : {}),
    ...(statusObra.length > 0 ? { statusObra } : {}),
  };
  try {
    const qsQuant = serializarFiltro(consulta).toString();
    const [listaRes, quantRes] = await Promise.all([
      api.auth.get<unknown>(
        `/api/relatorios/obras?${montarConsultaObras(consulta, { pagina: paginaAtual, tamanho: tamanhoAtual })}`,
        { next: { tags: ["relatorios-obras"] } },
      ),
      api.auth.get<unknown>(
        `/api/relatorios/quantificadores${qsQuant ? `?${qsQuant}` : ""}`,
        { next: { tags: ["relatorios-quantificadores"] } },
      ),
    ]);
    const paginaBruta = paginaObrasSchemaSafe(listaRes.data);
    const obras: ItemListaObras[] = paginaBruta.itens.flatMap((item) => {
      const parsed = itemListaObrasSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    });
    const quant = quantificadoresObrasSchema.safeParse(quantRes.data);
    return {
      itens: obras,
      total: paginaBruta.total,
      quantificadores: quant.success
        ? quant.data
        : {
            acimaMeta: 0,
            prazoVencido: 0,
            abaixoMeta: 0,
            semStatus: 0,
            totalObras: 0,
            dataReferencia: "",
          },
      pagina: paginaAtual,
      tamanho: tamanhoAtual,
    };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
      throw error;
    throw new Error(
      traduzirErro(error, "Não foi possível carregar o relatório de obras."),
    );
  }
}

function paginaObrasSchemaSafe(data: unknown): {
  itens: unknown[];
  total: number;
} {
  const parsed = paginaObrasSchema.safeParse(data);
  if (parsed.success) return parsed.data;
  return { itens: [], total: 0 };
}

async function download(
  url: string,
): Promise<ServerActionResult<ReportDownload>> {
  try {
    const { blob, fileName, headers } = await api.auth.downloadFile(url);
    const arrayBuffer = await blob.arrayBuffer();
    return {
      success: true,
      data: {
        base64: Buffer.from(arrayBuffer).toString("base64"),
        fileName,
        contentType:
          headers.get("content-type") ?? blob.type ?? "application/octet-stream",
      },
      error: null,
    };
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: obraErrorTranslator.translate(error),
      };
    }
    return {
      success: false,
      data: null,
      error: "Não foi possível baixar o relatório.",
    };
  }
}

/**
 * Exportação da lista filtrada: GET /api/relatorios/obras/exportar
 * (formato CSV ou PDF, limite 10000). Sem paginação.
 */
export async function exportarObrasRelatorioAction(
  filtro: FiltroAgregado & { q?: string; status?: string; formato: "CSV" | "PDF" },
): Promise<ServerActionResult<ReportDownload>> {
  const { formato, q, status, ...restante } = filtro;
  const buscaTextual =
    restante.buscaTextual?.trim() || q?.trim() || undefined;
  const statusObra = [
    ...(restante.statusObra ?? []),
    ...(status?.trim() ? [status.trim()] : []),
  ];
  const consulta: FiltroObras = {
    ...restante,
    ...(buscaTextual ? { buscaTextual } : {}),
    ...(statusObra.length > 0 ? { statusObra } : {}),
  };
  return download(
    `/api/relatorios/obras/exportar?${serializarFiltro(consulta, { formato }).toString()}`,
  );
}

/** GET /api/relatorios/obras/:id/relatorio.pdf */
export async function baixarRelatorioObraAction(
  obraId: string,
): Promise<ServerActionResult<ReportDownload>> {
  return download(
    `/api/relatorios/obras/${encodeURIComponent(obraId)}/relatorio.pdf`,
  );
}

/** GET /api/relatorios/obras/:id/dossie.pdf */
export async function baixarDossieObraAction(
  obraId: string,
): Promise<ServerActionResult<ReportDownload>> {
  return download(
    `/api/relatorios/obras/${encodeURIComponent(obraId)}/dossie.pdf`,
  );
}

async function obterAgregado(
  url: string,
  fallback: string,
): Promise<unknown> {
  try {
    const res = await api.auth.get<unknown>(url, {
      next: { tags: ["relatorios"] },
    });
    return res.data;
  } catch (error) {
    if ((error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT"))
      throw error;
    throw new Error(traduzirErro(error, fallback));
  }
}

/** GET /api/relatorios/obras/mapa (quando a tela existir). */
export async function obterMapaObrasRelatorio(
  filtro: FiltroAgregado = {},
): Promise<ItemListaObras[]> {
  const qs = serializarFiltro(filtro).toString();
  const data = await obterAgregado(
    `/api/relatorios/obras/mapa${qs ? `?${qs}` : ""}`,
    "Não foi possível carregar o mapa de obras.",
  );
  const lista = Array.isArray(data) ? data : [];
  return lista.flatMap((item) => {
    const parsed = itemListaObrasSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

/** GET /api/relatorios/obras/calendario (quando a tela existir). */
export async function obterCalendarioObrasRelatorio(
  filtro: FiltroAgregado = {},
): Promise<ItemListaObras[]> {
  const qs = serializarFiltro(filtro).toString();
  const data = await obterAgregado(
    `/api/relatorios/obras/calendario${qs ? `?${qs}` : ""}`,
    "Não foi possível carregar o calendário de obras.",
  );
  const lista = Array.isArray(data) ? data : [];
  return lista.flatMap((item) => {
    const parsed = itemListaObrasSchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

/** GET /api/relatorios/obras/:id/desempenho (quando a tela existir). */
export async function obterDesempenhoObra(
  obraId: string,
): Promise<DesempenhoObra | null> {
  const data = await obterAgregado(
    `/api/relatorios/obras/${encodeURIComponent(obraId)}/desempenho`,
    "Não foi possível carregar o desempenho da obra.",
  );
  const parsed = desempenhoObraSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}

/** GET /api/relatorios/fluxo-fisico-financeiro (quando a tela existir). */
export async function obterFluxoFisicoFinanceiro(
  filtro: FiltroAgregado = {},
): Promise<FluxoFisicoFinanceiro | null> {
  const qs = serializarFiltro(filtro).toString();
  const data = await obterAgregado(
    `/api/relatorios/fluxo-fisico-financeiro${qs ? `?${qs}` : ""}`,
    "Não foi possível carregar o fluxo físico-financeiro.",
  );
  const parsed = fluxoFisicoFinanceiroSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}
