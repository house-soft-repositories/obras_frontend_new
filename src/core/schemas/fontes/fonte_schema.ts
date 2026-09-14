import { z } from "zod";

export const fonteSchema = z.object({
  id: z.uuid(),
  nome: z.string(),
  descricao: z.string().nullable(),
  codigo: z.string().nullable(),
  tipo: z.string().nullable(),
  valorPrevisto: z.string().nullable(),
  vigencia: z.string().nullable(),
  ativo: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type FonteSchema = z.infer<typeof fonteSchema>;
