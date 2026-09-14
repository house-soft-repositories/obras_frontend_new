import { z } from "zod";

export const criarSetorSchema = z.object({
  orgaoId: z.uuid(),
  nome: z.string().min(1, "Informe o nome do setor"),
  ativo: z.boolean().optional(),
});

export type CriarSetorInput = z.input<typeof criarSetorSchema>;
export type CriarSetorOutput = z.output<typeof criarSetorSchema>;
