import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { montarUrl } from "@/lib/api/client";
import { COOKIE_ACCESS } from "@/lib/auth/session";

type Ctx = { params: Promise<{ path: string[] }> };

async function encaminhar(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const { path } = await ctx.params;
  const jar = await cookies();
  const token = jar.get(COOKIE_ACCESS)?.value;
  const url = montarUrl(`/${path.join("/")}`) + req.nextUrl.search;
  const metodo = req.method.toUpperCase();
  const body =
    metodo === "GET" || metodo === "HEAD" ? undefined : await req.text();

  const resposta = await fetch(url, {
    method: metodo,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body,
    cache: "no-store",
  });
  const texto = await resposta.text();
  return new NextResponse(texto, {
    status: resposta.status,
    headers: {
      "content-type":
        resposta.headers.get("content-type") ?? "application/json",
    },
  });
}

export const GET = encaminhar;
export const POST = encaminhar;
export const PATCH = encaminhar;
export const DELETE = encaminhar;
