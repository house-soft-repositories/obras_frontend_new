import { z } from "zod";

/** Espelha UserRole do backend. */
export const userRoleSchema = z.enum(["SUPERADMIN", "ADMIN", "STAFF", "USER"]);

/**
 * Usuário persistido (`UserDto` do backend). Use apenas no servidor: contém
 * password e, portanto, nunca deve ser serializado para a sessão do cliente.
 */
export const userSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  password: z.string(),
  role: userRoleSchema,
  tenantId: z.uuid().nullable(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

/** Resposta de GET /api/auth/me (`UserRequestContext`), sem password. */
export const userRequestContextSchema = userSchema
  .omit({
    password: true,
    tenantId: true,
  })
  .extend({
    tenant: z
      .object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
      })
      .nullable(),
  });

export type User = z.infer<typeof userSchema>;
export type UserRequestContext = z.infer<typeof userRequestContextSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
