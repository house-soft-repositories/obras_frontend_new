import { describe, expect, it } from "vitest";
import {
  privateRouteGroupsForRole,
  privateRoutesForRole,
} from "@/core/config/routes";

describe("privateRoutesForRole", () => {
  it("expõe o dashboard para todas as roles", () => {
    for (const role of ["SUPERADMIN", "ADMIN", "USER", "STAFF"] as const) {
      expect(privateRoutesForRole(role).map((route) => route.path)).toContain(
        "/dashboard",
      );
    }
  });

  it("mantém o início para todas as roles", () => {
    for (const role of ["SUPERADMIN", "ADMIN", "USER", "STAFF"] as const) {
      expect(privateRoutesForRole(role).map((route) => route.path)).toContain(
        "/home",
      );
    }
  });

  it("restringe tenants ao SUPERADMIN", () => {
    expect(
      privateRoutesForRole("SUPERADMIN").map((route) => route.path),
    ).toContain("/tenants");
    expect(privateRoutesForRole("ADMIN").map((route) => route.path)).not.toContain(
      "/tenants",
    );
  });
});

describe("dashboard — visível no modo público e privado", () => {
  it("agrupa o dashboard com type null", () => {
    for (const role of ["SUPERADMIN", "ADMIN", "USER", "STAFF"] as const) {
      const groups = privateRouteGroupsForRole(role);
      const painel = groups.find((group) => group.label === "Painel");
      expect(painel?.type).toBeNull();
      expect(painel?.routes.map((route) => route.path)).toContain("/dashboard");
    }
  });
});
