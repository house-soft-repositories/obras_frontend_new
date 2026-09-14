import { z } from "zod";

export const tipologiaSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  nome: z.string(),
  ativo: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TipologiaSchema = z.infer<typeof tipologiaSchema>;
