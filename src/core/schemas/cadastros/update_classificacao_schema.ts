import { z } from "zod";

export const atualizarClassificacaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da classificação com pelo menos 2 caracteres.").optional(),
  ativo: z.boolean().optional(),
});

export type AtualizarClassificacaoInput = z.input<typeof atualizarClassificacaoSchema>;
export type AtualizarClassificacaoOutput = z.output<typeof atualizarClassificacaoSchema>;
