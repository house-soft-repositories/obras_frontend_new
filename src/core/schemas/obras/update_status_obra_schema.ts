import { z } from "zod";

export const statusObraSchema = z.enum([
  "EM_ABERTO",
  "EM_DESENVOLVIMENTO",
  "CONCLUIDO",
  "PARALISADO",
  "CANCELADO",
]);

export const atualizarStatusObraSchema = z.object({
  novoStatus: statusObraSchema,
});

export type AtualizarStatusObraInput = z.infer<typeof atualizarStatusObraSchema>;
export type StatusObra = z.infer<typeof statusObraSchema>;
