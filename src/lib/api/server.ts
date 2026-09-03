import { auth } from "@/core/config/auth_options";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import {
  obterTokenBackend,
  renovarTokenBackend,
} from "@/lib/auth/backend-token";
import { montarUrl } from "./client";

/** Fetch autenticado server-side: injeta o access token (cookie httpOnly). */
export async function apiServerFetch<T>(
  caminho: string,
  init?: RequestInit,
): Promise<T> {
  const session = await auth();
  if (!session?.user) throw new Error("Sessão ausente");
  const jar = await cookies();
  const req = new NextRequest("http://localhost", {
    headers: { cookie: jar.toString() },
  });
  let token = await obterTokenBackend(req);
  if (token?.accessTokenExpiresAt && Date.now() >= token.accessTokenExpiresAt) {
    token = await renovarTokenBackend(token);
  }
  if (!token?.accessToken) throw new Error("Access token ausente");
  const resposta = await fetch(montarUrl(caminho), {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token.accessToken}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!resposta.ok) {
    throw new Error(`API ${resposta.status} em ${caminho}`);
  }
  return (await resposta.json()) as T;
}
