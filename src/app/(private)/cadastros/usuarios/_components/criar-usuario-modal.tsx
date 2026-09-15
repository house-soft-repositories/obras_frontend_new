"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/core/ui/atoms/button";
import { Input } from "@/core/ui/atoms/input";
import createUsuarioAction from "@/core/actions/usuarios/create_usuario_action";
import type { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";
import type { OrgaoSchema } from "@/core/schemas/orgaos/orgao_schema";
import type { SetorWithOrgaoSchema } from "@/core/schemas/setores/setor_schema";
import {
  CreateUserOutput,
  createUserSchema,
  type CreateUserInput,
} from "@/core/schemas/user/create_user_schema";
import type { UserRole } from "@/core/schemas/user/user_schema";
import type { TenantType } from "@/core/schemas/tenants/tenant_schema";
import { useToast } from "@/core/hooks/useToast";
import { Modal } from "@/core/ui/molecules/modal";

const roleLabels: Record<UserRole, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Administrador",
  STAFF: "Equipe",
  USER: "Usuário",
};

const steps = ["Acesso", "Dados", "Organização"] as const;

type StepIndex = 0 | 1 | 2;

type CriarUsuarioModalProps = {
  actorRole: "SUPERADMIN" | "ADMIN" | "STAFF";
  actorTenantId?: string;
  tenants: TenantType[];
  localidades: LocalidadeSchema[];
  orgaos: OrgaoSchema[];
  setores: SetorWithOrgaoSchema[];
};

function allowedRoles(
  actorRole: CriarUsuarioModalProps["actorRole"],
): UserRole[] {
  if (actorRole === "SUPERADMIN")
    return ["SUPERADMIN", "ADMIN", "STAFF", "USER"];
  if (actorRole === "ADMIN") return ["ADMIN", "STAFF", "USER"];
  return ["USER"];
}

function SelectField({
  label,
  error,
  children,
  ...props
}: React.ComponentProps<"select"> & { label: string; error?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <select
        className="h-11 rounded-app border border-input bg-surface px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-invalid={error ? true : undefined}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span
          className="text-xs font-normal text-(--cor-perigo)"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}

function InputField({
  label,
  error,
  ...props
}: React.ComponentProps<typeof Input> & { label: string; error?: string }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      <Input aria-invalid={error ? true : undefined} {...props} />
      {error ? (
        <span
          className="text-xs font-normal text-(--cor-perigo)"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function CriarUsuarioModal({
  actorRole,
  actorTenantId,
  tenants,
  localidades,
  orgaos,
  setores,
}: CriarUsuarioModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<StepIndex>(0);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const roles = allowedRoles(actorRole);
  const form = useForm<CreateUserInput, unknown, CreateUserOutput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: roles[0],
      tenantId: "",
      localidadeId: "",
      orgaoId: "",
      setorId: "",
      actorRole,
      actorTenantId: actorTenantId ?? "",
    },
  });

  const selectedRole = useWatch({ control: form.control, name: "role" });
  const selectedTenantId = useWatch({
    control: form.control,
    name: "tenantId",
  });
  const selectedOrgaoId = useWatch({ control: form.control, name: "orgaoId" });
  const showTenantStep =
    actorRole === "SUPERADMIN" && selectedRole !== "SUPERADMIN";
  const showOrganizationStep =
    actorRole !== "SUPERADMIN" || Boolean(selectedTenantId);
  const filteredSetores = useMemo(
    () =>
      setores.filter(
        (setor) => !selectedOrgaoId || setor.orgao.id === selectedOrgaoId,
      ),
    [selectedOrgaoId, setores],
  );

  function resetForm() {
    form.reset({
      name: "",
      email: "",
      password: "",
      role: roles[0],
      tenantId: "",
      localidadeId: "",
      orgaoId: "",
      setorId: "",
      actorRole,
      actorTenantId: actorTenantId ?? "",
    });
    setStep(0);
  }

  async function validateStep(currentStep: StepIndex) {
    if (currentStep === 0)
      return form.trigger(["role", "tenantId", "actorRole", "actorTenantId"]);
    if (currentStep === 1) return form.trigger(["name", "email", "password"]);
    return form.trigger(["localidadeId", "orgaoId", "setorId"]);
  }

  async function nextStep(event?: React.SyntheticEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    const valid = await validateStep(step);
    if (!valid) return;
    setStep((current) => Math.min(current + 1, 2) as StepIndex);
  }

  async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (step < 2) {
      event.preventDefault();
      await nextStep(event);
      return;
    }

    await form.handleSubmit(onSubmit)(event);
  }

  function onSubmit(values: CreateUserOutput) {
    startTransition(async () => {
      const result = await createUsuarioAction(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Usuário criado com sucesso.");
      resetForm();
      setOpen(false);
    });
  }

  return (
    <Modal.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Novo usuário
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup className="max-w-2xl">
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar usuário</Modal.Title>
            <Modal.Description>
              Preencha as etapas para cadastrar um usuário conforme as
              permissões do seu perfil.
            </Modal.Description>
          </Modal.Header>

          <ol className="grid gap-2 sm:grid-cols-3">
            {steps.map((label, index) => (
              <li
                key={label}
                className={`rounded-app border px-3 py-2 text-xs font-semibold ${
                  step === index
                    ? "border-accent bg-accent text-foreground"
                    : "border-border bg-surface-subtle text-muted"
                }`}
              >
                {index + 1}. {label}
              </li>
            ))}
          </ol>

          <form
            id="criar-usuario-form"
            onSubmit={handleFormSubmit}
            className="grid gap-4"
          >
            <Modal.Body>
              <input type="hidden" {...form.register("actorRole")} />
              <input type="hidden" {...form.register("actorTenantId")} />

              {step === 0 ? (
                <div className="grid gap-4">
                  <SelectField
                    label="Perfil"
                    {...form.register("role")}
                    error={form.formState.errors.role?.message}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </SelectField>

                  {showTenantStep ? (
                    <SelectField
                      label="Tenant"
                      {...form.register("tenantId")}
                      error={form.formState.errors.tenantId?.message}
                    >
                      <option value="">Selecione</option>
                      {tenants
                        .filter((tenant) => tenant.active)
                        .map((tenant) => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.name} - {tenant.slug}
                          </option>
                        ))}
                    </SelectField>
                  ) : null}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="grid gap-4">
                  <InputField
                    label="Nome"
                    required
                    {...form.register("name")}
                    error={form.formState.errors.name?.message}
                  />
                  <InputField
                    label="E-mail"
                    required
                    type="email"
                    {...form.register("email")}
                    error={form.formState.errors.email?.message}
                  />
                  <InputField
                    label="Senha"
                    required
                    type="password"
                    autoComplete="new-password"
                    {...form.register("password")}
                    error={form.formState.errors.password?.message}
                  />
                </div>
              ) : null}

              {step === 2 ? (
                <div className="grid gap-4">
                  {showOrganizationStep ? (
                    <>
                      <SelectField
                        label="Localidade"
                        {...form.register("localidadeId")}
                      >
                        <option value="">Sem localidade</option>
                        {localidades.map((localidade) => (
                          <option key={localidade.id} value={localidade.id}>
                            {localidade.nome} - {localidade.uf}
                          </option>
                        ))}
                      </SelectField>
                      <SelectField label="Órgão" {...form.register("orgaoId")}>
                        <option value="">Sem órgão</option>
                        {orgaos.map((orgao) => (
                          <option key={orgao.id} value={orgao.id}>
                            {orgao.nome}
                          </option>
                        ))}
                      </SelectField>
                      <SelectField label="Setor" {...form.register("setorId")}>
                        <option value="">Sem setor</option>
                        {filteredSetores.map((setor) => (
                          <option key={setor.id} value={setor.id}>
                            {setor.nome} - {setor.orgao.nome}
                          </option>
                        ))}
                      </SelectField>
                    </>
                  ) : (
                    <p className="rounded-app border border-border bg-surface-subtle px-3 py-2 text-sm text-muted">
                      SUPERADMIN de plataforma não recebe tenant, localidade,
                      órgão ou setor.
                    </p>
                  )}
                </div>
              ) : null}
            </Modal.Body>
          </form>

          <Modal.Footer>
            <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
              Cancelar
            </Modal.Close>
            {step > 0 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setStep((current) => Math.max(current - 1, 0) as StepIndex)
                }
              >
                <ChevronLeft aria-hidden="true" />
                Voltar
              </Button>
            ) : null}
            {step < 2 ? (
              <Button type="button" onClick={(event) => void nextStep(event)}>
                Próximo
                <ChevronRight aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="submit"
                form="criar-usuario-form"
                disabled={isPending}
              >
                <Check aria-hidden="true" />
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            )}
          </Modal.Footer>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
