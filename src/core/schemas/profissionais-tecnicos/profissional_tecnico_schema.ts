import { z } from "zod";

export const conselhoProfissionalSchema = z.enum(["CREA", "CAU", "CFT"]);

export const profissionalTecnicoSchema = z.object({
  id: z.uuid(),
  pessoaId: z.uuid(),
  nome: z.string(),
  documento: z.string(),
  conselho: conselhoProfissionalSchema,
  numeroRegistro: z.string(),
  ufRegistro: z.string().nullable().optional(),
  titulo: z.string().nullable().optional(),
  ativo: z.boolean(),
  registro: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ConselhoProfissional = z.infer<typeof conselhoProfissionalSchema>;
export type ProfissionalTecnico = z.infer<typeof profissionalTecnicoSchema>;
