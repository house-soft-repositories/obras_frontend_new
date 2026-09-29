import { z } from "zod";

export const setorPayloadSchema = z.object({
  nome: z.string().min(1, "Informe o nome do setor"),
  ativo: z.boolean().optional(),
});

export const criarSetorSchema = setorPayloadSchema.extend({
  orgaoId: z.uuid(),
});

export type CriarSetorInput = z.input<typeof criarSetorSchema>;
export type CriarSetorOutput = z.output<typeof criarSetorSchema>;
export type SetorPayloadInput = z.input<typeof setorPayloadSchema>;
export type SetorPayloadOutput = z.output<typeof setorPayloadSchema>;
