import { z } from "zod";

export const atualizarSubtipologiaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da subtipologia com pelo menos 2 caracteres.").optional(),
  ativo: z.boolean().optional(),
});

export type AtualizarSubtipologiaInput = z.input<typeof atualizarSubtipologiaSchema>;
export type AtualizarSubtipologiaOutput = z.output<typeof atualizarSubtipologiaSchema>;
