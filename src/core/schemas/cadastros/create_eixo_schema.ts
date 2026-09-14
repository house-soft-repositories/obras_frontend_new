import { z } from "zod";

export const criarEixoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do eixo com pelo menos 2 caracteres."),
});

export type CriarEixoInput = z.input<typeof criarEixoSchema>;
export type CriarEixoOutput = z.output<typeof criarEixoSchema>;
