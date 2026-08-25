import { DetalheObraPrivadaShell } from "@/components/obras-privadas/detalhe-shell";

export const dynamic = "force-dynamic";

/**
 * Shell do detalhe: trilha, cabecalho com chips e indicadores, e as 5 abas.
 * Carrega a obra uma unica vez e a compartilha por contexto com as abas.
 */
export default async function DetalheObraPrivadaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <DetalheObraPrivadaShell obraId={id}>{children}</DetalheObraPrivadaShell>
  );
}
