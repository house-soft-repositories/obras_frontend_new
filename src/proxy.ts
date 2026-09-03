import { findRoute, routes } from "@/core/config/routes";
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const REDIRECT_WHEN_NOT_AUTHENTICATED = "/login";
const REDIRECT_WHEN_NOT_PERMISSION = "/";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const currentRoute = findRoute(routes, path);
  const token = await getToken({
    req: request,
    secret: process.env.NEXT_AUTH_SECRET,
  });

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
    return NextResponse.next();
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
    return NextResponse.next();
  }

  // Deny-by-default (V-09): uma rota não registrada exige autenticação. Um usuário
  // autenticado navega normalmente (a autorização fina fica nas páginas); um
  // usuário não autenticado é redirecionado ao login em vez de liberado.
  if (!currentRoute && !token) {
    return redirectUserNotAuthenticated(request);
  }

  return NextResponse.next();

  function redirectUserNotAuthenticated(request: NextRequest) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED;
    return NextResponse.redirect(redirectUrl);
  }

  function redirectUserForNotPermission(request: NextRequest) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_PERMISSION;
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|public).*)"],
};
