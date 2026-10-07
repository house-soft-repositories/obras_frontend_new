import type { CreateUserInput, CreateUserOutput } from "@/core/schemas/user/create_user_schema";

export const USUARIO_FORM_EXPECTED_STEPS = [
  "Acesso",
  "Dados",
  "Organização",
] as const;

export const USUARIO_FORM_EXPECTED_FIELDS_BY_STEP: ReadonlyArray<
  ReadonlyArray<keyof CreateUserInput>
> = [
  ["role", "tenantId", "actorRole", "actorTenantId"],
  ["name", "email", "password"],
  ["localidadeId", "orgaoId", "setorId"],
];

export const USUARIO_FORM_REQUIRED_FIELDS = [
  "name",
  "email",
  "password",
  "role",
  "actorRole",
  "actorTenantId",
] as const satisfies ReadonlyArray<keyof CreateUserInput>;

export const USUARIO_FORM_ALL_INPUT_KEYS: ReadonlyArray<keyof CreateUserInput> = [
  "name",
  "email",
  "password",
  "role",
  "tenantId",
  "localidadeId",
  "orgaoId",
  "setorId",
  "actorRole",
  "actorTenantId",
];

export const USUARIO_FORM_EXPECTED_ROLE_LABELS = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Administrador",
  STAFF: "Equipe",
  USER: "Usuário",
} as const;
