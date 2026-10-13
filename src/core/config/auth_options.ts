import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { CredentialsSignin } from "next-auth";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import HttpClientException from "@/core/exceptions/http_client_exception";
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
import { env } from "@/core/config/enviroment_variables";

interface CredenciaisRenovadas {
  tokens: AuthTokens;
  payload: AccessTokenPayload;
  usuario: AuthenticatedUser;
}

const switchTenancyResponseSchema = authTokensSchema.extend({
  tenancy: authenticatedUserSchema.shape.tenant.unwrap(),
});

// Margem para renovar o access antes do vencimento real: o backend faz rotação
// single-use do refresh (revoga a sessão antiga ao emitir a nova), então
// renovar exatamente no limite do `exp` faz requisições SSR concorrentes
// disputarem o mesmo refresh e a perdedora recebe AUTH_INVALID_REFRESH_TOKEN.
const SKEW_RENOVACAO_MS = 60_000;


class AuthCredentialsError extends CredentialsSignin {
  code: string;

  constructor(code: string) {
    super();
    this.code = code;
  }
}

type AuthCallbacks = NonNullable<NextAuthConfig["callbacks"]>;
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

function extrairMensagemErroAutenticacao(error: unknown): string {
  if (error instanceof AuthCredentialsError) return error.code;

  if (error instanceof HttpClientException) {
    const data = error.data;
    if (typeof data === "object" && data !== null) {
      const message = "message" in data ? data.message : undefined;
      if (typeof message === "string" && message.trim()) return message.trim();
    }

    const message = error.message?.trim();
    if (message) return message;
  }

  return "AUTH_INVALID_CREDENTIALS";
}

async function buscarUsuario(accessToken: string): Promise<AuthenticatedUser> {
  const resposta = await fetchSemInterceptors("/api/auth/me", {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  return authenticatedUserSchema.parse(resposta);
}

async function renovarCredenciais(
  refreshToken: string,
): Promise<CredenciaisRenovadas> {
  const data = await fetchSemInterceptors("/api/auth/refresh", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const tokens = authTokensSchema.parse(data);
  const payload = validarPayloadAccess(tokens.accessToken);
  if (!payload) {
    throw new Error("Access token inválido no refresh");
  }

  return { tokens, payload, usuario: await buscarUsuario(tokens.accessToken) };
}

// Chamadas internas do NextAuth (login/refresh/switch-tenancy) usam `fetch`
// direto em vez de `api.unauth`: o HttpClient carrega o
// AuthExpiredInterceptor, que chama `redirect()` em 401 de sessão expirada.
// Dentro do callback `jwt` isso dispararia NEXT_REDIRECT no meio do refresh —
// a origem do loop de redirects quando o access expira. Aqui queremos o erro
// puro (HttpClientException) para marcar a sessão com RefreshTokenError; o
// redirect para /login fica com o interceptor das chamadas de página (que já
// roda fora do `jwt`) e com o proxy, que limpa o cookie.
async function fetchSemInterceptors(
  path: string,
  init?: RequestInit,
): Promise<unknown> {
  const resposta = await fetch(`${env.NEXT_API_URL}${path}`, init);

  let data: unknown = null;
  try {
    data = await resposta.json();
  } catch {
    data = null;
  }

  if (!resposta.ok) {
    const rawMessage =
      typeof data === "object" && data !== null && "message" in data
        ? (data as { message?: unknown }).message
        : undefined;
    const code =
      typeof data === "object" &&
      data !== null &&
      "code" in data &&
      typeof (data as { code?: unknown }).code === "string"
        ? (data as { code: string }).code
        : undefined;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : typeof rawMessage === "string"
        ? rawMessage
        : "Request failed";
    throw new HttpClientException(code ?? message, resposta.status, data);
  }

  return data;
}

function relancarRedirectSeNecessario(error: unknown): void {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? (error as { digest?: unknown }).digest
      : undefined;
  if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) {
    throw error;
  }
}

// Refresh inválido (backend: 401 AUTH_INVALID_REFRESH_TOKEN — JWT vencido,
// sessão revogada ou hash divergente) equivale a logout: limpa os tokens do
// JWT do NextAuth em vez de manter o access morto. Manter o token morto faria
// as chamadas SSR seguintes saírem com 401 "Unauthorized", o interceptor
// mandaria para /login e o proxy (que vê o cookie ainda válido) devolveria
// para "/" em loop.
function marcarSessaoComoExpirada(token: JWT): JWT {
  return {
    ...token,
    accessToken: undefined,
    refreshToken: undefined,
    accessTokenExpiresAt: undefined,
    error: "RefreshTokenError",
  };
}

async function renovarToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) return marcarSessaoComoExpirada(token);

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
      tenant: usuario.tenant,
      role: usuario.role,
      error: undefined,
    };
  } catch (error) {
    relancarRedirectSeNecessario(error);
    return marcarSessaoComoExpirada(token);
  }
}

async function trocarTenancyNoBackend(
  token: JWT,
  tenantId: string,
): Promise<JWT> {
  if (!token.accessToken) return marcarSessaoComoExpirada(token);

  try {
    const data = await fetchSemInterceptors("/api/auth/switch-tenancy", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({ tenantId }),
    });
    const parsed = switchTenancyResponseSchema.parse(data);
    const payload = validarPayloadAccess(parsed.accessToken);
    if (!payload) {
      throw new Error("Access token inválido no switch de tenancy");
    }

    if (token.sub && token.sub !== payload.sub) {
      return marcarSessaoComoExpirada(token);
    }

    return {
      ...token,
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      accessTokenExpiresAt: payload.exp * 1000,
      sub: payload.sub,
      tenant: parsed.tenancy,
      error: undefined,
    };
  } catch (error) {
    relancarRedirectSeNecessario(error);
    return marcarSessaoComoExpirada(token);
  }
}

export const { handlers, auth, signIn, signOut, unstable_update: updateSession } = NextAuth({
  secret: env.NEXT_AUTH_SECRET,
  trustHost: true,
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
          throw new AuthCredentialsError("AUTH_REQUIRED_FIELDS");
        }

        try {
          const data = await fetchSemInterceptors("/api/auth/login", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const tokens = authTokensSchema.safeParse(data);

          if (!tokens.success) {
            throw new AuthCredentialsError("AUTH_INVALID_CREDENTIALS");
          }

          let credenciais = tokens.data;

          let payload = validarPayloadAccess(credenciais.accessToken);

          if (!payload) {
            throw new AuthCredentialsError("AUTH_INVALID_CREDENTIALS");
          }

          let usuario: AuthenticatedUser;
          try {
            usuario = await buscarUsuario(credenciais.accessToken);
          } catch (erro) {
            if (
              !(erro instanceof HttpClientException) ||
              erro.statusCode !== 401
            ) {
              throw new AuthCredentialsError(
                extrairMensagemErroAutenticacao(erro),
              );
            }
            const renovadas = await renovarCredenciais(
              credenciais.refreshToken,
            );
            credenciais = renovadas.tokens;
            payload = renovadas.payload;
            usuario = renovadas.usuario;
          }

          if (usuario.id !== payload.sub) {
            throw new AuthCredentialsError("AUTH_INVALID_CREDENTIALS");
          }
          return {
            id: usuario.id,
            name: usuario.name,
            email: usuario.email,
            createdAt: usuario.createdAt,
            updatedAt: usuario.updatedAt,
            accessToken: credenciais.accessToken,
            refreshToken: credenciais.refreshToken,
            accessTokenExpiresAt: payload.exp * 1000,
            tenant: usuario.tenant,
            role: usuario.role,
          };
        } catch (error) {
          relancarRedirectSeNecessario(error);
          throw new AuthCredentialsError(
            extrairMensagemErroAutenticacao(error),
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: JwtCallbackParams & {
      trigger?: "update" | "signIn" | "signUp";
      session?: {
        accessToken?: string;
        refreshToken?: string;
        accessTokenExpiresAt?: number;
        tenant?: { id: string; name: string; slug: string } | null;
        tenantId?: string;
      };
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
          tenant: user.tenant,
          role: user.role,
        };
      }
      if (
        trigger === "update" &&
        typeof session?.accessToken === "string" &&
        typeof session.refreshToken === "string" &&
        typeof session.accessTokenExpiresAt === "number"
      ) {
        return {
          ...token,
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          accessTokenExpiresAt: session.accessTokenExpiresAt,
          tenant: session.tenant ?? null,
          error: undefined,
        };
      }
      const tenantId = session?.tenant?.id ?? session?.tenantId;
      if (trigger === "update" && typeof tenantId === "string") {
        return trocarTenancyNoBackend(token, tenantId);
      }
      if (
        token.accessToken &&
        typeof token.accessTokenExpiresAt === "number" &&
        Date.now() < token.accessTokenExpiresAt - SKEW_RENOVACAO_MS
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
          tenant: token.tenant ?? null,
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
