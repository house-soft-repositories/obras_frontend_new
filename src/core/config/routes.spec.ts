import { describe, expect, it } from "vitest";
import { findActiveRoute, privateRoutes } from "@/core/config/routes";

describe("findActiveRoute — só o match mais profundo fica ativo", () => {
  it("marca o pai quando o path é exato", () => {
    const active = findActiveRoute(privateRoutes, "/obras-privadas");
    expect(active?.route.path).toBe("/obras-privadas");
    expect(active?.parent).toBeNull();
  });

  it("em /obras-privadas/mapa só o filho Mapa vence (pai não marca junto)", () => {
    const active = findActiveRoute(privateRoutes, "/obras-privadas/mapa");
    expect(active?.route.path).toBe("/obras-privadas/mapa");
    expect(active?.parent?.path).toBe("/obras-privadas");
  });

  it("detalhe dinâmico resolve no filho :id com o pai como fallback", () => {
    const active = findActiveRoute(privateRoutes, "/obras-privadas/123");
    expect(active?.route.path).toBe("/obras-privadas/:id");
    expect(active?.parent?.path).toBe("/obras-privadas");

    const publica = findActiveRoute(privateRoutes, "/obras/456");
    expect(publica?.route.path).toBe("/obras/:id");
    expect(publica?.parent?.path).toBe("/obras");
  });

  it("rota sem children continua exata", () => {
    expect(findActiveRoute(privateRoutes, "/dashboard")?.route.path).toBe(
      "/dashboard",
    );
    expect(findActiveRoute(privateRoutes, "/home")?.route.path).toBe("/home");
  });

  it("path inexistente não ativa nada", () => {
    expect(findActiveRoute(privateRoutes, "/rota-que-nao-existe")).toBeNull();
    expect(
      findActiveRoute(privateRoutes, "/obras-privadas/mapa/extra"),
    ).toBeNull();
  });
});
