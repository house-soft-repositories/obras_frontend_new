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
import { privateRouteGroupsForRole, type Route } from "@/core/config/routes";
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

function isCurrentPath(pathname: string, href: string): boolean {
  if (href === "/home") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function renderRoute(pathname: string, route: Route, key: string) {
  const Icon = route.icon ? iconByName[route.icon] : undefined;
  const isActive = isCurrentPath(pathname, route.path);
  return (
    <Link
      key={key}
      href={route.path}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-app px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
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

/** Navegação client-side agrupada e filtrada pelas roles das rotas privadas. */
export function SidebarNavigation({ role, obraType }: { role?: UserRole | null, obraType: "OBRA_PUBLIC" | "OBRA_PRIVATE" }) {
  const pathname = usePathname() ?? "/home";
  const routeGroups = privateRouteGroupsForRole(role).filter((group => group.type === obraType || group.type === null))

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
                renderRoute(pathname, route, `${route.path}:${index}`),
              )}
            </div>
          </section>
        ))}
      </nav>
    </>
  );
}
