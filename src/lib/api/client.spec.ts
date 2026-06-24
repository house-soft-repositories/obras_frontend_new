import { afterEach, describe, expect, it } from "vitest";
import { montarUrl, obterUrlBaseApi } from "./client";

describe("client da API", () => {
  const original = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = original;
    }
  });

  it("usa http://localhost:3000 quando NEXT_PUBLIC_API_URL nao esta definida", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(obterUrlBaseApi()).toBe("http://localhost:3000");
  });

  it("monta a URL base a partir de NEXT_PUBLIC_API_URL (sem barra final)", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://api.exemplo.gov.br/";
    expect(obterUrlBaseApi()).toBe("https://api.exemplo.gov.br");
    expect(montarUrl("/health")).toBe("https://api.exemplo.gov.br/health");
    expect(montarUrl("health")).toBe("https://api.exemplo.gov.br/health");
  });
});
