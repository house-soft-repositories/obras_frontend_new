import { findRoute, routes } from "@/core/config/routes";
import { auth } from "@/core/config/auth_options";
import type { Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const REDIRECT_WHEN_NOT_AUTHENTICATED = "/login";
const REDIRECT_WHEN_NOT_PERMISSION = "/";

type RequestWithAuth = NextRequest & { auth: Session | null };

async function handleProxy(request: RequestWithAuth) {
  const path = request.nextUrl.pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-obras-current-path",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  const currentRoute = findRoute(routes, path);
  // A sessão vem do wrapper `auth()` (não de `getToken`): além de
  // descriptografar o cookie, ele executa o callback `jwt` — que tenta o
  // refresh do access expirado e marca `error: "RefreshTokenError"` quando o
  // refresh é rejeitado — e carrega o cookie atualizado na resposta (ver
  // `handleAuth` no Auth.js). Com `getToken` puro, o cookie morto nunca era
  // remarcado aqui no edge: o proxy via sempre o JWT antigo sem `error`,
  // tratava a sessão morta como válida (/login → /) e o SSR marcava o erro
  // sem conseguir persistir o cookie — loop infinito de redirect.
  const session = request.auth ?? null;

  // Sessão marcada com erro pelo callback jwt (ex.: RefreshTokenError após o
  // backend devolver AUTH_INVALID_REFRESH_TOKEN): equivale a deslogado. Faz o
  // logout aqui — apaga o cookie de sessão na resposta — além de redirecionar
  // ao login com ?next=. Sem apagar o cookie, o token morto faria este proxy
  // mandar o usuário de volta para "/" e o app entraria em loop de redirect.
  const sessionError = session?.error;
  if (session && typeof sessionError === "string" && sessionError) {
    return redirectExpiredSession(request);
  }

  if (
    session &&
    currentRoute?.roles === null &&
    currentRoute.whenAuthenticated === "redirect"
  ) {
    return redirectUserForNotPermission(request);
  }

  if (
    session &&
    currentRoute?.roles === null &&
    currentRoute.whenAuthenticated === "allow"
  ) {
    return nextWithCurrentPath();
  }

  // if (session && Array.isArray(currentRoute?.roles)) {
  //   const hasPermission = currentRoute?.roles?.includes(session.user.role);
  //   if (hasPermission) {
  //     return NextResponse.next();
  //   }
  //   return redirectUserForNotPermission(request);
  // }

  if (!session && Array.isArray(currentRoute?.roles)) {
    return redirectUserNotAuthenticated(request);
  }

  if (!session && currentRoute?.roles === null) {
    return nextWithCurrentPath();
  }

  // Deny-by-default (V-09): uma rota não registrada exige autenticação. Um usuário
  // autenticado navega normalmente (a autorização fina fica nas páginas); um
  // usuário não autenticado é redirecionado ao login em vez de liberado.
  if (!currentRoute && !session) {
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
    // A raiz (/) redireciona a si mesma para /home e ignora query: preservar o
    // ?next= aqui gerava /?next=/home e ?next= aninhado a cada volta do loop.
    redirectUrl.search = "";
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
    const nomes = ["authjs.session-token", "__Secure-authjs.session-token"];
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

// O wrapper `auth()` executa o callback `jwt` no edge e anexa à resposta o
// cookie de sessão atualizado (refresh bem-sucedido ou marcação de erro).
// Sem ele, o JWT remarcado com erro nunca chegava ao navegador pela navegação
// (o SSR marca em memória mas não pode persistir cookies) e o proxy, lendo o
// cookie velho sem `error`, entrava em loop. Ver `handleAuth` no Auth.js.
export const proxy = auth((request) => handleProxy(request));

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
