import { z } from "zod";

export const setorSchema = z.object({
  id: z.uuid(),
  orgaoId: z.uuid().optional(),
  nome: z.string(),
  ativo: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const setorWithOrgaoSchema = setorSchema.extend({
  orgao: z.object({
    id: z.uuid(),
    nome: z.string(),
  }),
});

export type SetorSchema = z.infer<typeof setorSchema>;
export type SetorWithOrgaoSchema = z.infer<typeof setorWithOrgaoSchema>;
