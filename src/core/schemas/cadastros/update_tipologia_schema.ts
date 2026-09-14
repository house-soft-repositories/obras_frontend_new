import { z } from "zod";

export const atualizarTipologiaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da tipologia com pelo menos 2 caracteres.").optional(),
  ativo: z.boolean().optional(),
});

export type AtualizarTipologiaInput = z.input<typeof atualizarTipologiaSchema>;
export type AtualizarTipologiaOutput = z.output<typeof atualizarTipologiaSchema>;
