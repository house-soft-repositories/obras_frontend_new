import { z } from "zod";

export const tipoMedicaoSchema = z.enum([
  "NORMAL",
  "RETIFICACAO",
  "EXTRA",
  "REAJUSTAMENTO",
]);
export type TipoMedicao = z.infer<typeof tipoMedicaoSchema>;

const decimalValueSchema = z.union([
  z.number().min(0, "Valor inválido."),
  z.string().min(1, "Informe o valor."),
]);

export const medicaoFonteSchema = z.object({
  id: z.string().optional(),
  tenantId: z.string().optional(),
  medicaoId: z.string().optional(),
  fonteId: z.string().uuid("Escolha um orçamento válido."),
  valor: decimalValueSchema,
});
export type MedicaoFonte = z.infer<typeof medicaoFonteSchema>;

export const medicaoSchema = z
  .object({
    id: z.string(),
    obraId: z.string(),
    numero: z.coerce.number(),
    tipo: tipoMedicaoSchema,
    dataMedicao: z.string(),
    orgaoId: z.string().nullable().optional(),
    observacoes: z.string().nullable().optional(),
    fontes: z.array(medicaoFonteSchema.passthrough()).default([]),
  })
  .passthrough();
export type Medicao = z.infer<typeof medicaoSchema>;

export const criarMedicaoSchema = z.object({
  numero: z.number().int().min(1, "Número inválido."),
  tipo: tipoMedicaoSchema,
  dataMedicao: z.string().min(1, "Informe a data da medição."),
  orgaoId: z.string().uuid("Selecione o órgão."),
  observacoes: z.string().optional(),
  fontes: z
    .array(medicaoFonteSchema)
    .min(1, "Adicione ao menos um orçamento com valor."),
});
export type CriarMedicaoInput = z.infer<typeof criarMedicaoSchema>;

export const atualizarMedicaoSchema = criarMedicaoSchema.partial();
export type AtualizarMedicaoInput = z.infer<typeof atualizarMedicaoSchema>;

export const medicaoFormSchema = criarMedicaoSchema;
export type MedicaoFormInput = z.infer<typeof medicaoFormSchema>;
