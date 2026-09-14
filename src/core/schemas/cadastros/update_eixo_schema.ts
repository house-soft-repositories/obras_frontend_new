import { z } from "zod";

export const atualizarEixoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do eixo com pelo menos 2 caracteres.").optional(),
  ativo: z.boolean().optional(),
});

export type AtualizarEixoInput = z.input<typeof atualizarEixoSchema>;
export type AtualizarEixoOutput = z.output<typeof atualizarEixoSchema>;
