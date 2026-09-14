import { z } from "zod";
import { userRoleSchema } from "@/core/schemas/user/user_schema";

const optionalUuid = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.uuid().optional(),
);

const actorRoleSchema = userRoleSchema.extract([
  "SUPERADMIN",
  "ADMIN",
  "STAFF",
]);

export const createUserSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome do usuário."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Informe um e-mail válido.")),
    password: z.string().min(1, "Informe uma senha."),
    role: userRoleSchema,
    tenantId: optionalUuid,
    localidadeId: optionalUuid,
    orgaoId: optionalUuid,
    setorId: optionalUuid,
    actorRole: actorRoleSchema,
    actorTenantId: optionalUuid,
  })
  .superRefine((data, ctx) => {
    if (data.actorRole === "ADMIN" && data.role === "SUPERADMIN") {
      ctx.addIssue({
        code: "custom",
        path: ["role"],
        message: "Administrador não pode criar SUPERADMIN.",
      });
    }

    if (data.actorRole === "STAFF" && data.role !== "USER") {
      ctx.addIssue({
        code: "custom",
        path: ["role"],
        message: "STAFF pode criar apenas usuários do tipo USER.",
      });
    }

    if (data.actorRole !== "SUPERADMIN" && !data.actorTenantId) {
      ctx.addIssue({
        code: "custom",
        path: ["actorTenantId"],
        message: "Selecione uma tenancy antes de criar usuários.",
      });
    }

    if (
      data.actorRole === "SUPERADMIN" &&
      data.role !== "SUPERADMIN" &&
      !data.tenantId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["tenantId"],
        message: "Informe a tenancy para usuários que não são SUPERADMIN.",
      });
    }
  })
  .transform(({ actorRole, actorTenantId: _actorTenantId, ...data }) => {
    if (actorRole === "SUPERADMIN" && data.role === "SUPERADMIN") {
      return {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      };
    }

    if (actorRole !== "SUPERADMIN") {
      return {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        localidadeId: data.localidadeId,
        orgaoId: data.orgaoId,
        setorId: data.setorId,
      };
    }

    return {
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      tenantId: data.tenantId,
      localidadeId: data.localidadeId,
      orgaoId: data.orgaoId,
      setorId: data.setorId,
    };
  });

export type CreateUserInput = z.input<typeof createUserSchema>;
export type CreateUserOutput = z.output<typeof createUserSchema>;
