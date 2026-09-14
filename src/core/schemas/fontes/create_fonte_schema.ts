import { z } from "zod";
import { fonteSchema } from "@/core/schemas/fontes/fonte_schema";

export const criarFonteSchema = fonteSchema
  .pick({
    nome: true,
  })
  .extend({
    nome: z.string().trim().min(2, "Informe o nome da fonte."),
    descricao: z.string().trim().optional(),
    codigo: z.string().trim().optional(),
    tipo: z.string().trim().optional(),
    valorPrevisto: z.string().trim().optional(),
    vigencia: z.string().trim().optional(),
  })
  .transform((data) => ({
    nome: data.nome,
    descricao: data.descricao?.trim() ? data.descricao.trim() : undefined,
    codigo: data.codigo?.trim() ? data.codigo.trim() : undefined,
    tipo: data.tipo?.trim() ? data.tipo.trim() : undefined,
    valorPrevisto: data.valorPrevisto?.trim() ? data.valorPrevisto.trim() : undefined,
    vigencia: data.vigencia?.trim() ? data.vigencia.trim() : undefined,
  }));

export type CriarFonteInput = z.input<typeof criarFonteSchema>;
export type CriarFonteOutput = z.output<typeof criarFonteSchema>;
