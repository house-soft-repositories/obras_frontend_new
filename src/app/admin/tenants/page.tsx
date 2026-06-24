import { FormularioCriar } from "@/components/formulario-criar";
import { Tabela } from "@/components/tabela";
import { apiServerFetch } from "@/lib/api/server";

type Tenant = {
  id: string;
  nome: string;
  slug: string;
  ativo: boolean;
};

export default async function TenantsPage() {
  let tenants: Tenant[] = [];
  let erro: string | null = null;
  try {
    tenants = await apiServerFetch<Tenant[]>("/admin/tenants");
  } catch {
    erro = "Acesso restrito a SUPER_ADMIN ou API indisponivel.";
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Tenants (super-admin)</h1>
      {erro && <p style={{ color: "crimson" }}>{erro}</p>}
      <Tabela
        colunas={[
          { chave: "nome", titulo: "Nome" },
          { chave: "slug", titulo: "Slug" },
          { chave: "ativo", titulo: "Ativo" },
        ]}
        linhas={tenants}
      />
      <FormularioCriar
        endpoint="admin/tenants"
        titulo="Novo tenant"
        campos={[
          { nome: "nome", label: "Nome", obrigatorio: true },
          { nome: "slug", label: "Slug (kebab-case)", obrigatorio: true },
          { nome: "cnpj", label: "CNPJ" },
        ]}
      />
    </main>
  );
}
