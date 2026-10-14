import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/core/config/auth_options", () => ({
  // Identidade: nos testes o `proxy` exportado já é o handler interno; a
  // sessão é injetada direto em `req.auth`. O comportamento do wrapper real
  // (executar o jwt + anexar o cookie atualizado) é do Auth.js, coberto pelo
  // teste de `auth_options` e pelo teste de fumaça contra o deploy.
  auth: (fn: (req: unknown) => unknown) => fn,
}));

const { proxy } = await import("@/proxy");
// O wrapper `auth()` real tipa o retorno como `Response | void`; aqui o mock
// é identidade, então o handler resolve sempre `NextResponse`.
const callProxy = proxy as unknown as (
  req: NextRequest,
) => Promise<NextResponse>;

function requisicao(path: string, session: unknown) {
  const req = new NextRequest(`http://localhost:3001${path}`);
  (req as unknown as Record<string, unknown>).auth = session;
  return req;
}

function sessaoValida() {
  return {
    user: {
      id: "user-1",
      name: "User",
      email: "user@test.com",
      role: "USER",
      tenant: null,
    },
    expires: new Date(Date.now() + 3600000).toISOString(),
  };
}

describe("proxy — sessão expirada não entra em loop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("token com erro em rota privada: redireciona ao /login com ?next= e expira o cookie", async () => {
    const resposta = await callProxy(
      requisicao("/home", { ...sessaoValida(), error: "RefreshTokenError" }),
    );

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
    const resposta = await callProxy(
      requisicao("/login", { ...sessaoValida(), error: "RefreshTokenError" }),
    );

    expect(resposta.status).toBe(200);
    expect(resposta.cookies.get("authjs.session-token")?.value).toBe("");
  });

  it("token válido no /login: manda para / (sem tocar no cookie)", async () => {
    const resposta = await callProxy(requisicao("/login", sessaoValida()));

    expect(resposta.headers.get("location")).toBe("http://localhost:3001/");
    expect(resposta.cookies.get("authjs.session-token")).toBeUndefined();
  });

  it("token válido no /login com ?next=: manda para / sem carregar a query", async () => {
    const resposta = await callProxy(
      requisicao("/login?next=%2Fhome", sessaoValida()),
    );

    expect(resposta.headers.get("location")).toBe("http://localhost:3001/");
  });

  it("sem token em rota privada: manda ao /login com ?next=", async () => {
    const resposta = await callProxy(requisicao("/obras/123", null));

    expect(resposta.status).toBe(307);
    expect(resposta.headers.get("location")).toBe(
      "http://localhost:3001/login?next=%2Fobras%2F123",
    );
  });

  it("token válido em rota privada: segue com o header de path atual", async () => {
    const resposta = await callProxy(requisicao("/home", sessaoValida()));

    expect(resposta.status).toBe(200);
  });
});
