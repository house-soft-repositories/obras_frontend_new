import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

vi.mock("@/core/config/enviroment_variables", () => ({
  env: {
    NEXT_API_URL: "http://api.test",
    // http:// → variante sem prefixo __Secure- (cobre o fluxo de localhost).
    NEXTAUTH_URL: "http://localhost:3001",
    NEXT_AUTH_SECRET: "segredo-de-teste-com-32-chars!!",
  },
  getEnv: () => ({
    NEXT_API_URL: "http://api.test",
    NEXTAUTH_URL: "http://localhost:3001",
    NEXT_AUTH_SECRET: "segredo-de-teste-com-32-chars!!",
  }),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: vi.fn(),
}));

const { proxy } = await import("@/proxy");

const getTokenMock = vi.mocked(getToken);

function requisicao(path: string) {
  return new NextRequest(`http://localhost:3001${path}`);
}

function tokenValido() {
  return {
    sub: "user-1",
    accessToken: "access-valido",
    accessTokenExpiresAt: Date.now() + 3600000,
  };
}

describe("proxy — sessão expirada não entra em loop", () => {
  beforeEach(() => {
    getTokenMock.mockReset();
  });

  it("token com erro em rota privada: redireciona ao /login com ?next= e expira o cookie", async () => {
    getTokenMock.mockResolvedValue({
      ...tokenValido(),
      error: "RefreshTokenError",
    });

    const resposta = await proxy(requisicao("/home"));

    expect(resposta.status).toBe(307);
    expect(resposta.headers.get("location")).toBe(
      "http://localhost:3001/login?next=%2Fhome",
    );
    const cookie = resposta.cookies.get("authjs.session-token");
    expect(cookie?.value).toBe("");
    const cookieSeguro = resposta.cookies.get("__Secure-authjs.session-token");
    expect(cookieSeguro?.value).toBe("");
    expect(cookieSeguro?.secure).toBe(true);
    const expiracao = cookie?.expires;
    const expiraEmMs =
      expiracao instanceof Date ? expiracao.getTime() : (expiracao ?? 0);
    expect(expiraEmMs).toBeLessThanOrEqual(Date.now());
  });

  it("token com erro já no /login: deixa renderizar e mesmo assim expira o cookie", async () => {
    getTokenMock.mockResolvedValue({
      ...tokenValido(),
      error: "RefreshTokenError",
    });

    const resposta = await proxy(requisicao("/login"));

    expect(resposta.status).toBe(200);
    expect(resposta.cookies.get("authjs.session-token")?.value).toBe("");
  });

  it("token válido no /login: manda para / (sem tocar no cookie)", async () => {
    getTokenMock.mockResolvedValue(tokenValido());

    const resposta = await proxy(requisicao("/login"));

    expect(resposta.headers.get("location")).toBe("http://localhost:3001/");
    expect(resposta.cookies.get("authjs.session-token")).toBeUndefined();
  });

  it("sem token em rota privada: manda ao /login com ?next=", async () => {
    getTokenMock.mockResolvedValue(null);

    const resposta = await proxy(requisicao("/obras/123"));

    expect(resposta.status).toBe(307);
    expect(resposta.headers.get("location")).toBe(
      "http://localhost:3001/login?next=%2Fobras%2F123",
    );
  });

  it("token válido em rota privada: segue com o header de path atual", async () => {
    getTokenMock.mockResolvedValue(tokenValido());

    const resposta = await proxy(requisicao("/home"));

    expect(resposta.status).toBe(200);
  });
});
