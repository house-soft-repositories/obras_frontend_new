import type { ReactNode } from "react";
import { Sidebar } from "@/core/ui/molecules/sidebar";
import { auth } from "@/core/config/auth_options";
import { apiServerFetch } from "@/lib/api/server";
import { PrivateShell } from "./private-shell";
import type { TenancyOpcao } from "./tenancy-switcher";

interface PrivateLayoutProps {
  children: ReactNode;
}

/** Estrutura comum de todas as rotas que exigem sessão autenticada. */
export async function PrivateLayout({ children }: PrivateLayoutProps) {
  const session = await auth();
  let tenancies: TenancyOpcao[] = [];

  if (session?.user.role === "SUPERADMIN") {
    try {
      const dados = await apiServerFetch<TenancyOpcao[]>("/api/tenancies");
      tenancies = dados.filter((tenancy) => tenancy.active);
    } catch {
      // A App Bar continua funcional; o seletor informa ausência de opções.
    }
  }

  return (
    <PrivateShell sidebar={<Sidebar />} tenancies={tenancies}>
      {children}
    </PrivateShell>
  );
}
