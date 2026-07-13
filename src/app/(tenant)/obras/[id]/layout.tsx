import { DetalheObraShell } from "@/components/obras/detalhe/detalhe-obra-shell";

/**
 * Layout do detalhe unificado da obra (RF-14): breadcrumb, cabecalho e abas
 * (Dados, Cronograma, Contrato, Medições, Financeiro, Arquivos) envolvendo
 * todas as rotas filhas de /obras/[id]. As URLs existentes nao mudam.
 */
export default async function ObraDetalheLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DetalheObraShell obraId={id}>{children}</DetalheObraShell>;
}
