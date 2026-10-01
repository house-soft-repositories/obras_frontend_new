"use server";

import api from "@/core/rest_client/api";
import { obraPrivadaErrorTranslator } from "@/core/errors/obra_privada_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import type ServerActionResult from "@/core/types/server_action_result";

export interface ReportDownload {
  base64: string;
  fileName: string;
  contentType: string;
}

function qs(params: Record<string, string | number | undefined | null>) {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      usp.set(key, String(value));
    }
  });
  return usp.toString() ? `?${usp.toString()}` : "";
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
          headers.get("content-type") ??
          blob.type ??
          "application/octet-stream",
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
        error: obraPrivadaErrorTranslator.translate(error),
      };
    }
    return {
      success: false,
      data: null,
      error: "Não foi possível baixar o relatório.",
    };
  }
}

export async function exportarObrasPrivadasAction(params: {
  formato: "CSV" | "PDF";
  busca?: string;
  situacaoAlvara?: string;
  andamento?: string;
  habiteSe?: string;
}) {
  return download(`/api/relatorios/obras-privadas/exportar${qs(params)}`);
}

export async function baixarDossieObraPrivadaAction(obraPrivadaId: string) {
  return download(`/api/relatorios/obras-privadas/${obraPrivadaId}/dossie.pdf`);
}

export async function baixarRelatorioFiscalizacaoPrivadaAction(
  fiscalizacaoId: string,
) {
  return download(
    `/api/relatorios/obras-privadas/fiscalizacoes/${fiscalizacaoId}/relatorio.pdf`,
  );
}
