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

export const usuarioOrganizationalSchema = userSchema
  .omit({ password: true })
  .extend({
    localidadeId: z.uuid().nullable().optional(),
    orgaoId: z.uuid().nullable().optional(),
    setorId: z.uuid().nullable().optional(),
    localidade: z
      .object({
        id: z.uuid(),
        nome: z.string(),
        uf: z.string(),
      })
      .nullable(),
    orgao: z
      .object({
        id: z.uuid(),
        nome: z.string(),
        sigla: z.string().nullable().optional(),
      })
      .nullable(),
    setor: z
      .object({
        id: z.uuid(),
        nome: z.string(),
        orgaoId: z.uuid(),
      })
      .nullable(),
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
export type UsuarioOrganizational = z.infer<typeof usuarioOrganizationalSchema>;
export type UserRequestContext = z.infer<typeof userRequestContextSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
