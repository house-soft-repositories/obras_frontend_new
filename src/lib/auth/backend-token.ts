import type { NextRequest, NextResponse } from "next/server";
import { encode, getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import api from "@/core/rest_client/api";

const COOKIE_SESSAO =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";
const DURACAO_SESSAO_SEGUNDOS = 30 * 24 * 60 * 60;

function segredoAuth() {
  const segredo = process.env.NEXT_AUTH_SECRET;
  if (!segredo) throw new Error("NEXT_AUTH_SECRET não configurado");
  return segredo;
}

export async function obterTokenBackend(req: NextRequest): Promise<JWT | null> {
  return getToken({ req, secret: segredoAuth(), salt: COOKIE_SESSAO });
}

export async function renovarTokenBackend(token: JWT): Promise<JWT | null> {
  if (!token.refreshToken) return null;
  try {
    const resposta = await api.unauth.post<{
      accessToken: string;
      refreshToken: string;
    }>("/api/auth/refresh", {
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    const tokens = resposta.data;
    if (!tokens.accessToken || !tokens.refreshToken) return null;

    return {
      ...token,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: lerExpiracao(tokens.accessToken),
      error: undefined,
    };
  } catch {
    return null;
  }
}

/** Remove a sessão quando o refresh é recusado pelo backend. */
export function limparTokenBackend(res: NextResponse) {
  res.cookies.set(COOKIE_SESSAO, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function persistirTokenBackend(res: NextResponse, token: JWT) {
  const valor = await encode({
    token,
    secret: segredoAuth(),
    salt: COOKIE_SESSAO,
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  });
  res.cookies.set(COOKIE_SESSAO, valor, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DURACAO_SESSAO_SEGUNDOS,
  });
}

/** Lê a expiração de um access token para manter o JWT do Auth.js sincronizado. */
export function lerExpiracao(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return undefined;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const { exp } = JSON.parse(atob(padded)) as { exp?: number };
    return typeof exp === "number" ? exp * 1000 : undefined;
  } catch {
    return undefined;
  }
}
