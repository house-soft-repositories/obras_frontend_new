import { z } from "zod";

export const eixoSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  nome: z.string(),
  ativo: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type EixoSchema = z.infer<typeof eixoSchema>;
