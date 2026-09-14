import { z } from "zod";

export const subtipologiaSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  tipologiaId: z.uuid(),
  nome: z.string(),
  ativo: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type SubtipologiaSchema = z.infer<typeof subtipologiaSchema>;
