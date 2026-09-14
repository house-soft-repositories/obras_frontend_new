import { z } from "zod";
import { tipoObraSchema } from "./tipo_obra";

export const obraSchema = z
  .object({
    id: z.string().uuid(),
    nome: z.string().optional(),
    codigo: z.string().optional(),
    tipo: tipoObraSchema.optional(),
    status: z.string().optional(),
    deletedAt: z.unknown().optional(),
  })
  .passthrough();

export const obraListSchema = z.object({
  data: z.array(obraSchema),
  meta: z.object({
    page: z.number(),
    take: z.number(),
    itemCount: z.number(),
    pageCount: z.number(),
    hasPreviousPage: z.boolean(),
    hasNextPage: z.boolean(),
  }),
});

export type Obra = z.infer<typeof obraSchema>;
export type ObraList = z.infer<typeof obraListSchema>;
