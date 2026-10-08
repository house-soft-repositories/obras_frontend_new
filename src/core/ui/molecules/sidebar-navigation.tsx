"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChartNoAxesCombined,
  FileText,
  Gavel,
  HardHat,
  House,
  Landmark,
  MapPinned,
  Network,
  Shield,
  Users,
  Wallet,
  Layers,
  Tag,
  Tags,
  Shapes,
  Boxes,
} from "lucide-react";
import type { ComponentType } from "react";
import {
  findActiveRoute,
  privateRouteGroupsForRole,
  type Route,
} from "@/core/config/routes";
import { type UserRole } from "@/core/schemas/user/user_schema";
import switchObraTypeNavigationAction from "@/core/actions/navigation/switch_obra_navigation_action";

const iconByName: Record<string, ComponentType<{ className?: string }>> = {
  Building2,
  ChartNoAxesCombined,
  FileText,
  Gavel,
  HardHat,
  House,
  Landmark,
  MapPinned,
  Network,
  Shield,
  Users,
  Wallet,
  Layers,
  Tag,
  Tags,
  Shapes,
  Boxes,
};

function routeLink(
  route: Route,
  isActive: boolean,
  className: string,
) {
  const Icon = route.icon ? iconByName[route.icon] : undefined;
  return (
    <Link
      href={route.path}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-app px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className} ${
        isActive
          ? "bg-accent text-foreground"
          : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
      }`}
    >
      {Icon ? <Icon aria-hidden="true" className="size-[18px]" /> : null}
      {route.label}
    </Link>
  );
}

/**
 * Só filhos com path concreto viram item clicável; filho dinâmico (`:id`)
 * nunca é link — quando ele é o match, o pai assume o destaque (fallback).
 */
function visibleChildren(route: Route, role?: UserRole | null): Route[] {
  return (route.children ?? []).filter(
    (child) =>
      !child.path.includes(":") && role && child.roles?.includes(role),
  );
}

function renderRoute(
  route: Route,
  key: string,
  activeHref: string | null,
  role?: UserRole | null,
) {
  const children = visibleChildren(route, role);
  return (
    <div key={key} className="grid gap-1">
      {routeLink(route, route.path === activeHref, "")}
      {children.length > 0 ? (
        <ul
          aria-label={`Subseções de ${route.label}`}
          className="ml-4 grid gap-1 border-l border-sidebar-border pl-2"
        >
          {children.map((child) => (
            <li key={child.path}>
              {routeLink(child, child.path === activeHref, "min-h-10 text-[13px]")}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/** Navegação client-side agrupada e filtrada pelas roles das rotas privadas. */
export function SidebarNavigation({ role, obraType }: { role?: UserRole | null, obraType: "OBRA_PUBLIC" | "OBRA_PRIVATE" }) {
  const pathname = usePathname() ?? "/home";
  const routeGroups = privateRouteGroupsForRole(role).filter((group => group.type === obraType || group.type === null))

  // Match mais profundo (children antes do pai): em `/obras-privadas/mapa`
  // só o Mapa fica ativo. Detalhe dinâmico (`:id`) não é link — o pai assume.
  const active = findActiveRoute(
    routeGroups.flatMap((group) => group.routes),
    pathname,
  );
  const activeHref = active
    ? active.route.path.includes(":")
      ? (active.parent?.path ?? active.route.path)
      : active.route.path
    : null;

  return (
    <>
      <nav
        aria-label="Área de obras"
        className="mt-5 grid grid-cols-2 gap-1 rounded-app border border-sidebar-border p-1"
      >
        <Link
          href="/home"
          onClick={async (_) => {
            await switchObraTypeNavigationAction("OBRA_PUBLIC");
          }}
          className={`flex min-h-10 items-center justify-center rounded-[6px] px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              obraType === "OBRA_PRIVATE"
              ? "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
              : "bg-accent text-foreground"
          }`}
        >
          Públicas
        </Link>
        <Link
          href="/obras-privadas"
          onClick={async (_) => {
            await switchObraTypeNavigationAction("OBRA_PRIVATE");
          }}
          className={`flex min-h-10 items-center justify-center rounded-[6px] px-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
           obraType === "OBRA_PRIVATE"
              ? "bg-accent text-foreground"
              : "text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
          }`}
        >
          Privadas
        </Link>
      </nav>

      <nav aria-label="Navegação principal" className="mt-5 grid gap-5">
        {routeGroups.map((group) => (
          <section
            key={group.label}
            aria-labelledby={`route-group-${group.label}`}
          >
            <h2
              id={`route-group-${group.label}`}
              className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wider text-sidebar-muted"
            >
              {group.label}
            </h2>
            <div className="grid gap-1">
              {group.routes.map((route, index) =>
                renderRoute(route, `${route.path}:${index}`, activeHref, role),
              )}
            </div>
          </section>
        ))}
      </nav>
    </>
  );
}
