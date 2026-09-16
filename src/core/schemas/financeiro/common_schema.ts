import { z } from "zod";

export const valorFinanceiroSchema = z
  .union([z.string(), z.number()])
  .transform((value) =>
    typeof value === "number" ? value : Number(value.trim().replace(",", ".")),
  )
  .refine((value) => Number.isFinite(value), "Informe o valor.")
  .refine((value) => value > 0, "Informe um valor maior que zero.");

export const financeiroBaseSchema = z
  .object({
    id: z.string().uuid(),
    obraId: z.string().uuid().optional(),
    fonteId: z.string().uuid("Escolha uma fonte válida."),
    valor: valorFinanceiroSchema,
    numero: z.string().nullable().optional(),
    observacao: z.string().nullable().optional(),
    observacoes: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();
