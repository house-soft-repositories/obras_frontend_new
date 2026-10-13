import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import HttpClientException from "@/core/exceptions/http_client_exception";

type SessaoResumida = { error?: unknown; user?: unknown } | null;

const hoisted = vi.hoisted(() => ({
  authMock: { current: null as unknown as Mock<() => Promise<SessaoResumida>> },
  redirectMock: { current: null as ((url: string) => never) | null },
  currentPath: { current: "/obras/123" as string | null },
}));

vi.mock("server-only", () => ({}));

vi.mock("@/core/config/enviroment_variables", () => ({
  env: {
    NEXT_API_URL: "http://api.test",
    NEXTAUTH_URL: "http://localhost:3001",
    NEXT_AUTH_SECRET: "segredo-de-teste-com-32-chars!!",
  },
  getEnv: () => ({
    NEXT_API_URL: "http://api.test",
    NEXTAUTH_URL: "http://localhost:3001",
    NEXT_AUTH_SECRET: "segredo-de-teste-com-32-chars!!",
  }),
}));

vi.mock("next-auth", () => {
  class CredentialsSignin extends Error {
    code?: string;
  }
  const authMock = vi.fn();
  hoisted.authMock.current = authMock;
  return {
    default: vi.fn(() => ({
      handlers: {},
      auth: authMock,
      signIn: vi.fn(),
      signOut: vi.fn(),
      unstable_update: vi.fn(),
    })),
    CredentialsSignin,
  };
});

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((options: unknown) => options),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => {
    const path = hoisted.currentPath.current;
    return {
      get: (nome: string) => (nome === "x-obras-current-path" ? path : null),
    };
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    hoisted.redirectMock.current?.(url);
    throw Object.assign(new Error(`NEXT_REDIRECT ${url}`), {
      digest: `NEXT_REDIRECT;replace;${url};307;`,
    });
  }),
}));

const { AuthExpiredInterceptor } =
  await import("@/core/rest_client/interceptors/auth_expired_interceptor");
// Executa a cadeia de imports uma vez (interceptor → auth_options → next-auth)
// para que o mock de `auth()` exista antes dos testes — o import dinâmico
// dentro de `hasSessionErrorSafe` reaproveita o módulo já carregado.
await import("@/core/config/auth_options");
const { redirect } = await import("next/navigation");

const redirectMock = vi.mocked(redirect);

function erro401(message: string, data?: unknown) {
  return new HttpClientException(message, 401, data);
}

describe("AuthExpiredInterceptor — redirect só com sessão em erro", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    hoisted.authMock.current.mockReset();
    hoisted.currentPath.current = "/obras/123";
  });

  it("401 AUTH_INVALID_REFRESH_TOKEN + sessão em erro: redireciona ao /login com ?next=", async () => {
    hoisted.authMock.current.mockResolvedValue({ error: "RefreshTokenError" });

    await expect(
      new AuthExpiredInterceptor().error(erro401("AUTH_INVALID_REFRESH_TOKEN")),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/login?next=%2Fobras%2F123");
  });

  it("regressão do loop: 401 Unauthorized + sessão VÁLIDA não redireciona", async () => {
    // JWT do NextAuth válido mas access rejeitado pelo backend (ex.: revogado
    // com `exp` ainda futuro). Redirecionar aqui mandava ao /login e o proxy,
    // vendo o cookie válido, devolvia para "/" em loop — por isso o erro
    // propaga e a Server Action retorna `{ success: false }`.
    hoisted.authMock.current.mockResolvedValue({
      user: { id: "user-1" },
    });
    const erro = erro401("Unauthorized");

    const resultado = await new AuthExpiredInterceptor().error(erro);

    expect(resultado).toBe(erro);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("401 de outro domínio (ex.: TENANT_CONTEXT_REQUIRED): não redireciona", async () => {
    hoisted.authMock.current.mockResolvedValue({
      user: { id: "user-1" },
    });
    const erro = erro401("TENANT_CONTEXT_REQUIRED");

    const resultado = await new AuthExpiredInterceptor().error(erro);

    expect(resultado).toBe(erro);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("erro não-401 passa direto sem consultar a sessão", async () => {
    const erro = new HttpClientException("Erro interno", 500);

    const resultado = await new AuthExpiredInterceptor().error(erro);

    expect(resultado).toBe(erro);
    expect(hoisted.authMock.current).not.toHaveBeenCalled();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
