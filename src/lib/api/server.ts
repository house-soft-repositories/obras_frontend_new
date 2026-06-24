import { cookies } from "next/headers";
import { COOKIE_ACCESS } from "@/lib/auth/session";
import { montarUrl } from "./client";

/** Fetch autenticado server-side: injeta o access token (cookie httpOnly). */
export async function apiServerFetch<T>(
  caminho: string,
  init?: RequestInit,
): Promise<T> {
  const jar = await cookies();
  const token = jar.get(COOKIE_ACCESS)?.value;
  const resposta = await fetch(montarUrl(caminho), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!resposta.ok) {
    throw new Error(`API ${resposta.status} em ${caminho}`);
  }
  return (await resposta.json()) as T;
}
