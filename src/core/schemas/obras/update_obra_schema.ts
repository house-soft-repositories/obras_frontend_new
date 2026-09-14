import { z } from "zod";
import { tipoObraSchema } from "./tipo_obra";

export const atualizarObraSchema = z.object({
  nome: z.string().trim().min(1).optional(), tipo: tipoObraSchema.optional(), status: z.string().optional(), orgaoId: z.string().uuid().optional(), setorId: z.string().uuid().optional(), localidadeId: z.string().uuid().optional(),
  subclassificacaoId: z.string().uuid().optional(), eixoId: z.string().uuid().optional(), classificacaoId: z.string().uuid().optional(), tipologiaId: z.string().uuid().optional(), subtipologiaId: z.string().uuid().optional(), descricao: z.string().optional(), seguirAutomatico: z.boolean().optional(),
}).passthrough();
export type AtualizarObraInput = z.input<typeof atualizarObraSchema>;
