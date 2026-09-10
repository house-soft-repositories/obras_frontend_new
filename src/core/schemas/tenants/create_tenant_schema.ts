import { z } from "zod";
import { tenantSchema } from "./tenant_schema";

export const createTenantSchema = tenantSchema
  .pick({
    name: true,
    slug: true,
    cnpj: true,
  })
  .extend({
    name: z.string().trim().min(2, "Informe o nome da organização.").max(120, "Nome muito longo."),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "Informe o slug do tenant.")
      .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens."),
    cnpj: z
      .string()
      .trim()
      .nullable()
      .transform((valor) => {
        if (!valor) return null;
        const digitos = valor.replace(/\D/g, "");
        return digitos ? digitos : null;
      })
      .refine((valor) => !valor || valor.length === 14, {
        message: "O CNPJ deve conter exatamente 14 dígitos.",
      }),
  });

export type CreateTenantInput = z.input<typeof createTenantSchema>;
export type CreateTenantOutput = z.output<typeof createTenantSchema>;
