import { describe, expect, it } from "vitest";
import { OBRA_TABS, obraTabHref, parseObraTab } from "@/core/config/obra-tabs";

describe("obra detail tabs", () => {
  it("defaults missing and invalid values to dados", () => {
    expect(parseObraTab(null)).toBe("dados");
    expect(parseObraTab(undefined)).toBe("dados");
    expect(parseObraTab("invalida")).toBe("dados");
  });

  it("accepts every configured tab", () => {
    for (const tab of OBRA_TABS) {
      expect(parseObraTab(tab.id)).toBe(tab.id);
    }
  });

  it("creates a canonical query-param URL", () => {
    expect(obraTabHref("obra 1", "financeiro")).toBe(
      "/obras/obra%201?tab=financeiro",
    );
  });
});
