import type { CreateUserInput, CreateUserOutput } from "@/core/schemas/user/create_user_schema";
import type { UserRole, TenantType, LocalidadeSchema, OrgaoSchema, SetorWithOrgaoSchema } from "@/core/schemas/user/user_schema";

const UUIDS = {
  tenantA: "550e8400-e29b-41d4-a716-446655440100",
  tenantB: "550e8400-e29b-41d4-a716-446655440101",
  localidadeA: "550e8400-e29b-41d4-a716-446655440102",
  orgaoA: "550e8400-e29b-41d4-a716-446655440103",
  setorA: "550e8400-e29b-41d4-a716-446655440104",
} as const;

export const USUARIO_FORM_UUIDS = UUIDS;

export type UsuarioFormTenant = TenantType;
export type UsuarioFormLocalidade = LocalidadeSchema;
export type UsuarioFormOrgao = OrgaoSchema;
export type UsuarioFormSetor = SetorWithOrgaoSchema;

export const mockUsuarioFormOptions: Record<string, UsuarioFormTenant[]> = {
  tenants: [
    { id: UUIDS.tenantA, name: "Tenant A", slug: "tenant-a", active: true },
    { id: UUIDS.tenantB, name: "Tenant B", slug: "tenant-b", active: true },
  ],
};

export const mockUsuarioFormLocalidades: UsuarioFormLocalidade[] = [
  { id: UUIDS.localidadeA, nome: "Fortaleza", uf: "CE" },
];

export const mockUsuarioFormOrgaos: UsuarioFormOrgao[] = [
  { id: UUIDS.orgaoA, nome: "Secretaria de Obras" },
];

export const mockUsuarioFormSetores: UsuarioFormSetor[] = [
  { id: UUIDS.setorA, nome: "Setor Norte", orgao: { id: UUIDS.orgaoA, nome: "Secretaria de Obras" } },
];

export const mockUsuarioFormCompleto: CreateUserInput = {
  name: "Ana Admin",
  email: "ana@exemplo.com",
  password: "senha123",
  role: "ADMIN",
  tenantId: UUIDS.tenantA,
  localidadeId: UUIDS.localidadeA,
  orgaoId: UUIDS.orgaoA,
  setorId: UUIDS.setorA,
  actorRole: "ADMIN",
  actorTenantId: UUIDS.tenantA,
};

export const mockUsuarioFormCompletoOutput: CreateUserOutput = {
  name: "Ana Admin",
  email: "ana@exemplo.com",
  password: "senha123",
  role: "ADMIN",
  localidadeId: UUIDS.localidadeA,
  orgaoId: UUIDS.orgaoA,
  setorId: UUIDS.setorA,
};

export const mockUsuarioFormMinimo: CreateUserInput = {
  name: "Bob",
  email: "bob@exemplo.com",
  password: "senha456",
  role: "USER",
  tenantId: "",
  localidadeId: "",
  orgaoId: "",
  setorId: "",
  actorRole: "STAFF",
  actorTenantId: UUIDS.tenantA,
};

export function buildUsuarioFormMock(
  override: Partial<CreateUserInput> = {},
): CreateUserInput {
  return {
    ...mockUsuarioFormCompleto,
    ...override,
  };
}
