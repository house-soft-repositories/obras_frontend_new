import Link from "next/link";
import { ObraForm } from "@/components/obras/obra-form";
import { carregarOpcoesObra } from "@/lib/api/obras-opcoes";

export const dynamic = "force-dynamic";

export default async function NovaObraPage() {
  const opcoes = await carregarOpcoesObra();
  return (
    <main style={{ padding: "1.5rem 1.75rem" }}>
      <nav
        aria-label="Trilha de navegação"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.45rem",
          fontSize: "0.85rem",
          marginBottom: "0.85rem",
        }}
      >
        <Link href="/obras" style={{ textDecoration: "none", fontWeight: 500 }}>
          Obras
        </Link>
        <span style={{ color: "var(--cor-texto-fraco)" }}>/</span>
        <span style={{ color: "var(--cor-texto-fraco)" }}>Nova obra</span>
      </nav>
      <h1 className="page-titulo">Nova obra</h1>
      <p className="page-sub" style={{ marginBottom: "1.25rem" }}>
        Cadastro de obra ou ação pública
      </p>
      <ObraForm modo="criar" opcoes={opcoes} />
    </main>
  );
}
