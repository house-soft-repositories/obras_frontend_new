import { cookies } from "next/headers";
import type { PerfilUsuario } from "@/lib/api/contratos";
import { COOKIE_ACCESS } from "./session";

/** Decodifica o payload (base64url) de um JWT sem validar a assinatura. */
function decodificarPayload(token: string): Record<string, unknown> | null {
  const parte = token.split(".")[1];
  if (!parte) return null;
  try {
    const json = Buffer.from(parte, "base64url").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Le o perfil de RBAC do usuario atual a partir do access token (cookie
 * httpOnly), quando o backend o expoe como claim. Hoje o JWT nao carrega o
 * perfil, entao o retorno e null e o front assume escrita (o backend valida o
 * escopo e responde 403 quando indevido). Centralizar aqui mantem o RBAC do
 * front pronto para quando a claim existir, sem espalhar decode por paginas.
 */
export async function obterPerfilAtual(): Promise<PerfilUsuario | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_ACCESS)?.value;
  if (!token) return null;
  const payload = decodificarPayload(token);
  const perfil = payload?.["perfil"];
  return typeof perfil === "string" ? (perfil as PerfilUsuario) : null;
}
