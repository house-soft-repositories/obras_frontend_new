import { redirect } from "next/navigation";
import { auth } from "@/core/config/auth_options";
import { TenantContextRequiredCard } from "@/core/ui/layout/tenant-context-required-card";

function getSafeNextPath(next?: string): string | undefined {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return undefined;
  }

  if (next === "/selecionar-tenancy" || next.startsWith("/selecionar-tenancy?")) {
    return undefined;
  }

  return next;
}

export default async function SelecionarTenancyPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  const safeNextPath = getSafeNextPath((await searchParams).next);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.tenant) {
    redirect(safeNextPath ?? "/dashboard");
  }

  return <TenantContextRequiredCard redirectTo={safeNextPath} />;
}
