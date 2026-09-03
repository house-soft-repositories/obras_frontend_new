import type { PerfilUsuario } from "@/lib/api/contratos";

/**
 * A sessão Auth.js não expõe access tokens ao cliente. O perfil continua sendo
 * responsabilidade do backend; enquanto /auth/me não for usado por esta
 * função, a UI mantém comportamento conservador e o backend responde 403.
 */
export async function obterPerfilAtual(): Promise<PerfilUsuario | null> {
  return null;
}
