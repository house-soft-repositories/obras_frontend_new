import { z } from "zod";
import TipoOrgao from "@/core/schemas/orgaos/tipo_orgao_enum";
import { orgaoSchema } from "@/core/schemas/orgaos/orgao_schema";

export const criarOrgaoSchema = orgaoSchema
  .pick({
    localidadeId: true,
    nome: true,
  })
  .extend({
    sigla: z.string().optional(),
    tipo: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.enum(TipoOrgao).optional(),
    ),
    responsavel: z.string().optional(),
    email: z.email().optional().or(z.literal("")),
    telefone: z.string().optional(),
    ativo: z.boolean().optional(),
  })
  .transform((data) => ({
    ...data,
    sigla: data.sigla === "" ? undefined : data.sigla,
    responsavel: data.responsavel === "" ? undefined : data.responsavel,
    email: data.email === "" ? undefined : data.email,
    telefone: data.telefone === "" ? undefined : data.telefone,
  }));

export type CriarOrgaoInput = z.input<typeof criarOrgaoSchema>;
export type CriarOrgaoOutput = z.output<typeof criarOrgaoSchema>;
