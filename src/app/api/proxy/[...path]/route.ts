import { NextRequest, NextResponse } from "next/server";
import { montarUrl } from "@/lib/api/client";
import {
  obterTokenBackend,
  limparTokenBackend,
  persistirTokenBackend,
  renovarTokenBackend,
} from "@/lib/auth/backend-token";

type Ctx = { params: Promise<{ path: string[] }> };

async function chamarBackend(
  url: string,
  metodo: string,
  token: string,
  body: string | undefined,
) {
  return fetch(url, {
    method: metodo,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body,
    cache: "no-store",
  });
}

async function encaminhar(req: NextRequest, ctx: Ctx): Promise<NextResponse> {
  const token = await obterTokenBackend(req);
  if (!token?.accessToken || token.error) {
    const res = NextResponse.json({ erro: "Sem sessão" }, { status: 401 });
    if (token?.error) limparTokenBackend(res);
    return res;
  }

  const { path } = await ctx.params;
  const metodo = req.method.toUpperCase();
  const body =
    metodo === "GET" || metodo === "HEAD" ? undefined : await req.text();
  const url = montarUrl(`/api/${path.join("/")}`) + req.nextUrl.search;
  let resposta = await chamarBackend(url, metodo, token.accessToken, body);
  let tokenAtualizado = null;

  if (resposta.status === 401) {
    tokenAtualizado = await renovarTokenBackend(token);
    if (tokenAtualizado?.accessToken) {
      resposta = await chamarBackend(
        url,
        metodo,
        tokenAtualizado.accessToken,
        body,
      );
    }
  }

  const semCorpo = [204, 205, 304].includes(resposta.status);
  const res = new NextResponse(semCorpo ? null : await resposta.text(), {
    status: resposta.status,
    headers: {
      "content-type":
        resposta.headers.get("content-type") ?? "application/json",
    },
  });
  if (tokenAtualizado) {
    await persistirTokenBackend(res, tokenAtualizado);
  } else if (resposta.status === 401) {
    limparTokenBackend(res);
  }
  return res;
}

export const GET = encaminhar;
export const POST = encaminhar;
export const PATCH = encaminhar;
export const DELETE = encaminhar;
