import { z } from "zod";

export const visaoFisicoFinanceiraItemSchema = z
  .object({
    valor: z.union([z.string(), z.number()]),
    percentual: z.union([z.string(), z.number()]),
  })
  .passthrough();

export const visaoFisicoFinanceiraSchema = z
  .object({
    contratado: visaoFisicoFinanceiraItemSchema,
    aditivado: visaoFisicoFinanceiraItemSchema,
    medido: visaoFisicoFinanceiraItemSchema,
    empenhado: visaoFisicoFinanceiraItemSchema,
    liquidado: visaoFisicoFinanceiraItemSchema,
    pago: visaoFisicoFinanceiraItemSchema,
  })
  .passthrough();
export type VisaoFisicoFinanceira = z.infer<typeof visaoFisicoFinanceiraSchema>;
