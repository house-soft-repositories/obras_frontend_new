import { FormularioCriar } from "@/components/formulario-criar";
import { OrgaoSetores } from "@/components/identidade/orgao-setores";
import { apiServerFetch } from "@/lib/api/server";

type Orgao = {
  id: string;
  nome: string;
  sigla: string | null;
  ativo: boolean;
};

export const dynamic = "force-dynamic";

export default async function OrgaosPage() {
  let itens: Orgao[] = [];
  try {
    itens = await apiServerFetch<Orgao[]>("/orgaos");
  } catch {
    itens = [];
  }
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Orgaos</h1>

      {itens.length === 0 && <p>Nenhum orgao cadastrado.</p>}
      <ul
        style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}
      >
        {itens.map((o) => (
          <li
            key={o.id}
            style={{
              border: "1px solid #e2e2e2",
              borderRadius: 6,
              padding: "8px 12px",
              opacity: o.ativo ? 1 : 0.6,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <strong>{o.nome}</strong>
              {o.sigla && <span style={{ color: "#888" }}>({o.sigla})</span>}
              {!o.ativo && <span style={{ fontSize: 12 }}>inativo</span>}
            </div>
            {/* Setores aninhados na tela do orgao (RN-IDE-03) */}
            <OrgaoSetores orgaoId={o.id} />
          </li>
        ))}
      </ul>

      <FormularioCriar
        endpoint="orgaos"
        titulo="Novo orgao"
        campos={[
          { nome: "nome", label: "Nome", obrigatorio: true },
          { nome: "localidadeId", label: "Localidade (id)", obrigatorio: true },
          { nome: "sigla", label: "Sigla" },
        ]}
      />
    </main>
  );
}
