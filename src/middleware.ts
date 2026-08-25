import { NextRequest, NextResponse } from "next/server";
import { COOKIE_ACCESS } from "@/lib/auth/session";

/**
 * Protege as rotas autenticadas. Sem sessao VALIDA, redireciona para /login
 * preservando o destino em ?from. As rotas publicas (/, /login) e a API de auth
 * nao sao afetadas.
 *
 * A validacao aqui checa a EXPIRACAO (claim `exp`) do access token, decodificando
 * o payload do JWT. A verificacao de ASSINATURA continua sendo responsabilidade do
 * backend (o segredo nao vive no frontend) — este check apenas evita que um cookie
 * expirado/forjado conceda acesso ao shell da aplicacao.
 */
export function middleware(req: NextRequest) {
  const token = req.cookies.get(COOKIE_ACCESS)?.value;

  if (!token || jwtExpirado(token)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", req.nextUrl.pathname);
    const res = NextResponse.redirect(url);
    // Limpa um cookie expirado/invalido para nao reincidir no proximo request.
    if (token) res.cookies.delete(COOKIE_ACCESS);
    return res;
  }
  return NextResponse.next();
}

/**
 * Decodifica o payload do JWT (sem verificar assinatura) e retorna `true` se o
 * token estiver expirado, sem claim `exp`, ou malformado. Edge-runtime-safe:
 * usa apenas `atob`/`JSON` (sem dependencias de Node).
 */
function jwtExpirado(token: string): boolean {
  try {
    const payloadB64 = token.split(".")[1];
    if (!payloadB64) return true;
    const b64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: number };
    if (typeof payload.exp !== "number") return true;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export const config = {
  matcher: [
    "/home",
    "/dashboard",
    "/obras",
    "/obras/:path*",
    "/obras-privadas",
    "/obras-privadas/:path*",
    "/relatorios/:path*",
    "/admin/:path*",
    "/cadastros/:path*",
  ],
};
