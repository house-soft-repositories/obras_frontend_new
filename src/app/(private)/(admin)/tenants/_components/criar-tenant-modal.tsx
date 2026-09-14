"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import createTenancyAction from "@/core/actions/tenancies/create_tenancy_action";
import {
  createTenantSchema,
  type CreateTenantInput,
} from "@/core/schemas/tenants/create_tenant_schema";
import { useToast } from "@/core/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputPattern } from "@/components/ui/input-pattern";
import { Modal } from "@/core/ui/molecules/modal";

function gerarSlug(valor: string) {
  return valor.toLowerCase().trim().replace(/\s+/g, "-");
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      {label}
      {children}
      {error ? (
        <span
          className="text-xs font-normal text-[var(--cor-perigo)]"
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </label>
  );
}

export function CriarTenantModal() {
  const [open, setOpen] = useState(false);
  const [slugEditado, setSlugEditado] = useState(false);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();
  const form = useForm<CreateTenantInput>({
    resolver: zodResolver(createTenantSchema as unknown as never),
    defaultValues: {
      name: "",
      slug: "",
      cnpj: "",
    },
  });

  function onSubmit(values: CreateTenantInput) {
    const parsed = createTenantSchema.parse(values);

    startTransition(async () => {
      const result = await createTenancyAction(parsed);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Tenant criado com sucesso.");
      form.reset({ name: "", slug: "", cnpj: "" });
      setSlugEditado(false);
      setOpen(false);
    });
  }

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button>
          <Plus aria-hidden="true" />
          Novo tenant
        </Button>
      </Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Popup>
          <Modal.CloseIcon />
          <Modal.Header>
            <Modal.Title>Criar tenant</Modal.Title>
            <Modal.Description>
              Apenas SUPERADMIN pode provisionar uma nova organização.
            </Modal.Description>
          </Modal.Header>

          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <Modal.Body>
              <Field label="Nome" error={form.formState.errors.name?.message}>
                <Input
                  required
                  placeholder="Prefeitura Municipal"
                  aria-invalid={form.formState.errors.name ? true : undefined}
                  {...form.register("name", {
                    onChange: (event) => {
                      if (!slugEditado) {
                        form.setValue("slug", gerarSlug(event.target.value), {
                          shouldDirty: true,
                          shouldValidate: true,
                        });
                      }
                    },
                  })}
                />
              </Field>

              <Field label="Slug" error={form.formState.errors.slug?.message}>
                <Input
                  required
                  placeholder="prefeitura-municipal"
                  aria-invalid={form.formState.errors.slug ? true : undefined}
                  {...form.register("slug", {
                    onChange: (event) => {
                      setSlugEditado(true);
                      form.setValue("slug", gerarSlug(event.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    },
                  })}
                />
              </Field>

              <Field label="CNPJ" error={form.formState.errors.cnpj?.message}>
                <Controller
                  name="cnpj"
                  control={form.control}
                  render={({ field }) => (
                    <InputPattern
                      name={field.name}
                      ref={field.ref}
                      value={field.value ?? ""}
                      onBlur={field.onBlur}
                      onValueChange={({ raw }) => field.onChange(raw)}
                      pattern={/\d/g}
                      htmlPattern="\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}"
                      mask="99.999.999/9999-99"
                      maxLength={14}
                      inputMode="numeric"
                      placeholder="00.000.000/0000-00"
                      aria-invalid={
                        form.formState.errors.cnpj ? true : undefined
                      }
                    />
                  )}
                />
              </Field>
            </Modal.Body>

            <Modal.Footer>
              <Modal.Close className="inline-flex min-h-11 items-center justify-center rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-surface-subtle">
                Cancelar
              </Modal.Close>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : "Salvar"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal.Popup>
      </Modal.Portal>
    </Modal.Root>
  );
}
