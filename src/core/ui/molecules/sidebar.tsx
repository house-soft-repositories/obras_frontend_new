import Link from "next/link";
import { redirect } from "next/navigation";
import { HardHat, LogOut } from "lucide-react";
import { auth, signOut } from "@/core/config/auth_options";
import { SidebarNavigation } from "./sidebar-navigation";
import getObraNavigationTypeAction from "@/core/actions/navigation/get_obra_navigation_action";

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

async function logout() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

/**
 * Molecule server-side: a identificação exibida vem da sessão Auth.js e não
 * de estado do navegador ou de claims lidas no cliente.
 */
export async function Sidebar() {
  const [session, obraType] = await Promise.all([
    auth(),
    getObraNavigationTypeAction(),
  ]);
  if (!session?.user) redirect("/login");
  const { name, email, role } = session.user;

  return (
    <div
      data-slot="sidebar"
      className="flex h-full min-h-0 flex-col overflow-hidden bg-sidebar p-4 text-sidebar-foreground"
    >
      <Link
        href="/home"
        className="flex items-center gap-3 border-b border-sidebar-border px-2 pb-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="grid size-10 place-items-center rounded-app bg-accent text-foreground">
          <HardHat aria-hidden="true" className="size-5" />
        </span>
        <span>
          <span className="block font-display text-lg font-semibold tracking-tight text-sidebar-foreground">
            OBRAS GEST
          </span>
          <span className="mt-0.5 block text-xs text-sidebar-muted">
            Gestão inteligente de obras
          </span>
        </span>
      </Link>

      <div className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        <SidebarNavigation role={role} obraType={obraType} />
      </div>

      <div className="shrink-0 border-t border-sidebar-border px-2 pt-4">
        <div className="flex items-center gap-3 px-2">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-xs font-bold text-foreground"
            aria-hidden="true"
          >
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">
              {name}
            </p>
            <p className="truncate text-xs text-sidebar-muted">{email}</p>
          </div>
        </div>
        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="flex min-h-9 w-full items-center gap-2 rounded-app px-2 text-xs font-medium text-sidebar-muted transition-colors hover:bg-sidebar-hover hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut aria-hidden="true" className="size-3.5" />
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
