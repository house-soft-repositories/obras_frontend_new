import { z } from "zod";

export const criarSubclassificacaoSchema = z.object({
  classificacaoId: z.uuid("Selecione uma classificação."),
  nome: z.string().trim().min(2, "Informe o nome da subclassificação com pelo menos 2 caracteres."),
});

export type CriarSubclassificacaoInput = z.input<typeof criarSubclassificacaoSchema>;
export type CriarSubclassificacaoOutput = z.output<typeof criarSubclassificacaoSchema>;
