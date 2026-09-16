import Link from "next/link";
import {
  Building2,
  ChartNoAxesCombined,
  FileText,
  FolderKanban,
  Users,
} from "lucide-react";
import { auth } from "@/core/config/auth_options";
import { saudacaoPorHora } from "@/core/utils/saudacao_por_hora";
import { Eyebrow, Heading, Caption } from "@/core/ui/atoms/typography";

const shortcuts = [
  {
    href: "/obras",
    title: "Obras públicas",
    description: "Acompanhe contratos, execução e medições.",
    icon: FolderKanban,
  },
  {
    href: "/obras-privadas",
    title: "Obras privadas",
    description: "Acompanhe licenciamento e fiscalizações.",
    icon: Building2,
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    description: "Indicadores físico-financeiros da carteira.",
    icon: ChartNoAxesCombined,
  },
  {
    href: "/relatorios/obras",
    title: "Relatórios",
    description: "Filtre, quantifique e exporte as obras.",
    icon: FileText,
  },
  {
    href: "/pessoas",
    title: "Pessoas",
    description: "Cadastre responsáveis e profissionais.",
    icon: Users,
  },
] as const;

export default async function HomePage() {
  const session = await auth();
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] ?? "";
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
          <Eyebrow>Painel inicial</Eyebrow>
          <Heading className="mt-1 text-3xl sm:text-4xl">{greeting}</Heading>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
            Escolha por onde continuar.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ver dashboard
          </Link>
          <Link
            href="/obras"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app bg-accent px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Ver obras
          </Link>
        </div>
      </section>

      <section aria-labelledby="atalhos" className="pt-10">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-app bg-surface-subtle text-foreground">
            <Building2 aria-hidden="true" className="size-5" />
          </span>
          <div>
            <Heading as="h2" id="atalhos" className="text-xl">
              Acesso rápido
            </Heading>
            <Caption className="mt-1">Continue de onde precisar.</Caption>
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shortcuts.map(({ href, title, description, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="group rounded-app border border-border bg-surface p-5 shadow-card transition-transform hover:-translate-y-0.5 hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-10 place-items-center rounded-app bg-accent text-foreground">
                <Icon aria-hidden="true" className="size-5" />
              </span>
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
