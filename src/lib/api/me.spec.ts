import { beforeEach, describe, expect, it } from "vitest";
import { ErroApi } from "./obras";
import { buscarMe, limparCacheMe, papelPrincipal } from "./me";

describe("papelPrincipal", () => {
  it("devolve o rotulo do perfil de maior hierarquia", () => {
    expect(
      papelPrincipal([
        { perfil: "CONSULTA" },
        { perfil: "ADMIN_TENANT" },
        { perfil: "RESPONSAVEL_OBRA" },
      ]),
    ).toBe("Administrador");
    expect(
      papelPrincipal([{ perfil: "GESTOR_ORGAO" }, { perfil: "SUPER_ADMIN" }]),
    ).toBe("Super admin");
    expect(papelPrincipal([{ perfil: "CONSULTA" }])).toBe("Consulta");
    expect(papelPrincipal([{ perfil: "RESPONSAVEL_OBRA" }])).toBe(
      "Responsável por obra",
    );
  });
  it("sem perfis conhecidos devolve o fallback institucional", () => {
    expect(papelPrincipal([])).toBe("Acesso institucional");
    expect(papelPrincipal([{ perfil: "DESCONHECIDO" }])).toBe(
      "Acesso institucional",
    );
  });
});

describe("buscarMe", () => {
  beforeEach(() => limparCacheMe());

  const corpo = {
    usuarioId: "u1",
    nome: "Mariana Rocha",
    email: "mariana@orgao.gov.br",
    perfis: [{ perfil: "ADMIN_TENANT", escopo: "TENANT" }],
    tenant: { id: "t1", nome: "Prefeitura Demo", slug: "prefeitura-demo" },
  };

  const resposta = (status: number, json?: unknown) =>
    ({
      status,
      ok: status >= 200 && status < 300,
      json: async () => json,
    }) as Response;

  it("chama GET /api/proxy/auth/me e devolve a resposta mapeada", async () => {
    const urls: string[] = [];
    const me = await buscarMe(async (url) => {
      urls.push(String(url));
      return resposta(200, corpo);
    });
    expect(urls).toEqual(["/api/proxy/auth/me"]);
    expect(me).toEqual(corpo);
    expect(me.tenant?.slug).toBe("prefeitura-demo");
  });

  it("usa cache em modulo: uma unica requisicao por sessao", async () => {
    let chamadas = 0;
    const fetchFake = async () => {
      chamadas += 1;
      return resposta(200, corpo);
    };
    const [a, b] = await Promise.all([
      buscarMe(fetchFake),
      buscarMe(fetchFake),
    ]);
    await buscarMe(fetchFake);
    expect(chamadas).toBe(1);
    expect(a).toEqual(b);
  });

  it("limparCacheMe forca nova requisicao", async () => {
    let chamadas = 0;
    const fetchFake = async () => {
      chamadas += 1;
      return resposta(200, corpo);
    };
    await buscarMe(fetchFake);
    limparCacheMe();
    await buscarMe(fetchFake);
    expect(chamadas).toBe(2);
  });

  it("erro HTTP vira ErroApi e nao fica em cache", async () => {
    await expect(buscarMe(async () => resposta(401, {}))).rejects.toMatchObject(
      { status: 401 },
    );
    await expect(
      buscarMe(async () => {
        throw new Error("offline");
      }),
    ).rejects.toThrow("offline");
    const me = await buscarMe(async () => resposta(200, corpo));
    expect(me.nome).toBe("Mariana Rocha");
    await expect(buscarMe(async () => resposta(500, {}))).resolves.toEqual(
      corpo,
    ); // sucesso anterior permanece em cache
  });

  it("ErroApi expoe o status da resposta", async () => {
    const erro = await buscarMe(async () => resposta(403, {})).catch(
      (e) => e as ErroApi,
    );
    expect(erro).toBeInstanceOf(ErroApi);
    expect((erro as ErroApi).status).toBe(403);
  });
});
