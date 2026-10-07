import { describe, expect, it, vi } from "vitest";

vi.mock("@/core/actions/usuarios/create_usuario_action", () => ({
  default: vi.fn(),
}));

import {
  createUserSchema,
  type CreateUserInput,
} from "@/core/schemas/user/create_user_schema";
import {
  steps,
  fieldsByStep,
  allowedRoles,
  roleLabels,
} from "./criar-usuario-modal";
import {
  USUARIO_FORM_ALL_INPUT_KEYS,
  USUARIO_FORM_EXPECTED_FIELDS_BY_STEP,
  USUARIO_FORM_EXPECTED_STEPS,
  USUARIO_FORM_EXPECTED_ROLE_LABELS,
  USUARIO_FORM_REQUIRED_FIELDS,
} from "./__tests__/usuario-form.constants";
import {
  buildUsuarioFormMock,
  mockUsuarioFormCompleto,
  mockUsuarioFormCompletoOutput,
  mockUsuarioFormMinimo,
} from "./__tests__/usuario-form.mocks";

describe("usuário — contrato da UI (wizard)", () => {
  it("tem 3 steps na ordem esperada", () => {
    expect(steps).toEqual([...USUARIO_FORM_EXPECTED_STEPS]);
  });

  it("distribui os campos por step conforme o esperado", () => {
    expect(fieldsByStep).toEqual(
      USUARIO_FORM_EXPECTED_FIELDS_BY_STEP.map((step) => [...step]),
    );
  });

  it("cobre todas as chaves do schema, uma única vez", () => {
    const achatado = fieldsByStep.flat();
    expect([...achatado].sort()).toEqual([...USUARIO_FORM_ALL_INPUT_KEYS].sort());
    expect(new Set(achatado).size).toBe(USUARIO_FORM_ALL_INPUT_KEYS.length);
  });

  it("mantém os campos obrigatórios nos steps que bloqueiam o avanço", () => {
    for (const campo of USUARIO_FORM_REQUIRED_FIELDS) {
      const stepIndex = fieldsByStep.findIndex((step) =>
        (step as string[]).includes(campo),
      );
      expect(stepIndex, `campo obrigatório ${campo} fora do wizard`).toBeGreaterThanOrEqual(0);
    }
    expect(fieldsByStep[0]).toContain("role");
    expect(fieldsByStep[1]).toContain("name");
    expect(fieldsByStep[2]).toContain("orgaoId");
  });

  it("exibe labels para todos os valores dos enums de perfil", () => {
    expect(roleLabels).toEqual(USUARIO_FORM_EXPECTED_ROLE_LABELS);
    for (const valor of Object.values(USUARIO_FORM_EXPECTED_ROLE_LABELS)) {
      expect(Object.values(roleLabels)).toContain(valor);
    }
  });

  it("allowedRoles filtra corretamente por actorRole", () => {
    expect(allowedRoles("SUPERADMIN")).toEqual([
      "SUPERADMIN",
      "ADMIN",
      "STAFF",
      "USER",
    ]);
    expect(allowedRoles("ADMIN")).toEqual(["ADMIN", "STAFF", "USER"]);
    expect(allowedRoles("STAFF")).toEqual(["USER"]);
  });
});

describe("usuário — mocks passam no schema do formulário", () => {
  it("aceita o formulário completo (actor ADMIN, role ADMIN)", () => {
    const resultado = createUserSchema.safeParse(mockUsuarioFormCompleto);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual(mockUsuarioFormCompletoOutput);
    }
  });

  it("aceita o formulário mínimo (actor STAFF, role USER)", () => {
    const resultado = createUserSchema.safeParse(mockUsuarioFormMinimo);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toMatchObject({
        name: "Bob",
        email: "bob@exemplo.com",
        role: "USER",
      });
      expect(resultado.data).not.toHaveProperty("tenantId");
    }
  });
});

describe("usuário — UI barra entradas inválidas", () => {
  function caminhosDeErro(input: CreateUserInput) {
    const resultado = createUserSchema.safeParse(input);
    expect(resultado.success).toBe(false);
    if (resultado.success) return [];
    return resultado.error.issues.map((issue) => issue.path.join("."));
  }

  it("barra nome com menos de 2 caracteres (step Dados)", () => {
    expect(caminhosDeErro(buildUsuarioFormMock({ name: "A" }))).toContain("name");
  });

  it("barra e-mail inválido (step Dados)", () => {
    expect(caminhosDeErro(buildUsuarioFormMock({ email: "invalido" }))).toContain(
      "email",
    );
  });

  it("barra senha vazia (step Dados)", () => {
    expect(caminhosDeErro(buildUsuarioFormMock({ password: "" }))).toContain(
      "password",
    );
  });

  it("barra ADMIN criando SUPERADMIN (custom refinement)", () => {
    expect(
      caminhosDeErro(
        buildUsuarioFormMock({
          actorRole: "ADMIN",
          role: "SUPERADMIN",
        }),
      ),
    ).toContain("role");
  });

  it("barra STAFF criando ADMIN (custom refinement)", () => {
    expect(
      caminhosDeErro(
        buildUsuarioFormMock({
          actorRole: "STAFF",
          role: "ADMIN",
        }),
      ),
    ).toContain("role");
  });

  it("barra actor não-SUPERADMIN sem tenantId (custom refinement)", () => {
    expect(
      caminhosDeErro(
        buildUsuarioFormMock({
          actorRole: "ADMIN",
          actorTenantId: "",
        }),
      ),
    ).toContain("actorTenantId");
  });

  it("barra SUPERADMIN criando não-SUPERADMIN sem tenantId (custom refinement)", () => {
    expect(
      caminhosDeErro(
        buildUsuarioFormMock({
          actorRole: "SUPERADMIN",
          role: "ADMIN",
          tenantId: "",
        }),
      ),
    ).toContain("tenantId");
  });
});
