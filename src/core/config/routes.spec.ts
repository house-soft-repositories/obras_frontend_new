import { describe, expect, it } from "vitest";
import { privateRoutesForRole } from "@/core/config/routes";

describe("privateRoutesForRole", () => {
  it("filtra as rotas por role", () => {
    expect(privateRoutesForRole("ADMIN").map((route) => route.path)).toEqual([
      "/home",
      "/cadastros/usuarios",
      "/obras",
      "/cadastros/localidades",
      "/cadastros/orgaos",
      "/cadastros/setores",
    ]);
    expect(privateRoutesForRole("STAFF").map((route) => route.path)).toEqual([
      "/home",
      "/cadastros/usuarios",
    ]);
    expect(privateRoutesForRole("USER").map((route) => route.path)).toEqual([
      "/home",
    ]);
  });

  it("mostra a visão completa do SUPERADMIN", () => {
    expect(privateRoutesForRole("SUPERADMIN").map((route) => route.path)).toEqual([
      "/home",
      "/tenants",
      "/cadastros/usuarios",
      "/obras",
      "/cadastros/localidades",
      "/cadastros/orgaos",
      "/cadastros/setores",
    ]);
  });
});
