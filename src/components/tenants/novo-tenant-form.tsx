"use client";

import { AlertCircle, LoaderCircle, Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputPattern } from "@/components/ui/input-pattern";
import {
  ErroHttp,
  mensagemErro,
  proxyJson,
} from "@/components/cadastros/proxy-cadastros";
import { gerarSlug } from "@/lib/ui/slug";

type FormTenant = { name: string; slug: string; cnpj: string };
type Erros = Partial<Record<keyof FormTenant, string>>;

const slugValido = /^[a-z0-9-]+$/;
const apenasDigitos = (valor: string) => valor.replace(/\D/g, "");

function validar(form: FormTenant): Erros {
  const erros: Erros = {};
  if (!form.name.trim()) erros.name = "Informe o nome da organização.";
  if (!form.slug.trim()) {
    erros.slug = "Informe o slug do tenant.";
  } else if (!slugValido.test(form.slug.trim().toLowerCase())) {
    erros.slug = "Use apenas letras minúsculas, números e hífens.";
  }
  if (form.cnpj && apenasDigitos(form.cnpj).length !== 14) {
    erros.cnpj = "O CNPJ deve conter exatamente 14 dígitos.";
  }
  return erros;
}

function mensagemErroTenant(erro: unknown): string {
  if (!(erro instanceof ErroHttp)) return mensagemErro(erro);
  if (erro.status === 400)
    return "Revise os dados informados e tente novamente.";
  if (erro.status === 403)
    return "Apenas usuários SUPERADMIN podem criar tenants.";
  if (erro.status === 409)
    return "Este slug já está em uso. Escolha outro slug.";
  return erro.message;
}

export function NovoTenantModal({
  aberto,
  aoFechar,
  aoCriar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: () => void;
}) {
  const dialogo = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogo.current?.querySelector<HTMLElement>("input")?.focus();
    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [aberto]);

  if (!aberto) return null;

  function aoTeclar(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      aoFechar();
      return;
    }
    if (event.key !== "Tab") return;

    const focaveis = Array.from(
      dialogo.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    const primeiro = focaveis[0];
    const ultimo = focaveis.at(-1);
    if (!primeiro || !ultimo) return;
    if (event.shiftKey && document.activeElement === primeiro) {
      event.preventDefault();
      ultimo.focus();
    } else if (!event.shiftKey && document.activeElement === ultimo) {
      event.preventDefault();
      primeiro.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-foreground/70 p-4 max-sm:items-end max-sm:px-0 max-sm:pb-0"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) aoFechar();
      }}
    >
      <section
        ref={dialogo}
        role="dialog"
        aria-modal="true"
        aria-labelledby="novo-tenant-titulo"
        aria-describedby="novo-tenant-descricao"
        onKeyDown={aoTeclar}
        className="flex max-h-[min(90vh,760px)] w-full max-w-[680px] flex-col overflow-hidden rounded-app border border-border bg-surface shadow-overlay max-sm:max-h-[calc(100dvh-1rem)] max-sm:rounded-b-none"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
              Dados da organização
            </p>
            <h2
              id="novo-tenant-titulo"
              className="mt-1 font-display text-xl font-semibold text-foreground sm:text-2xl"
            >
              Novo tenant
            </h2>
            <p id="novo-tenant-descricao" className="mt-1 text-sm text-muted">
              Crie uma organização para iniciar a gestão de obras em um ambiente
              próprio.
            </p>
          </div>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Fechar modal"
            onClick={aoFechar}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        <NovoTenantForm aoCancelar={aoFechar} aoCriar={aoCriar} />
      </section>
    </div>
  );
}

function NovoTenantForm({
  aoCancelar,
  aoCriar,
}: {
  aoCancelar: () => void;
  aoCriar: () => void;
}) {
  const [form, setForm] = useState<FormTenant>({
    name: "",
    slug: "",
    cnpj: "",
  });
  const [erros, setErros] = useState<Erros>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [slugEditado, setSlugEditado] = useState(false);

  function atualizar(campo: keyof FormTenant, valor: string) {
    setForm((atual) => ({
      ...atual,
      [campo]: valor,
      ...(campo === "name" && !slugEditado ? { slug: gerarSlug(valor) } : {}),
    }));
    setErros((atual) => ({ ...atual, [campo]: undefined }));
    if (campo === "name" && !slugEditado) {
      setErros((atual) => ({ ...atual, slug: undefined }));
    }
    setErroGeral(null);
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizado = {
      ...form,
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
    };
    const cnpj = apenasDigitos(normalizado.cnpj);
    const errosAtuais = validar(normalizado);
    setErros(errosAtuais);
    if (Object.keys(errosAtuais).length) return;

    setSalvando(true);
    setErroGeral(null);
    try {
      await proxyJson("tenancies", {
        method: "POST",
        body: JSON.stringify({
          name: normalizado.name,
          slug: normalizado.slug,
          ...(cnpj ? { cnpj } : {}),
        }),
      });
      aoCriar();
    } catch (erro) {
      setErroGeral(mensagemErroTenant(erro));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="overflow-y-auto p-4 sm:p-6">
        <p className="mb-5 text-sm text-muted">
          Os campos marcados com * são obrigatórios.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo erro={erros.name} htmlFor="tenant-name" label="Nome" required>
            <Input
              id="tenant-name"
              autoComplete="organization"
              value={form.name}
              onChange={(e) => atualizar("name", e.target.value)}
              aria-invalid={Boolean(erros.name)}
              aria-describedby={erros.name ? "tenant-name-error" : undefined}
            />
          </Campo>
          <Campo
            erro={erros.slug}
            htmlFor="tenant-slug"
            label="Slug"
            required
            dica="Use letras minúsculas, números e hífens."
          >
            <Input
              id="tenant-slug"
              value={form.slug}
              onChange={(e) => {
                setSlugEditado(true);
                atualizar("slug", e.target.value);
              }}
              spellCheck={false}
              autoComplete="off"
              aria-invalid={Boolean(erros.slug)}
              aria-describedby="tenant-slug-help tenant-slug-error"
            />
          </Campo>
          <Campo
            erro={erros.cnpj}
            htmlFor="tenant-cnpj"
            label="CNPJ"
            dica="Informe somente os 14 dígitos, sem pontos, barras ou traços."
          >
            <InputPattern
              id="tenant-cnpj"
              value={form.cnpj}
              onChange={(e) => atualizar("cnpj", e.target.value)}
              pattern={/\d/g}
              mask="99.999.999/9999-99"
              htmlPattern="[0-9]{2}\\.[0-9]{3}\\.[0-9]{3}/[0-9]{4}-[0-9]{2}"
              inputMode="numeric"
              maxLength={14}
              placeholder="Somente 14 dígitos"
              autoComplete="off"
              aria-invalid={Boolean(erros.cnpj)}
              aria-describedby="tenant-cnpj-help tenant-cnpj-error"
            />
          </Campo>
        </div>
      </div>

      {erroGeral ? (
        <div
          className="mx-4 flex gap-3 rounded-app border border-foreground bg-surface-subtle p-4 text-sm sm:mx-6"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>{erroGeral}</p>
        </div>
      ) : null}
      <div className="mt-auto flex flex-col-reverse gap-3 border-t border-border p-4 sm:flex-row sm:justify-end sm:px-6">
        <Button variant="secondary" disabled={salvando} onClick={aoCancelar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando} aria-busy={salvando}>
          {salvando ? (
            <LoaderCircle aria-hidden="true" className="animate-spin" />
          ) : (
            <Plus aria-hidden="true" />
          )}
          {salvando ? "Criando tenant…" : "Criar tenant"}
        </Button>
      </div>
    </form>
  );
}

function Campo({
  children,
  dica,
  erro,
  htmlFor,
  label,
  required,
}: {
  children: React.ReactNode;
  dica?: string;
  erro?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  const erroId = `${htmlFor}-error`;
  const dicaId = `${htmlFor}-help`;
  return (
    <div className="grid gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-foreground"
      >
        {label}
        {required ? " *" : null}
      </label>
      {children}
      {dica ? (
        <p id={dicaId} className="text-xs text-muted">
          {dica}
        </p>
      ) : null}
      {erro ? (
        <p
          id={erroId}
          className="flex items-center gap-1.5 text-xs font-semibold text-foreground"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="size-4" />
          {erro}
        </p>
      ) : null}
    </div>
  );
}
