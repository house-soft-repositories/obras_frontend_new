import { NextRequest, NextResponse } from "next/server";
import { montarUrl } from "@/lib/api/client";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/auth/session";

/** Renova o access token a partir do refresh token (cookie httpOnly). */
export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get(COOKIE_REFRESH)?.value;
  if (!refreshToken) {
    return NextResponse.json({ erro: "Sem sessao" }, { status: 401 });
  }

  const resposta = await fetch(montarUrl("/auth/refresh"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!resposta.ok) {
    const res = NextResponse.json({ erro: "Sessao expirada" }, { status: 401 });
    res.cookies.delete(COOKIE_ACCESS);
    res.cookies.delete(COOKIE_REFRESH);
    return res;
  }

  const tokens = (await resposta.json()) as { accessToken: string };
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_ACCESS, tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
