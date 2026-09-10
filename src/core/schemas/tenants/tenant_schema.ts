import { z } from "zod";

export const tenantSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  cnpj: z.string().nullable(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TenantType = z.infer<typeof tenantSchema>;
