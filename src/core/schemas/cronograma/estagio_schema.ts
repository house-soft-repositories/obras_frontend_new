import { z } from "zod";

export const estagioStatusSchema = z.enum([
  "PENDENTE",
  "EM_ANDAMENTO",
  "CONCLUIDO",
]);
export type EstagioStatus = z.infer<typeof estagioStatusSchema>;

export const estagioSchema = z
  .object({
    id: z.string(),
    obraId: z.string(),
    nome: z.string(),
    posicao: z.number().default(0),
    status: estagioStatusSchema.default("PENDENTE"),
    dataInicio: z.string().nullable().optional(),
    dataFim: z.string().nullable().optional(),
    percentualDireto: z.number().nullable().optional(),
    responsavelUsuarioId: z.string().nullable().optional(),
  })
  .passthrough();
export type Estagio = z.infer<typeof estagioSchema>;

export const estagioAcompanhamentoSchema = z
  .object({
    id: z.string(),
    tenantId: z.string().optional(),
    obraId: z.string(),
    estagioId: z.string(),
    percentual: z.number(),
    data: z.string(),
    observacao: z.string().nullable().optional(),
    autorUsuarioId: z.string().optional(),
    criadoEm: z.string().or(z.date()).optional(),
  })
  .passthrough();
export type EstagioAcompanhamento = z.infer<typeof estagioAcompanhamentoSchema>;

export const estagioComentarioSchema = z
  .object({
    id: z.string(),
    tenantId: z.string().optional(),
    obraId: z.string(),
    estagioId: z.string(),
    texto: z.string(),
    autorUsuarioId: z.string().optional(),
    criadoEm: z.string().or(z.date()).optional(),
  })
  .passthrough();
export type EstagioComentario = z.infer<typeof estagioComentarioSchema>;

export const criarEstagioSchema = z.object({
  nome: z.string().min(1, "Informe o nome da etapa."),
  posicao: z.number().int().min(0).optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
  responsavelUsuarioId: z.string().uuid().optional().or(z.literal("")),
});
export type CriarEstagioInput = z.infer<typeof criarEstagioSchema>;

export const atualizarEstagioSchema = criarEstagioSchema.partial();
export type AtualizarEstagioInput = z.infer<typeof atualizarEstagioSchema>;

export const criarAcompanhamentoSchema = z.object({
  percentual: z.number().min(0, "Mínimo 0%.").max(100, "Máximo 100%."),
  data: z.string().min(1, "Informe a data."),
  observacao: z.string().optional(),
});
export type CriarAcompanhamentoInput = z.infer<
  typeof criarAcompanhamentoSchema
>;

export const atualizarAcompanhamentoSchema =
  criarAcompanhamentoSchema.partial();
export type AtualizarAcompanhamentoInput = z.infer<
  typeof atualizarAcompanhamentoSchema
>;

export const criarComentarioSchema = z.object({
  texto: z.string().min(1, "Informe o comentário."),
});
export type CriarComentarioInput = z.infer<typeof criarComentarioSchema>;

export const atualizarComentarioSchema = criarComentarioSchema;
export type AtualizarComentarioInput = z.infer<
  typeof atualizarComentarioSchema
>;
