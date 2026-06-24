import { EmpresasGestao } from "@/components/contratos/empresas-gestao";
import { podeEscrever, type EmpresaContratada } from "@/lib/api/contratos";
import { apiServerFetch } from "@/lib/api/server";
import { obterPerfilAtual } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

export default async function EmpresasContratadasPage() {
  let empresas: EmpresaContratada[] = [];
  try {
    empresas = await apiServerFetch<EmpresaContratada[]>(
      "/empresas-contratadas",
    );
  } catch {
    empresas = [];
  }
  const perfil = await obterPerfilAtual();

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Empresas contratadas</h1>
      <EmpresasGestao
        empresasIniciais={empresas}
        podeEditar={podeEscrever(perfil)}
      />
    </main>
  );
}
