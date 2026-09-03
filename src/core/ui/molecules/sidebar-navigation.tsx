"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChartNoAxesCombined,
  HardHat,
  House,
  MapPinned,
  Plus,
  Settings2,
} from "lucide-react";

const publicNavigationItems = [
  { href: "/home", label: "Início", icon: House },
  { href: "/obras", label: "Obras públicas", icon: Building2 },
  { href: "/dashboard", label: "Dashboard", icon: ChartNoAxesCombined },
  { href: "/cadastros/orgaos", label: "Cadastros", icon: Settings2 },
] as const;

const privateNavigationItems = [
  { href: "/obras-privadas", label: "Obras privadas", icon: HardHat },
  { href: "/obras-privadas/mapa", label: "Mapa da cidade", icon: MapPinned },
  { href: "/obras-privadas/nova", label: "Nova obra privada", icon: Plus },
] as const;

function isCurrentPath(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === href;
  if (href === "/obras" && pathname === "/obras/nova") return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Navegação client-side para refletir rota e área ativa sem duplicar a sidebar. */
export function SidebarNavigation() {
  const pathname = usePathname() ?? "/home";
  const isPrivate = pathname.startsWith("/obras-privadas");
  const items = isPrivate ? privateNavigationItems : publicNavigationItems;

  return (
    <>
      <nav
        aria-label="Área de obras"
        className="mt-5 grid grid-cols-2 gap-1 rounded-app border border-sidebar-border p-1"
      >
        <Link
          href="/home"
          className={`flex min-h-10 items-center justify-center rounded-[6px] px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            !isPrivate
              ? "bg-accent text-foreground"
              : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
          }`}
        >
          Públicas
        </Link>
        <Link
          href="/obras-privadas"
          className={`flex min-h-10 items-center justify-center rounded-[6px] px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            isPrivate
              ? "bg-accent text-foreground"
              : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
          }`}
        >
          Privadas
        </Link>
      </nav>

      <nav aria-label="Navegação principal" className="mt-5 grid gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = isCurrentPath(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-app px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "bg-accent text-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
              }`}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
