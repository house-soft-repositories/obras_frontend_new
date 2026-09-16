import { z } from "zod";
import { pessoaType } from "@/core/schemas/pessoa/pessoa_type";

export const pessoaSchema = z.object({
  id: z.uuid(),
  tipo: pessoaType,
  documento: z.string(),
  nome: z.string(),
  nomeFantasia: z.string().nullable().optional(),
  rg: z.string().nullable().optional(),
  orgaoExpedidor: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  cep: z.string().nullable().optional(),
  logradouro: z.string().nullable().optional(),
  numero: z.string().nullable().optional(),
  complemento: z.string().nullable().optional(),
  bairro: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  uf: z.string().nullable().optional(),
  ativo: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type PessoaType = z.infer<typeof pessoaSchema>;
