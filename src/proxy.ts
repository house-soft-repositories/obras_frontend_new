import { findRoute, routes } from "@/core/config/routes";
import { resolverCookieSessao } from "@/core/config/auth_cookie";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/core/config/enviroment_variables";

const REDIRECT_WHEN_NOT_AUTHENTICATED = "/login";
const REDIRECT_WHEN_NOT_PERMISSION = "/";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-obras-current-path",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  const currentRoute = findRoute(routes, path);
  const cookieSessao = resolverCookieSessao(
    env.NEXTAUTH_URL,
    request.headers.get("x-forwarded-proto"),
  );
  const token = await getToken({
    req: request,
    secret: env.NEXT_AUTH_SECRET,
    salt: cookieSessao.nome,
    secureCookie: cookieSessao.seguro,
  });

  // Sessão marcada com erro pelo callback jwt (ex.: RefreshTokenError após o
  // backend devolver AUTH_INVALID_REFRESH_TOKEN): equivale a deslogado. Faz o
  // logout aqui — apaga o cookie de sessão na resposta — além de redirecionar
  // ao login com ?next=. Sem apagar o cookie, o token morto faria este proxy
  // mandar o usuário de volta para "/" e o app entraria em loop de redirect.
  const sessionError = (token as { error?: unknown } | null)?.error;
  if (token && typeof sessionError === "string" && sessionError) {
    return redirectExpiredSession(request);
  }

  if (
    token &&
    currentRoute?.roles === null &&
    currentRoute.whenAuthenticated === "redirect"
  ) {
    return redirectUserForNotPermission(request);
  }

  if (
    token &&
    currentRoute?.roles === null &&
    currentRoute.whenAuthenticated === "allow"
  ) {
    return nextWithCurrentPath();
  }

  // if (token && Array.isArray(currentRoute?.roles)) {
  //   const hasPermission = currentRoute?.roles?.includes(token.user.role);
  //   if (hasPermission) {
  //     return NextResponse.next();
  //   }
  //   return redirectUserForNotPermission(request);
  // }

  if (!token && Array.isArray(currentRoute?.roles)) {
    return redirectUserNotAuthenticated(request);
  }

  if (!token && currentRoute?.roles === null) {
    return nextWithCurrentPath();
  }

  // Deny-by-default (V-09): uma rota não registrada exige autenticação. Um usuário
  // autenticado navega normalmente (a autorização fina fica nas páginas); um
  // usuário não autenticado é redirecionado ao login em vez de liberado.
  if (!currentRoute && !token) {
    return redirectUserNotAuthenticated(request);
  }

  return nextWithCurrentPath();

  function nextWithCurrentPath() {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  function redirectUserNotAuthenticated(request: NextRequest) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED;
    const nextPath = getSafeNextPath(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    if (nextPath) {
      redirectUrl.search = `?next=${encodeURIComponent(nextPath)}`;
    } else {
      redirectUrl.search = "";
    }
    return NextResponse.redirect(redirectUrl);
  }

  function redirectUserForNotPermission(request: NextRequest) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_PERMISSION;
    return NextResponse.redirect(redirectUrl);
  }

  function redirectExpiredSession(request: NextRequest) {
    const onLoginPage =
      request.nextUrl.pathname === REDIRECT_WHEN_NOT_AUTHENTICATED;
    const response = onLoginPage
      ? nextWithCurrentPath()
      : redirectUserNotAuthenticated(request);
    clearSessionCookie(response);
    return response;
  }

  function clearSessionCookie(response: NextResponse) {
    // Expira nas duas variantes de nome (com e sem prefixo __Secure-) com
    // `path: "/"` explícito: `delete()` sozinho pode não cobrir o cookie
    // httpOnly emitido pelo Auth.js com Path=/, e o cookie morto faria este
    // proxy mandar o usuário de volta para "/" em loop de redirect. Cookies
    // com prefixo `__Secure-` também precisam sair com `Secure`, senão o
    // navegador ignora o Set-Cookie de expiração e mantém a sessão morta.
    const nomes = [
      cookieSessao.nome,
      "authjs.session-token",
      "__Secure-authjs.session-token",
    ];
    for (const nome of new Set(nomes)) {
      response.cookies.set(nome, "", {
        expires: new Date(0),
        path: "/",
        secure: nome.startsWith("__Secure-"),
      });
    }
  }

  function getSafeNextPath(path: string | null): string | null {
    if (!path || !path.startsWith("/") || path.startsWith("//")) {
      return null;
    }

    if (
      path === REDIRECT_WHEN_NOT_AUTHENTICATED ||
      path.startsWith(`${REDIRECT_WHEN_NOT_AUTHENTICATED}?`)
    ) {
      return null;
    }

    return path;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
