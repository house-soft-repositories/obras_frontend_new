import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { Interceptor, RequestConfig } from "@/core/types/http_client";

const COOKIE_SESSAO =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

/**
 * Injeta o access token armazenado no JWT httpOnly do NextAuth.
 *
 * No navegador os cookies não são legíveis; nessas situações, as chamadas
 * protegidas devem passar pelo `/api/proxy`, que injeta o mesmo header.
 */
export class AuthInterceptor implements Interceptor {
  async request(config: RequestConfig): Promise<RequestConfig> {
    if (config.extra?.AUTH_REQUIRED === false) return config;

    const accessToken = await this.obterAccessToken();
    if (!accessToken) return config;

    const headers = new Headers(config.headers);
    if (!headers.has("authorization")) {
      headers.set("authorization", `Bearer ${accessToken}`);
    }

    return { ...config, headers };
  }

  private async obterAccessToken(): Promise<string | undefined> {
    try {
      const jar = await cookies();
      const todos = jar.getAll();
      const req = {
        cookies: Object.fromEntries(
          todos.map((cookie) => [cookie.name, cookie.value]),
        ),
        headers: {
          cookie: todos
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; "),
        },
      };
      const token = await getToken({
        req: req as never,
        secret: process.env.NEXT_AUTH_SECRET,
        salt: COOKIE_SESSAO,
      });

      return typeof token?.accessToken === "string"
        ? token.accessToken
        : undefined;
    } catch {
      return undefined;
    }
  }
}
