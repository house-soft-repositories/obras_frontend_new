import { Sidebar } from "@/core/ui/molecules/sidebar";
import { TenantAppBar } from "./tenant-app-bar";
import { auth } from "@/core/config/auth_options";
import listTenanciesAction from "@/core/actions/tenancies/list_tenancies_action";

export async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const tenants = session?.user?.role === "SUPERADMIN"
    ? (await listTenanciesAction()).filter((tenant) => tenant.active)
    : [];

  return (
    <div data-layout="private" className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 md:block">
        <Sidebar />
      </aside>
      <main className="min-w-0 flex-1">
        <TenantAppBar tenants={tenants} />
        {children}
      </main>
    </div>
  );
}
