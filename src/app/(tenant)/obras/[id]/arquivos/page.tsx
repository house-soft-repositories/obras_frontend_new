import { NavegadorArquivos } from "@/components/documentos/navegador-arquivos";
import { podeEscrever } from "@/lib/api/contratos";
import type { Pasta } from "@/lib/api/documentos";
import { apiServerFetch } from "@/lib/api/server";
import { obterPerfilAtual } from "@/lib/auth/perfil";

export const dynamic = "force-dynamic";

export default async function ArquivosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: obraId } = await params;

  const [raiz, perfil] = await Promise.all([
    apiServerFetch<Pasta>(`/obras/${obraId}/pastas/raiz`),
    obterPerfilAtual(),
  ]);

  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Arquivos da obra</h1>
      <NavegadorArquivos
        obraId={obraId}
        raiz={raiz}
        podeEditar={podeEscrever(perfil)}
      />
    </main>
  );
}
