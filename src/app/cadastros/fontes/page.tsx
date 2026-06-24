import { FormularioCriar } from "@/components/formulario-criar";
import { Tabela } from "@/components/tabela";
import { apiServerFetch } from "@/lib/api/server";

type Fonte = {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
};

export default async function FontesPage() {
  let itens: Fonte[] = [];
  try {
    itens = await apiServerFetch<Fonte[]>("/fontes?ativo=true");
  } catch {
    itens = [];
  }
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Fontes de recurso</h1>
      <Tabela
        colunas={[
          { chave: "nome", titulo: "Nome" },
          { chave: "descricao", titulo: "Descricao" },
          { chave: "ativo", titulo: "Ativo" },
        ]}
        linhas={itens}
      />
      <FormularioCriar
        endpoint="fontes"
        titulo="Nova fonte"
        campos={[
          { nome: "nome", label: "Nome", obrigatorio: true },
          { nome: "descricao", label: "Descricao" },
        ]}
      />
    </main>
  );
}
