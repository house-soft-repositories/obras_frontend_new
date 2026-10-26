import { z } from "zod";

export const lookupCnpjSchema = z.object({
  cnpj: z
    .string()
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 14, "Informe um CNPJ válido."),
});

export type LookupCnpjInput = z.input<typeof lookupCnpjSchema>;
