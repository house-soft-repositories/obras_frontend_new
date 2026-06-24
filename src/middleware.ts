import { NextRequest, NextResponse } from "next/server";
import { COOKIE_ACCESS } from "@/lib/auth/session";

/**
 * Protege as rotas de aplicacao (/home, /admin, /cadastros): sem sessao,
 * redireciona para /login preservando o destino em ?from. As rotas publicas
 * (/, /login) e de API de auth nao sao afetadas.
 */
export function middleware(req: NextRequest) {
  const possuiSessao = Boolean(req.cookies.get(COOKIE_ACCESS)?.value);
  if (!possuiSessao) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/home", "/admin/:path*", "/cadastros/:path*"],
};
