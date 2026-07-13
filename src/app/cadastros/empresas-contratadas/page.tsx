import {
  EmpresasGestao,
  type EmpresaListagemItem,
} from "@/components/contratos/empresas-gestao";
import { podeEscrever } from "@/lib/api/contratos";
import { apiServerFetch } from "@/lib/api/server";
import { obterPerfilAtual } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

export default async function EmpresasContratadasPage() {
  let empresas: EmpresaListagemItem[] = [];
  try {
    empresas = await apiServerFetch<EmpresaListagemItem[]>(
      "/empresas-contratadas",
    );
  } catch {
    empresas = [];
  }
  const perfil = await obterPerfilAtual();

  return (
    <EmpresasGestao
      empresasIniciais={empresas}
      podeEditar={podeEscrever(perfil)}
    />
  );
}
