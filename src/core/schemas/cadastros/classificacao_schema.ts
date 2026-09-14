import { z } from "zod";

export const classificacaoSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  nome: z.string(),
  ativo: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ClassificacaoSchema = z.infer<typeof classificacaoSchema>;
