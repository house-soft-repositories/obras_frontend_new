import { z } from "zod";

export const empresaSchema = z.object({
  id: z.uuid(),
  tenantId: z.uuid().optional(),
  razaoSocial: z.string(),
  nomeFantasia: z.string().nullable().optional(),
  cnpj: z.string(),
  responsavel: z.string().nullable().optional(),
  cargoResponsavel: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  logradouro: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  uf: z.string().nullable().optional(),
  ativo: z.boolean(),
  telefones: z.array(z.string()).optional().default([]),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type EmpresaSchema = z.infer<typeof empresaSchema>;
