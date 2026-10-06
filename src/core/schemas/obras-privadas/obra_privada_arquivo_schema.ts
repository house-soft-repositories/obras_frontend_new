import { z } from "zod";

export const VINCULO_ARQUIVO_VALUES = [
  "OBRA",
  "FISCALIZACAO",
  "ALVARA",
  "HABITE_SE",
  "AUTO_INFRACAO",
  "ART_RRT",
] as const;

export const CATEGORIA_ARQUIVO_VALUES = [
  "FOTO",
  "DOCUMENTO",
  "PROJETO",
] as const;

export const iniciarUploadArquivoSchema = z.object({
  vinculo: z.enum(VINCULO_ARQUIVO_VALUES),
  vinculoId: z.string().uuid().optional(),
  arquivos: z
    .array(
      z.object({
        nomeOriginal: z.string().trim().min(1, "Informe o nome do arquivo."),
        nome: z.string().optional(),
        descricao: z.string().optional(),
        categoria: z.enum(CATEGORIA_ARQUIVO_VALUES).optional(),
        mimeType: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        capturadoEm: z.string().optional(),
        ordem: z.number().int().min(0).optional(),
      }),
    )
    .min(1, "Informe ao menos um arquivo.")
    .max(50, "Envie no máximo 50 arquivos por vez."),
});

export const confirmarUploadArquivoSchema = z.object({
  tamanhoBytes: z.number().int().min(0).optional(),
  mimeType: z.string().optional(),
});

export const vincularArquivoRecursoSchema = z.object({
  arquivoId: z.string().uuid("Arquivo inválido."),
});

export type IniciarUploadArquivoInput = z.infer<
  typeof iniciarUploadArquivoSchema
>;
export type ConfirmarUploadArquivoInput = z.infer<
  typeof confirmarUploadArquivoSchema
>;
export type VincularArquivoRecursoInput = z.infer<
  typeof vincularArquivoRecursoSchema
>;

export interface UploadPreparado {
  arquivoId: string;
  nome: string;
  urlUpload: string;
}

export type VinculoArquivo = (typeof VINCULO_ARQUIVO_VALUES)[number];

const MIME_IMAGEM = /^image\//;

export function categoriaPorMime(mimeType: string): "FOTO" | "DOCUMENTO" {
  return MIME_IMAGEM.test(mimeType) ? "FOTO" : "DOCUMENTO";
}

const MIME_ANEXO_ACEITOS = ["application/pdf"];

export function isMimeAnexoAceito(mimeType: string): boolean {
  return MIME_IMAGEM.test(mimeType) || MIME_ANEXO_ACEITOS.includes(mimeType);
}

export const ACCEPT_ANEXO = "image/*,application/pdf";
