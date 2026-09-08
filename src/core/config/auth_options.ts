import NextAuth from "next-auth";
import type { AuthConfig } from "@auth/core/types";
import Credentials from "next-auth/providers/credentials";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import HttpClientException from "@/core/exceptions/http_client_exception";
import api from "@/core/rest_client/api";
import {
  authTokensSchema,
  type AuthTokens,
} from "@/core/schemas/auth/auth_tokens";
import {
  accessTokenPayloadSchema,
  authenticatedUserSchema,
  nextAuthSessionSchema,
  type AccessTokenPayload,
  type AuthenticatedUser,
} from "@/core/schemas/auth/nextauth";

interface CredenciaisRenovadas {
  tokens: AuthTokens;
  payload: AccessTokenPayload;
  usuario: AuthenticatedUser;
}

type AuthCallbacks = NonNullable<AuthConfig["callbacks"]>;
type JwtCallback = NonNullable<AuthCallbacks["jwt"]>;
type SessionCallback = NonNullable<AuthCallbacks["session"]>;

type JwtCallbackParams = Parameters<JwtCallback>[0];
type JwtCallbackResult = Awaited<ReturnType<JwtCallback>>;

type SessionCallbackParams = Parameters<SessionCallback>[0];
type SessionCallbackResult = Awaited<ReturnType<SessionCallback>>;

function ehUsuarioCredenciais(user: JwtCallbackParams["user"]): user is User {
  return (
    user !== undefined &&
    "accessToken" in user &&
    "refreshToken" in user
  );
}

function validarPayloadAccess(token: string): AccessTokenPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const resultado = accessTokenPayloadSchema.safeParse(
      JSON.parse(atob(padded)),
    );
    return resultado.success ? resultado.data : null;
  } catch {
    return null;
  }
}

async function buscarUsuario(accessToken: string): Promise<AuthenticatedUser> {
  const resposta = await api.unauth.get<unknown>("/api/auth/me", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  return authenticatedUserSchema.parse(resposta.data);
}

async function renovarCredenciais(
  refreshToken: string,
): Promise<CredenciaisRenovadas> {
  const resposta = await api.unauth.post<unknown>("/api/auth/refresh", {
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const tokens = authTokensSchema.parse(resposta.data);
  const payload = validarPayloadAccess(tokens.accessToken);
  if (!payload) {
    throw new Error("Access token inválido no refresh");
  }

  return { tokens, payload, usuario: await buscarUsuario(tokens.accessToken) };
}

async function renovarToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) return { ...token, error: "RefreshTokenError" };

  try {
    const { tokens, payload, usuario } = await renovarCredenciais(
      token.refreshToken,
    );
    return {
      ...token,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: payload.exp * 1000,
      sub: usuario.id,
      name: usuario.name,
      email: usuario.email,
      tenantId: usuario.tenantId,
      role: usuario.role,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshTokenError" };
  }
}

async function trocarTenancyNoBackend(
  token: JWT,
  tenantId: string,
): Promise<JWT> {
  if (!token.accessToken) return { ...token, error: "RefreshTokenError" };

  try {
    const resposta = await api.auth.post<unknown>("/api/auth/switch-tenancy", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tenantId }),
    });
    const tokens = authTokensSchema.parse(resposta.data);
    const payload = validarPayloadAccess(tokens.accessToken);
    if (!payload) {
      throw new Error("Access token inválido no switch de tenancy");
    }

    const usuario = await buscarUsuario(tokens.accessToken);
    if (usuario.id !== payload.sub) return { ...token, error: "RefreshTokenError" };

    return {
      ...token,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: payload.exp * 1000,
      sub: usuario.id,
      name: usuario.name,
      email: usuario.email,
      tenantId: tenantId,
      role: usuario.role,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshTokenError" };
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXT_AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw Error("InvalidCredentials");
        }

        try {
          const resposta = await api.unauth.post<unknown>("/api/auth/login", {
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const tokens = authTokensSchema.safeParse(resposta.data);

          if (!tokens.success) return null;

          let credenciais = tokens.data;

          let payload = validarPayloadAccess(credenciais.accessToken);

          if (!payload) {
            return null;
          }

          let usuario: AuthenticatedUser;
          try {
            usuario = await buscarUsuario(credenciais.accessToken);
          } catch (erro) {
            if (
              !(erro instanceof HttpClientException) ||
              erro.statusCode !== 401
            ) {
              return null;
            }
            const renovadas = await renovarCredenciais(
              credenciais.refreshToken,
            );
            credenciais = renovadas.tokens;
            payload = renovadas.payload;
            usuario = renovadas.usuario;
          }

          if (usuario.id !== payload.sub) return null;
          return {
            id: usuario.id,
            name: usuario.name,
            email: usuario.email,
            createdAt: usuario.createdAt,
            updatedAt: usuario.updatedAt,
            accessToken: credenciais.accessToken,
            refreshToken: credenciais.refreshToken,
            accessTokenExpiresAt: payload.exp * 1000,
            tenantId: usuario.tenantId,
            role: usuario.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: JwtCallbackParams & {
      trigger?: "update" | "signIn" | "signUp";
      session?: { tenantId?: string };
    }): Promise<JwtCallbackResult> {
      if (ehUsuarioCredenciais(user)) {
        return {
          ...token,
          sub: user.id,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpiresAt: user.accessTokenExpiresAt,
          name: user.name,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
        };
      }
      if (trigger === "update" && typeof session?.tenantId === "string") {
        return trocarTenancyNoBackend(token, session.tenantId);
      }
      if (
        token.accessToken &&
        typeof token.accessTokenExpiresAt === "number" &&
        Date.now() < token.accessTokenExpiresAt
      ) {
        return token;
      }
      return renovarToken(token);
    },
    session({ session, token }: SessionCallbackParams): SessionCallbackResult {
      const sessaoValidada = nextAuthSessionSchema.safeParse({
        user: {
          id: token.sub ?? "",
          name: token.name ?? "",
          email: token.email ?? "",
          tenantId: token.tenantId ?? null,
          role: token.role ?? "USER",
        },
        ...(token.error ? { error: token.error } : {}),
      });
      if (!sessaoValidada.success) {
        session.error = "RefreshTokenError";
        return session;
      }

      session.user = { ...session.user, ...sessaoValidada.data.user };
      session.error = sessaoValidada.data.error;
      return session;
    },
  },
});
