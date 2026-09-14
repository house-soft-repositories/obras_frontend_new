import { z } from "zod";
import TipoOrgao from "@/core/schemas/orgaos/tipo_orgao_enum";

export const tipoOrgaoSchema = z.enum(TipoOrgao);

export const orgaoSchema = z.object({
  id: z.uuid(),
  localidadeId: z.uuid(),
  nome: z.string(),
  sigla: z.string().nullable(),
  tipo: z.enum(TipoOrgao).nullable(),
  responsavel: z.string().nullable(),
  email: z.string().nullable(),
  telefone: z.string().nullable(),
  ativo: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type OrgaoSchema = z.infer<typeof orgaoSchema>;
