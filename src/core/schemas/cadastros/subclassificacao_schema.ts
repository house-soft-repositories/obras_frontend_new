import { z } from "zod";

export const subclassificacaoSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid(),
  classificacaoId: z.uuid(),
  nome: z.string(),
  ativo: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type SubclassificacaoSchema = z.infer<typeof subclassificacaoSchema>;
