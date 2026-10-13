import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CredentialsInput } from "@/core/schemas/auth/credentials";

type JwtArgs = {
  token: Record<string, unknown>;
  user?: unknown;
  trigger?: string;
  session?: unknown;
};

type CapturedConfig = {
  callbacks: { jwt: (args: JwtArgs) => Promise<Record<string, unknown>> };
  providers: Array<{
    // Mesma forma que o next-auth entrega ao `authorize` do provider
    // Credentials: não há DTO zod de login no repo (a página usa
    // `LoginFormData` com regras inline), então espelha a assinatura real.
    authorize: (
      credentials: Partial<Record<string, unknown>> | undefined,
    ) => Promise<Record<string, unknown>>;
  }>;
};

const hoisted = vi.hoisted(() => ({
  nextAuthConfig: { current: null as unknown as CapturedConfig | null },
  authMock: { current: null as unknown as ReturnType<typeof vi.fn> },
}));

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
    default: vi.fn((config: CapturedConfig) => {
      hoisted.nextAuthConfig.current = config;
      return {
        handlers: {},
        auth: authMock,
        signIn: vi.fn(),
        signOut: vi.fn(),
        unstable_update: vi.fn(),
      };
    }),
    CredentialsSignin,
  };
});

vi.mock("next-auth/providers/credentials", () => ({
  default: vi.fn((options: unknown) => ({
    id: "credentials",
    ...(options as Record<string, unknown>),
  })),
}));

// Importa depois dos mocks: executar o módulo registra o config no NextAuth.
await import("@/core/config/auth_options");

const SUB = "123e4567-e89b-12d3-a456-426614174000";

function montarAccessToken(sub: string, expSegundos: number): string {
  const payload = Buffer.from(
    JSON.stringify({ sub, exp: expSegundos, type: "access" }),
  ).toString("base64url");
  return `header.${payload}.assinatura`;
}

function montarUsuario() {
  return {
    id: SUB,
    name: "Usuário Teste",
    email: "teste@exemplo.com",
    role: "ADMIN",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    tenant: { id: "tenant-1", name: "Tenant 1" },
  };
}

function respostaJson(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

function jwtCallback(args: JwtArgs) {
  const config = hoisted.nextAuthConfig.current;
  if (!config) throw new Error("config do NextAuth não capturado");
  return config.callbacks.jwt(args);
}

function authorize(credentials: CredentialsInput) {
  const config = hoisted.nextAuthConfig.current;
  if (!config) throw new Error("config do NextAuth não capturado");
  return config.providers[0].authorize(credentials);
}

describe("auth_options — callback jwt / refresh", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    hoisted.authMock.current.mockReset();
  });

  it("access dentro da validade retorna o token sem chamar refresh", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const token = {
      accessToken: montarAccessToken(SUB, exp),
      refreshToken: "refresh-valido",
      accessTokenExpiresAt: exp * 1000,
    };

    const resultado = await jwtCallback({ token, user: undefined });

    expect(resultado).toBe(token);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("access na margem do skew (30s) dispara o refresh antes de vencer", async () => {
    const novoExp = Math.floor(Date.now() / 1000) + 3600;
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/api/auth/refresh")) {
        return respostaJson({
          accessToken: montarAccessToken(SUB, novoExp),
          refreshToken: "refresh-novo",
        });
      }
      return respostaJson(montarUsuario());
    });
    vi.stubGlobal("fetch", fetchMock);
    const expAntigo = Math.floor(Date.now() / 1000) + 30;
    const token = {
      sub: SUB,
      name: "Usuário Teste",
      email: "teste@exemplo.com",
      accessToken: montarAccessToken(SUB, expAntigo),
      refreshToken: "refresh-valido",
      accessTokenExpiresAt: expAntigo * 1000,
      tenant: { id: "tenant-1", name: "Tenant 1" },
      role: "ADMIN",
    };

    const resultado = await jwtCallback({ token, user: undefined });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/auth/refresh",
      expect.objectContaining({ method: "POST" }),
    );
    expect(resultado.accessToken).toBe(montarAccessToken(SUB, novoExp));
    expect(resultado.refreshToken).toBe("refresh-novo");
    expect(resultado.error).toBeUndefined();
  });

  it("refresh inválido (backend 401) limpa os tokens e marca RefreshTokenError", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/api/auth/refresh")) {
        return respostaJson({ message: "AUTH_INVALID_REFRESH_TOKEN" }, 401);
      }
      return respostaJson(montarUsuario());
    });
    vi.stubGlobal("fetch", fetchMock);
    const token = {
      sub: SUB,
      accessToken: "access-morto",
      refreshToken: "refresh-invalido",
      accessTokenExpiresAt: Date.now() - 1000,
    };

    const resultado = await jwtCallback({ token, user: undefined });

    // Ponto central da correção: nada de token morto no JWT — o proxy limpa
    // o cookie e manda ao /login sem bounce para "/".
    expect(resultado.error).toBe("RefreshTokenError");
    expect(resultado.accessToken).toBeUndefined();
    expect(resultado.refreshToken).toBeUndefined();
    expect(resultado.accessTokenExpiresAt).toBeUndefined();
  });

  it("regressão: refresh rejeitado via `code` no corpo também limpa a sessão", async () => {
    // O backend pode serializar a falha com o código em `data.code` em vez
    // de `message` — ambos os formatos equivalem a logout.
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith("/api/auth/refresh")) {
        return respostaJson(
          { statusCode: 401, code: "AUTH_INVALID_REFRESH_TOKEN" },
          401,
        );
      }
      return respostaJson(montarUsuario());
    });
    vi.stubGlobal("fetch", fetchMock);
    const token = {
      sub: SUB,
      accessToken: "access-morto",
      refreshToken: "refresh-revogado",
      accessTokenExpiresAt: Date.now() - 1000,
    };

    const resultado = await jwtCallback({ token, user: undefined });

    expect(resultado.error).toBe("RefreshTokenError");
    expect(resultado.accessToken).toBeUndefined();
    expect(resultado.refreshToken).toBeUndefined();
  });

  it("regressão: refresh reutilizado (rotação single-use) derruba a segunda sessão", async () => {
    // Cenário real do loop: access expirou e duas requisições SSR disparam o
    // refresh com o MESMO refreshToken. O backend revoga no primeiro uso, a
    // segunda chamada recebe 401 e deve limpar a sessão em vez de manter o
    // token morto (que gerava o ping-pong /login ↔ "/").
    const usos = new Set<string>();
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("/api/auth/refresh")) {
        const corpo = JSON.parse(String(init?.body)) as {
          refreshToken: string;
        };
        if (usos.has(corpo.refreshToken)) {
          return respostaJson(
            { statusCode: 401, message: "AUTH_INVALID_REFRESH_TOKEN" },
            401,
          );
        }
        usos.add(corpo.refreshToken);
        const novoExp = Math.floor(Date.now() / 1000) + 3600;
        return respostaJson({
          accessToken: montarAccessToken(SUB, novoExp),
          refreshToken: "refresh-novo",
        });
      }
      return respostaJson(montarUsuario());
    });
    vi.stubGlobal("fetch", fetchMock);
    const tokenExpirado = {
      sub: SUB,
      name: "Usuário Teste",
      email: "teste@exemplo.com",
      accessToken: "access-expirado",
      refreshToken: "refresh-mesmo-para-ambas",
      accessTokenExpiresAt: Date.now() - 1000,
      tenant: { id: "tenant-1", name: "Tenant 1" },
      role: "ADMIN",
    };

    const primeira = await jwtCallback({
      token: tokenExpirado,
      user: undefined,
    });
    const segunda = await jwtCallback({
      token: tokenExpirado,
      user: undefined,
    });

    expect(primeira.error).toBeUndefined();
    expect(primeira.refreshToken).toBe("refresh-novo");
    expect(segunda.error).toBe("RefreshTokenError");
    expect(segunda.accessToken).toBeUndefined();
    expect(segunda.refreshToken).toBeUndefined();
  });

  it("sem refreshToken expira a sessão sem ir à rede", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const resultado = await jwtCallback({
      token: { accessToken: "x", accessTokenExpiresAt: 0 },
      user: undefined,
    });

    expect(resultado.error).toBe("RefreshTokenError");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("redirect do Next (digest NEXT_REDIRECT) nunca é engolido pelo refresh", async () => {
    const redirect = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;replace;/login;307;",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw redirect;
      }),
    );

    await expect(
      jwtCallback({
        token: {
          accessToken: "x",
          refreshToken: "r",
          accessTokenExpiresAt: 0,
        },
        user: undefined,
      }),
    ).rejects.toBe(redirect);
  });
});

describe("auth_options — authorize (login)", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("login válido retorna o usuário com tokens e expiração", async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const access = montarAccessToken(SUB, exp);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/api/auth/login")) {
          return respostaJson({ accessToken: access, refreshToken: "r1" });
        }
        return respostaJson(montarUsuario());
      }),
    );

    const usuario = await authorize({
      email: "teste@exemplo.com",
      password: "senha123",
    });

    expect(usuario.id).toBe(SUB);
    expect(usuario.accessToken).toBe(access);
    expect(usuario.refreshToken).toBe("r1");
    expect(usuario.accessTokenExpiresAt).toBe(exp * 1000);
  });

  it("credencial errada (401) vira AuthCredentialsError com o código do backend", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        respostaJson({ message: "AUTH_INVALID_CREDENTIALS" }, 401),
      ),
    );

    const erro = await authorize({
      email: "teste@exemplo.com",
      password: "errada",
    }).catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(Error);
    expect((erro as { code?: string }).code).toBe("AUTH_INVALID_CREDENTIALS");
  });
});
