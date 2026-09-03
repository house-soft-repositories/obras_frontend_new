import { z } from "zod";
import { authTokensSchema } from "./auth_tokens";
import {
  userRequestContextSchema,
  userRoleSchema,
} from "@/core/schemas/user/user_schema";

export const authRoleSchema = userRoleSchema;

/** Claims mínimas verificadas localmente antes de usar um access JWT. */
export const accessTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  exp: z.int().positive(),
  type: z.literal("access"),
});

/** Fonte de verdade devolvida por GET /api/auth/me. */
export const authenticatedUserSchema = userRequestContextSchema;

export const nextAuthUserSchema = z.object({
  ...authenticatedUserSchema.shape,
  ...authTokensSchema.shape,
  accessTokenExpiresAt: z.int().positive(),
});

export const sessionErrorSchema = z.enum(["RefreshTokenError"]);

/** Dados públicos serializados pela sessão Auth.js; tokens não fazem parte dela. */
export const nextAuthSessionUserSchema = authenticatedUserSchema.pick({
  id: true,
  name: true,
  email: true,
  role: true,
  tenantId: true,
});

export const nextAuthSessionSchema = z.object({
  user: nextAuthSessionUserSchema,
  error: sessionErrorSchema.optional(),
});

/** Campos próprios persistidos no JWT httpOnly do Auth.js. */
export const nextAuthJwtSchema = z.object({
  accessToken: authTokensSchema.shape.accessToken.optional(),
  refreshToken: authTokensSchema.shape.refreshToken.optional(),
  accessTokenExpiresAt: z.int().positive().optional(),
  tenantId: authenticatedUserSchema.shape.tenantId.optional(),
  role: authRoleSchema.optional(),
  error: sessionErrorSchema.optional(),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type AuthenticatedUser = z.infer<typeof authenticatedUserSchema>;
export type NextAuthUser = z.infer<typeof nextAuthUserSchema>;
export type NextAuthSession = z.infer<typeof nextAuthSessionSchema>;
export type NextAuthJwt = z.infer<typeof nextAuthJwtSchema>;
