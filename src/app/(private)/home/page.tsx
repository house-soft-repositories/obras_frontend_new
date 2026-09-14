import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  ChartNoAxesCombined,
  FileText,
  FolderKanban,
  Plus,
} from "lucide-react";
import { auth } from "@/core/config/auth_options";
import { saudacaoPorHora } from "@/core/utils/saudacao_por_hora";

const shortcuts = [
  {
    href: "/obras",
    title: "Obras",
    description: "Acompanhe contratos, execução e medições.",
    icon: FolderKanban,
  },
  {
    href: "/obras/nova",
    title: "Nova obra",
    description: "Registre uma nova obra para acompanhamento.",
    icon: Plus,
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Consulte os indicadores físico-financeiros.",
    icon: ChartNoAxesCombined,
  },
  {
    href: "/relatorios/obras",
    title: "Relatórios",
    description: "Gere relatórios e exportações de obras.",
    icon: FileText,
  },
] as const;

export default async function HomePage() {
  const session = await auth();
  const firstName = session?.user?.name.trim().split(/\s+/)[0] ?? "";
  const greeting = firstName
    ? `${saudacaoPorHora(new Date().getHours())}, ${firstName}`
    : "Bem-vindo";

  return (
    <main
      data-slot="home"
      className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10"
    >
      <section className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Painel inicial</p>
          <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {greeting}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Centralize o acompanhamento das obras e acesse as principais ações
            do seu dia.
          </p>
        </div>
        <Link
          href="/obras/nova"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app bg-accent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus aria-hidden="true" className="size-4" />
          Nova obra
        </Link>
      </section>

      <section aria-labelledby="atalhos" className="pt-8">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-app bg-surface-subtle text-foreground">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <div>
            <h2
              id="atalhos"
              className="font-display text-xl font-bold text-foreground"
            >
              Acesso rápido
            </h2>
            <p className="mt-1 text-sm text-muted">
              Continue de onde precisar.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-app border border-border bg-surface p-5 shadow-card transition-transform hover:-translate-y-0.5 hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid size-10 place-items-center rounded-app bg-accent text-foreground">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </div>
              <h3 className="mt-6 font-display text-base font-bold text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
