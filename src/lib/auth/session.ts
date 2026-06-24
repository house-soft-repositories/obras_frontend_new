import { cookies } from "next/headers";

export const COOKIE_ACCESS = "obras_access";
export const COOKIE_REFRESH = "obras_refresh";

export interface Sessao {
  accessToken: string;
}

/** Le a sessao atual (server-side) a partir do cookie httpOnly. */
export async function obterSessao(): Promise<Sessao | null> {
  const jar = await cookies();
  const accessToken = jar.get(COOKIE_ACCESS)?.value;
  return accessToken ? { accessToken } : null;
}
