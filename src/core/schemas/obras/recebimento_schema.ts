import { z } from "zod";

export const tipoRecebimentoSchema = z.enum([
  "PROVISORIO",
  "DEFINITIVO",
  "INAUGURACAO",
]);

export const recebimentoSchema = z.object({
  id: z.string().uuid(),
  tipo: tipoRecebimentoSchema,
  data: z.string().nullable().optional(),
  dataPrevista: z.string().nullable().optional(),
});

export const salvarRecebimentoSchema = z.object({
  tipo: tipoRecebimentoSchema,
  data: z.string().optional(),
  dataPrevista: z.string().optional(),
});

export type Recebimento = z.infer<typeof recebimentoSchema>;
export type TipoRecebimento = z.infer<typeof tipoRecebimentoSchema>;
export type SalvarRecebimentoInput = z.infer<typeof salvarRecebimentoSchema>;
