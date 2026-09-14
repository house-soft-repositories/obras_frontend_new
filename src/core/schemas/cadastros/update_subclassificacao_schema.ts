import { z } from "zod";

export const atualizarSubclassificacaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da subclassificação com pelo menos 2 caracteres.").optional(),
  ativo: z.boolean().optional(),
});

export type AtualizarSubclassificacaoInput = z.input<typeof atualizarSubclassificacaoSchema>;
export type AtualizarSubclassificacaoOutput = z.output<typeof atualizarSubclassificacaoSchema>;
