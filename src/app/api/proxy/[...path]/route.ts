import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { montarUrl } from "@/lib/api/client";
import { COOKIE_ACCESS, COOKIE_REFRESH } from "@/lib/auth/session";

type Ctx = { params: Promise<{ path: string[] }> };

const OPCOES_COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
};

async function chamarBackend(
  url: string,
  metodo: string,
  token: string | undefined,
  body: string | undefined,
): Promise<Response> {
  return fetch(url, {
    method: metodo,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body,
    cache: "no-store",
  });
}

/** Tenta renovar o access token pelo refresh (cookie httpOnly). */
async function renovarAccess(
  refreshToken: string | undefined,
): Promise<string | null> {
  if (!refreshToken) return null;
  const r = await fetch(montarUrl("/auth/refresh"), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  if (!r.ok) return null;
  const tokens = (await r.json()) as { accessToken: string };
  return tokens.accessToken ?? null;
}

async function encaminhar(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  const jar = await cookies();
  const token = jar.get(COOKIE_ACCESS)?.value;
  const url = montarUrl(`/${path.join("/")}`) + req.nextUrl.search;
  const metodo = req.method.toUpperCase();
  const body =
    metodo === "GET" || metodo === "HEAD" ? undefined : await req.text();

  let resposta = await chamarBackend(url, metodo, token, body);
  let novoAccess: string | null = null;

  // Access token expirado: renova via refresh e repete a requisicao 1x.
  if (resposta.status === 401) {
    novoAccess = await renovarAccess(jar.get(COOKIE_REFRESH)?.value);
    if (novoAccess) {
      resposta = await chamarBackend(url, metodo, novoAccess, body);
    }
  }

  // Status 204/205/304 nao podem ter corpo — passar null evita o
  // "Invalid response status code" do construtor de Response (ex.: DELETE).
  const semCorpo =
    resposta.status === 204 ||
    resposta.status === 205 ||
    resposta.status === 304;
  const texto = semCorpo ? null : await resposta.text();
  const res = new NextResponse(texto, {
    status: resposta.status,
    headers: {
      "content-type":
        resposta.headers.get("content-type") ?? "application/json",
    },
  });
  if (novoAccess) {
    res.cookies.set(COOKIE_ACCESS, novoAccess, OPCOES_COOKIE);
  } else if (resposta.status === 401) {
    // Sem refresh valido: encerra a sessao (middleware leva ao /login depois).
    res.cookies.delete(COOKIE_ACCESS);
    res.cookies.delete(COOKIE_REFRESH);
  }
  return res;
}

export const GET = encaminhar;
export const POST = encaminhar;
export const PATCH = encaminhar;
export const DELETE = encaminhar;
