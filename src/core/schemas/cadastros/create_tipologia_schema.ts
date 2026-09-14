import { z } from "zod";

export const criarTipologiaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome da tipologia com pelo menos 2 caracteres."),
});

export type CriarTipologiaInput = z.input<typeof criarTipologiaSchema>;
export type CriarTipologiaOutput = z.output<typeof criarTipologiaSchema>;
