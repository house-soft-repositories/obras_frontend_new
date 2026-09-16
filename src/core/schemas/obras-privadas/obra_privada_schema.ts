import { z } from "zod";

export const SITUACAO_ALVARA_VALUES = [
  "SEM_ALVARA",
  "COM_ALVARA_VIGENTE",
  "COM_ALVARA_VENCIDO",
  "DISPENSADA",
] as const;

export const SITUACAO_ALVARA_LABELS: Record<string, string> = {
  SEM_ALVARA: "Sem alvará",
  COM_ALVARA_VIGENTE: "Alvará vigente",
  COM_ALVARA_VENCIDO: "Alvará vencido",
  DISPENSADA: "Dispensada",
};

export const ANDAMENTO_VALUES = [
  "NAO_INICIADA",
  "EM_ANDAMENTO",
  "PARALISADA",
  "CONCLUIDA",
  "DEMOLIDA",
  "CANCELADA",
] as const;

export const ANDAMENTO_LABELS: Record<string, string> = {
  NAO_INICIADA: "Não iniciada",
  EM_ANDAMENTO: "Em andamento",
  PARALISADA: "Paralisada",
  CONCLUIDA: "Concluída",
  DEMOLIDA: "Demolida",
  CANCELADA: "Cancelada",
};

export const HABITE_SE_VALUES = [
  "NAO_SOLICITADO",
  "SOLICITADO",
  "APROVADO",
  "REPROVADO",
] as const;

export const HABITE_SE_LABELS: Record<string, string> = {
  NAO_SOLICITADO: "Não emitido",
  SOLICITADO: "Solicitado",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
};

export const obraPrivadaSchema = z
  .object({
    id: z.string(),
    codigo: z.string().optional(),
    descricao: z.string().optional(),
    proprietarioPessoaId: z.string().optional(),
    proprietarioNome: z.string().optional(),
    proprietarioDocumento: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    uf: z.string().optional(),
    situacaoAlvara: z.string().optional(),
    andamento: z.string().optional(),
    habiteSe: z.string().optional(),
    etapaAtual: z.string().nullable().optional(),
    ultimaVisitaEm: z.string().nullable().optional(),
    fiscalizada: z.boolean().optional(),
    autuada: z.boolean().optional(),
    embargada: z.boolean().optional(),
    deletedAt: z.unknown().optional(),
  })
  .passthrough();

export const obraPrivadaListSchema = z.object({
  data: z.array(obraPrivadaSchema),
  meta: z.object({
    page: z.number(),
    take: z.number(),
    itemCount: z.number(),
    pageCount: z.number(),
    hasPreviousPage: z.boolean(),
    hasNextPage: z.boolean(),
  }),
});

export type ObraPrivada = z.infer<typeof obraPrivadaSchema>;
export type ObraPrivadaList = z.infer<typeof obraPrivadaListSchema>;
