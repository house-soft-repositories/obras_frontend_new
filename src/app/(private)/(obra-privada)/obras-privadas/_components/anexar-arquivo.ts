"use client";

import {
  confirmarUploadArquivoObraPrivadaAction,
  iniciarUploadArquivoObraPrivadaAction,
} from "@/core/actions/obras-privadas/obra_privada_arquivo_actions";
import {
  categoriaPorMime,
  type VinculoArquivo,
} from "@/core/schemas/obras-privadas/obra_privada_arquivo_schema";

type Params = {
  obraPrivadaId: string;
  vinculo: VinculoArquivo;
  vinculoId?: string;
  file: File;
  descricao?: string;
  onEtapa?: (etapa: "iniciando" | "enviando" | "confirmando") => void;
};

/**
 * Orquestra o anexo de um arquivo a um recurso de obra privada:
 * 1. POST /api/obras-privadas/:id/arquivos (inicia, recebe urlUpload)
 * 2. PUT urlUpload com o binário (navegador -> storage, sem passar pelo Next)
 * 3. POST /api/obras-privadas-arquivos/:arquivoId/confirmar
 * Retorna o arquivoId confirmado.
 */
export async function anexarArquivo(params: Params): Promise<string> {
  const iniciado = await iniciarUploadArquivoObraPrivadaAction(
    params.obraPrivadaId,
    {
      vinculo: params.vinculo,
      ...(params.vinculoId ? { vinculoId: params.vinculoId } : {}),
      arquivos: [
        {
          nomeOriginal: params.file.name,
          categoria: categoriaPorMime(
            params.file.type || "application/octet-stream",
          ),
          ...(params.file.type ? { mimeType: params.file.type } : {}),
          ...(params.descricao ? { descricao: params.descricao } : {}),
        },
      ],
    },
  );
  if (!iniciado.success) throw new Error(iniciado.error);
  const preparado = iniciado.data[0];
  if (!preparado) throw new Error("Resposta de upload vazia.");

  params.onEtapa?.("enviando");
  const resposta = await fetch(preparado.urlUpload, {
    method: "PUT",
    body: params.file,
    headers: {
      "content-type": params.file.type || "application/octet-stream",
    },
  });
  if (!resposta.ok) {
    throw new Error(
      `Falha ao enviar ${params.file.name} (HTTP ${resposta.status}).`,
    );
  }

  params.onEtapa?.("confirmando");
  const confirmado = await confirmarUploadArquivoObraPrivadaAction(
    params.obraPrivadaId,
    preparado.arquivoId,
    {
      tamanhoBytes: params.file.size,
      ...(params.file.type ? { mimeType: params.file.type } : {}),
    },
  );
  if (!confirmado.success) throw new Error(confirmado.error);
  return preparado.arquivoId;
}
