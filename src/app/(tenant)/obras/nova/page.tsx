import { ObraForm } from "@/components/obras/obra-form";
import { carregarOpcoesObra } from "@/lib/api/obras-opcoes";

export const dynamic = "force-dynamic";

export default async function NovaObraPage() {
  const opcoes = await carregarOpcoesObra();
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Nova obra</h1>
      <ObraForm modo="criar" opcoes={opcoes} />
    </main>
  );
}
