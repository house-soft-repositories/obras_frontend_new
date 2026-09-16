import "server-only";

import { cookies, headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import { auth } from "@/core/config/auth_options";
import { AuthTokens, authTokensSchema } from "@/core/schemas/auth/auth_tokens";
import { resolverCookieSessao } from "@/core/config/auth_cookie";
import { env } from "@/core/config/enviroment_variables";

export async function obterTokensDaSessao(): Promise<AuthTokens | null> {
  const session = await auth();

  if (!session?.user || session.error) return null;

  const cookieSessao = resolverCookieSessao(
    env.NEXTAUTH_URL,
    (await headers()).get("x-forwarded-proto"),
  );

  const token = await getToken({
    req: { headers: { cookie: (await cookies()).toString() } } as never,
    secret: env.NEXT_AUTH_SECRET,
    salt: cookieSessao.nome,
    secureCookie: cookieSessao.seguro,
  });

  const tokens = authTokensSchema.safeParse(token);

  if (!tokens.success) {
    return null;
  }

  return tokens.data;
}

export async function obterAccessTokenDaSessao(): Promise<string | undefined> {
  const tokens = await obterTokensDaSessao();
  return tokens?.accessToken;
}
