import { z } from "zod";

export const pastaResponseSchema = z.object({
  id: z.string().uuid(),
  obraId: z.string().uuid(),
  pastaPaiId: z.string().uuid().nullable(),
  nome: z.string(),
  criadoPorUsuarioId: z.string().uuid().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PastaResponse = z.infer<typeof pastaResponseSchema>;

export const arquivoResponseSchema = z.object({
  id: z.string().uuid(),
  obraId: z.string().uuid(),
  pastaId: z.string().uuid(),
  nome: z.string(),
  descricao: z.string().nullable(),
  nomeOriginal: z.string(),
  mimeType: z.string().nullable(),
  tamanhoBytes: z.string().nullable(),
  confirmado: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ArquivoResponse = z.infer<typeof arquivoResponseSchema>;

export const pageMetaSchema = z.object({
  page: z.number(),
  take: z.number(),
  itemCount: z.number(),
  pageCount: z.number(),
  hasPreviousPage: z.boolean(),
  hasNextPage: z.boolean(),
});
export type PageMeta = z.infer<typeof pageMetaSchema>;

export const conteudoPastaResponseSchema = z.object({
  pasta: pastaResponseSchema,
  trilha: z.array(z.object({ id: z.string().uuid(), nome: z.string() })),
  subpastas: z.array(pastaResponseSchema),
  arquivos: z.object({
    data: z.array(arquivoResponseSchema),
    meta: pageMetaSchema,
  }),
});
export type ConteudoPastaResponse = z.infer<typeof conteudoPastaResponseSchema>;

export const listarConteudoPastaSchema = z.object({
  pastaId: z.string().uuid("Pasta inválida."),
  page: z.number().int().positive().default(1),
  take: z.number().int().positive().max(50).default(10),
  order: z.enum(["ASC", "DESC"]).default("ASC"),
});
export type ListarConteudoPastaInput = z.input<typeof listarConteudoPastaSchema>;

export const criarSubpastaSchema = z.object({
  pastaPaiId: z.string().uuid("Pasta pai inválida."),
  nome: z.string().trim().min(1, "Informe o nome da pasta."),
});
export type CriarSubpastaInput = z.infer<typeof criarSubpastaSchema>;

export const iniciarUploadPayloadSchema = z.object({
  arquivos: z
    .array(
      z.object({
        nome: z.string().trim().min(1, "Informe o nome do arquivo."),
        descricao: z.string().trim().nullable().optional(),
        nomeOriginal: z.string().trim().min(1, "Informe o nome original."),
        mimeType: z.string().trim().min(1, "Informe o tipo do arquivo."),
      }),
    )
    .min(1, "Selecione ao menos um arquivo."),
});
export type IniciarUploadPayload = z.infer<typeof iniciarUploadPayloadSchema>;

export const uploadIniciadoItemSchema = z.object({
  arquivoId: z.string().uuid(),
  nome: z.string(),
  storageKey: z.string(),
  urlUpload: z.string().url(),
});
export const uploadIniciadoResponseSchema = z.array(uploadIniciadoItemSchema);
export type UploadIniciadoResponse = z.infer<typeof uploadIniciadoResponseSchema>;

export const confirmarUploadPayloadSchema = z.object({
  tamanhoBytes: z.number().int().nonnegative(),
  mimeType: z.string().trim().optional(),
});
export type ConfirmarUploadPayload = z.infer<typeof confirmarUploadPayloadSchema>;

export const downloadUrlResponseSchema = z.object({
  url: z.string().url(),
});
export type DownloadUrlResponse = z.infer<typeof downloadUrlResponseSchema>;

export const editarArquivoSchema = z
  .object({
    arquivoId: z.string().uuid("Arquivo inválido."),
    nome: z.string().trim().min(1, "Informe o nome do arquivo.").optional(),
    descricao: z.string().trim().nullable().optional(),
  })
  .refine((value) => value.nome !== undefined || value.descricao !== undefined, {
    message: "Informe ao menos um campo para editar.",
  });
export type EditarArquivoInput = z.infer<typeof editarArquivoSchema>;

export const moverArquivoSchema = z.object({
  arquivoId: z.string().uuid("Arquivo inválido."),
  pastaId: z.string().uuid("Pasta de destino inválida."),
});
export type MoverArquivoInput = z.infer<typeof moverArquivoSchema>;
