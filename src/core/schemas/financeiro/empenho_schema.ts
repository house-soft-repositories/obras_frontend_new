import { z } from "zod";
import { financeiroBaseSchema } from "./common_schema";

export const empenhoSchema = financeiroBaseSchema.extend({
  tipo: z.enum(["ORDINARIO", "ESTIMATIVO", "GLOBAL"]).optional(),
  dataEmpenho: z.string().nullable().optional(),
});
export type Empenho = z.infer<typeof empenhoSchema>;

export const empenhoListResponseSchema = z.union([
  z.array(empenhoSchema),
  z.object({ data: z.array(empenhoSchema) }),
  z.object({ items: z.array(empenhoSchema) }),
]);
export type EmpenhoListResponse = z.infer<typeof empenhoListResponseSchema>;

export const criarEmpenhoSchema = empenhoSchema
  .pick({
    fonteId: true,
    tipo: true,
    valor: true,
    numero: true,
    observacoes: true,
    dataEmpenho: true,
  })
  .extend({
    tipo: z.enum(["ORDINARIO", "ESTIMATIVO", "GLOBAL"]).default("ORDINARIO"),
    numero: z.string().min(1, "Informe o número."),
    observacoes: z.string().optional(),
    dataEmpenho: z.string().min(1, "Informe a data do empenho."),
  });
export type CriarEmpenhoInput = z.infer<typeof criarEmpenhoSchema>;
export type CriarEmpenhoFormInput = z.input<typeof criarEmpenhoSchema>;

export const atualizarEmpenhoSchema = criarEmpenhoSchema.partial();
export type AtualizarEmpenhoInput = z.infer<typeof atualizarEmpenhoSchema>;
export type AtualizarEmpenhoFormInput = z.input<typeof atualizarEmpenhoSchema>;
