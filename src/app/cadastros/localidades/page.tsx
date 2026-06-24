import { FormularioCriar } from "@/components/formulario-criar";
import { Tabela } from "@/components/tabela";
import { apiServerFetch } from "@/lib/api/server";

type Localidade = {
  id: string;
  municipio: string;
  uf: string;
};

export default async function LocalidadesPage() {
  let itens: Localidade[] = [];
  try {
    itens = await apiServerFetch<Localidade[]>("/localidades");
  } catch {
    itens = [];
  }
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Localidades</h1>
      <Tabela
        colunas={[
          { chave: "municipio", titulo: "Municipio" },
          { chave: "uf", titulo: "UF" },
        ]}
        linhas={itens}
      />
      <FormularioCriar
        endpoint="localidades"
        titulo="Nova localidade"
        campos={[
          { nome: "municipio", label: "Municipio", obrigatorio: true },
          { nome: "uf", label: "UF (2 letras)", obrigatorio: true },
          { nome: "codigoIbge", label: "Codigo IBGE" },
        ]}
      />
    </main>
  );
}
