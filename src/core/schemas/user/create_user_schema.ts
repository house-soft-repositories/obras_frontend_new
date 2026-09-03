import z from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1),
  role: z.enum(["STAFF", "USER"]),
  tenantId: z.uuid().optional(),
});