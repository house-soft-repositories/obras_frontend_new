"use client";

import { Session } from "next-auth";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

// Quando o refresh token vence/é rejeitado (backend: AUTH_INVALID_REFRESH_TOKEN),
// o callback jwt marca a sessão com RefreshTokenError. Sem isso, o app seguiria
// enviando um access token morto em toda chamada SSR (401 "Jwt Is invalid")
// até logout manual. A URL atual é preservada em ?next= para que o login
// redirecione o usuário de volta (mesmo padrão do TENANT_CONTEXT_REQUIRED).
function SessionErrorWatchdog() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      const nextPath = getSafeNextPath(
        `${window.location.pathname}${window.location.search}`,
      );
      signOut({
        callbackUrl: nextPath
          ? `/login?next=${encodeURIComponent(nextPath)}`
          : "/login",
      });
    }
  }, [session?.error]);

  return null;
}

function getSafeNextPath(path: string | null): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  if (path === "/login" || path.startsWith("/login?")) {
    return null;
  }

  return path;
}

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <SessionErrorWatchdog />
      {children}
    </SessionProvider>
  );
}
