import { NextRequest, NextResponse } from "next/server";
import { montarUrl } from "@/lib/api/client";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/auth/session";

interface CorpoLogin {
  email: string;
  senha: string;
  tenantSlug?: string;
}

export async function POST(req: NextRequest) {
  const { email, senha, tenantSlug } = (await req.json()) as CorpoLogin;

  const resposta = await fetch(montarUrl("/auth/login"), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(tenantSlug ? { "x-tenant-slug": tenantSlug } : {}),
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!resposta.ok) {
    return NextResponse.json(
      { erro: "Credenciais invalidas" },
      { status: 401 },
    );
  }

  const tokens = (await resposta.json()) as {
    accessToken: string;
    refreshToken: string;
  };
  const res = NextResponse.json({ ok: true });
  const opcoes = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
  res.cookies.set(COOKIE_ACCESS, tokens.accessToken, opcoes);
  res.cookies.set(COOKIE_REFRESH, tokens.refreshToken, opcoes);
  return res;
}
