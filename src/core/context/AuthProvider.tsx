"use client";

import { Session } from "next-auth";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

// Quando o refresh token vence/é rejeitado, o callback jwt marca a sessão com
// RefreshTokenError. Sem isso, o app seguiria enviando um access token
// morto em toda chamada SSR (401 "Jwt Is invalid") até logout manual.
function SessionErrorWatchdog() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === "RefreshTokenError") {
      signOut({ callbackUrl: "/login" });
    }
  }, [session?.error]);

  return null;
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
