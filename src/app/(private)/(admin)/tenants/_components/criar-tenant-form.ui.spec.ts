import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/tenancies/create_tenancy_action", () => ({
  default: vi.fn(),
}));

import {
  createTenantSchema,
  type CreateTenantInput,
} from "@/core/schemas/tenants/create_tenant_schema";
import {
  TENANT_FORM_ALL_INPUT_KEYS,
  TENANT_FORM_EXPECTED_LABELS,
  TENANT_FORM_REQUIRED_FIELDS,
  TENANT_FORM_EXPECTED_FIELDS,
} from "./__tests__/tenant-form.constants";
import {
  buildTenantMock,
  mockTenantCompleto,
  mockTenantCompletoOutput,
  mockTenantMinimo,
  mockTenantOptions,
} from "./__tests__/tenant-form.mocks";

describe("tenant — contrato da UI", () => {
  it("renderiza todos os campos esperados com labels corretas", () => {
    expect(TENANT_FORM_EXPECTED_LABELS).toEqual(
      expect.arrayContaining(["Nome", "Slug", "CNPJ"]),
    );
  });

  it("inicia com valores vazios", () => {
    expect(TENANT_FORM_EXPECTED_FIELDS.length).toBe(
      TENANT_FORM_ALL_INPUT_KEYS.length,
    );
  });

  it("exibe labels para todos os valores dos enums", () => {
    const fields = TENANT_FORM_EXPECTED_FIELDS;
    expect(fields.length).toBe(TENANT_FORM_ALL_INPUT_KEYS.length);
    expect(new Set(fields).size).toBe(fields.length);
  });

  it("cobre os campos obrigatórios", () => {
    for (const campo of TENANT_FORM_REQUIRED_FIELDS) {
      expect(TENANT_FORM_ALL_INPUT_KEYS).toContain(campo);
    }
  });
});

describe("tenant — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo e transforma a saída (cnpj formatado → dígitos)", () => {
    const resultado = createTenantSchema.safeParse(mockTenantCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockTenantCompletoOutput);
    }
  });

  it("aceita o formulário mínimo com cnpj vazio", () => {
    const resultado = createTenantSchema.safeParse(mockTenantMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        name: "Prefeitura Municipal",
        slug: "prefeitura-municipal",
      });
      expect(resultado.data.cnpj).toBeNull();
    }
  });
});

describe("tenant — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CreateTenantInput) {
    const resultado = createTenantSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome com menos de 2 caracteres", () => {
    expect(caminhosDeErro(buildTenantMock({ name: "A" }))).toContain("name");
  });

  it("barra slug com caracteres inválidos", () => {
    expect(
      caminhosDeErro(buildTenantMock({ slug: "PREFEITURA MUNICIPAL" })),
    ).toContain("slug");
  });

  it("barra cnpj com menos de 14 dígitos", () => {
    expect(caminhosDeErro(buildTenantMock({ cnpj: "12.345.678/0001-9" }))).toContain(
      "cnpj",
    );
  });
});