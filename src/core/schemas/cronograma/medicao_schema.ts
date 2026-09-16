import { z } from "zod";

export const tipoMedicaoSchema = z.enum([
  "NORMAL",
  "RETIFICACAO",
  "EXTRA",
  "REAJUSTAMENTO",
]);
export type TipoMedicao = z.infer<typeof tipoMedicaoSchema>;

export const medicaoItemSchema = z.object({
  fonteId: z.string().uuid("Escolha uma fonte válida."),
  valor: z.number().min(0, "Valor inválido."),
});
export type MedicaoItem = z.infer<typeof medicaoItemSchema>;

export const medicaoSchema = z
  .object({
    id: z.string(),
    obraId: z.string(),
    numero: z.number(),
    tipo: tipoMedicaoSchema,
    dataMedicao: z.string(),
    observacao: z.string().nullable().optional(),
    itens: z.array(medicaoItemSchema.passthrough()).default([]),
  })
  .passthrough();
export type Medicao = z.infer<typeof medicaoSchema>;

export const criarMedicaoSchema = z.object({
  tipo: tipoMedicaoSchema,
  dataMedicao: z.string().min(1, "Informe a data da medição."),
  observacao: z.string().optional(),
  itens: z
    .array(medicaoItemSchema)
    .min(1, "Adicione ao menos uma fonte com valor."),
});
export type CriarMedicaoInput = z.infer<typeof criarMedicaoSchema>;
