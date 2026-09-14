import { z } from "zod";

export const criarClassificacaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da classificação com pelo menos 2 caracteres."),
});

export type CriarClassificacaoInput = z.input<typeof criarClassificacaoSchema>;
export type CriarClassificacaoOutput = z.output<typeof criarClassificacaoSchema>;
