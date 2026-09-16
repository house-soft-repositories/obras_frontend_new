import { z } from "zod";

export const tipoPrazoExecucaoSchema = z.enum(["DIAS", "DATA"]);
export type TipoPrazoExecucao = z.infer<typeof tipoPrazoExecucaoSchema>;

export const tipoAditivoSchema = z.enum([
  "PRAZO",
  "VALOR",
  "PRAZO_E_VALOR",
  "FONTE",
  "OUTROS",
]);
export type TipoAditivo = z.infer<typeof tipoAditivoSchema>;

export const contratoFonteSchema = z.object({
  id: z.string().optional(),
  fonteId: z.string().uuid("Escolha uma fonte válida."),
  valor: z.string().min(1, "Informe o valor."),
});
export type ContratoFonte = z.infer<typeof contratoFonteSchema>;

export const contratoSchema = z
  .object({
    id: z.string().uuid(),
    obraId: z.string().uuid(),
    empresaContratadaId: z.string().uuid(),
    numero: z.string(),
    objeto: z.string().nullable().optional(),
    dataAssinatura: z.string().nullable().optional(),
    fimVigencia: z.string().nullable().optional(),
    dataOs: z.string(),
    tipoPrazoExecucao: tipoPrazoExecucaoSchema,
    prazoExecucaoDias: z.number().nullable().optional(),
    prazoExecucaoData: z.string().nullable().optional(),
    fontes: z.array(contratoFonteSchema).default([]),
    valorContratadoInicial: z.string().optional(),
  })
  .passthrough();
export type Contrato = z.infer<typeof contratoSchema>;

export const criarContratoSchema = z.object({
  obraId: z.string().uuid("Obra inválida."),
  empresaContratadaId: z.string().uuid("Escolha a empresa contratada."),
  numero: z.string().min(1, "Informe o número do contrato."),
  objeto: z.string().optional(),
  dataAssinatura: z.string().optional(),
  fimVigencia: z.string().optional(),
  dataOs: z.string().min(1, "Informe a data da ordem de serviço."),
  tipoPrazoExecucao: tipoPrazoExecucaoSchema,
  prazoExecucaoDias: z.number().int().min(1).optional(),
  prazoExecucaoData: z.string().optional(),
  fontes: z
    .array(
      z.object({
        fonteId: z.string().uuid("Escolha uma fonte válida."),
        valor: z.string().min(1, "Informe o valor."),
      }),
    )
    .min(1, "Vincule ao menos uma fonte."),
});
export type CriarContratoInput = z.infer<typeof criarContratoSchema>;

export const atualizarContratoSchema = criarContratoSchema
  .omit({ obraId: true })
  .partial();
export type AtualizarContratoInput = z.infer<typeof atualizarContratoSchema>;

export const aditivoSchema = z
  .object({
    id: z.string(),
    contratoId: z.string(),
    numero: z.string(),
    tipo: tipoAditivoSchema,
    dataAssinatura: z.string().nullable().optional(),
    tipoPrazoExecucao: tipoPrazoExecucaoSchema.nullable().optional(),
    prazoExecucaoDias: z.number().nullable().optional(),
    prazoExecucaoData: z.string().nullable().optional(),
    vigenciaAditivada: z.string().nullable().optional(),
    observacoes: z.string().nullable().optional(),
    fontes: z.array(contratoFonteSchema).default([]),
  })
  .passthrough();
export type Aditivo = z.infer<typeof aditivoSchema>;

export const criarAditivoSchema = z.object({
  numero: z.string().min(1, "Informe o número do aditivo."),
  tipo: tipoAditivoSchema,
  dataAssinatura: z.string().optional(),
  tipoPrazoExecucao: tipoPrazoExecucaoSchema.optional(),
  prazoExecucaoDias: z.number().int().min(1).optional(),
  prazoExecucaoData: z.string().optional(),
  vigenciaAditivada: z.string().optional(),
  observacoes: z.string().optional(),
});
export type CriarAditivoInput = z.infer<typeof criarAditivoSchema>;

export const paralisacaoSchema = z
  .object({
    id: z.string(),
    contratoId: z.string().optional(),
    dataParalisacao: z.string(),
    motivo: z.string(),
    dataReinicio: z.string().nullable().optional(),
  })
  .passthrough();
export type Paralisacao = z.infer<typeof paralisacaoSchema>;

export const criarParalisacaoSchema = z.object({
  dataParalisacao: z.string().min(1, "Informe a data da paralisação."),
  motivo: z.string().min(1, "Informe o motivo."),
  termoParalisacaoArquivoId: z.string().uuid("Anexe o termo de paralisação."),
});
export type CriarParalisacaoInput = z.infer<typeof criarParalisacaoSchema>;

export const reinicioParalisacaoSchema = z.object({
  dataReinicio: z.string().min(1, "Informe a data de reinício."),
  termoRetomadaArquivoId: z.string().uuid().optional(),
});
export type ReinicioParalisacaoInput = z.infer<typeof reinicioParalisacaoSchema>;

export const prazoFinalSchema = z
  .object({
    prazoFinal: z.string(),
    totalDias: z.number(),
    diasBase: z.number(),
    diasParalisacoes: z.number(),
    diasAditivos: z.number(),
  })
  .passthrough();
export type PrazoFinal = z.infer<typeof prazoFinalSchema>;

export const valoresContratoSchema = z.unknown();
export type ValoresContrato = unknown;
