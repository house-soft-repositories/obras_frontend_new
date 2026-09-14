import { z } from "zod";

export const criarSubtipologiaSchema = z.object({
  tipologiaId: z.uuid("Selecione uma tipologia."),
  nome: z.string().trim().min(2, "Informe o nome da subtipologia com pelo menos 2 caracteres."),
});

export type CriarSubtipologiaInput = z.input<typeof criarSubtipologiaSchema>;
export type CriarSubtipologiaOutput = z.output<typeof criarSubtipologiaSchema>;
