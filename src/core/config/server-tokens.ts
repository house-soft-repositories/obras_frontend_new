import "server-only";

import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { auth } from "@/core/config/auth_options";
import { AuthTokens, authTokensSchema } from "@/core/schemas/auth/auth_tokens";
import { env } from "@/core/config/enviroment_variables";

const COOKIE_SESSAO =
  env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";




export async function obterTokensDaSessao(): Promise<AuthTokens | null> {
  const session = await auth();

  if (!session?.user || session.error) return null;

  const token = await getToken({
    req: { headers: { cookie: (await cookies()).toString() } } as never,
    secret: process.env.NEXT_AUTH_SECRET,
    salt: COOKIE_SESSAO,
    secureCookie: process.env.NODE_ENV === "production",
  });


  const tokens =  authTokensSchema.safeParse(token);

  if (!tokens.success) {
    return null;
  }

 

  return tokens.data;
}

export async function obterAccessTokenDaSessao(): Promise<string | undefined> {
  const tokens = await obterTokensDaSessao();
  return tokens?.accessToken;
}
