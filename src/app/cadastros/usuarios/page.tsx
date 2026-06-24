import { FormularioCriar } from "@/components/formulario-criar";
import { Tabela } from "@/components/tabela";
import { apiServerFetch } from "@/lib/api/server";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  ultimoAcessoEm: string | null;
};

export default async function UsuariosPage() {
  let itens: Usuario[] = [];
  try {
    itens = await apiServerFetch<Usuario[]>("/usuarios");
  } catch {
    itens = [];
  }
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1>Usuarios</h1>
      <Tabela
        colunas={[
          { chave: "nome", titulo: "Nome" },
          { chave: "email", titulo: "E-mail" },
          { chave: "ativo", titulo: "Ativo" },
          { chave: "ultimoAcessoEm", titulo: "Ultimo acesso" },
        ]}
        linhas={itens}
      />
      <FormularioCriar
        endpoint="usuarios"
        titulo="Novo usuario"
        campos={[
          { nome: "nome", label: "Nome", obrigatorio: true },
          { nome: "email", label: "E-mail", tipo: "email", obrigatorio: true },
          {
            nome: "senha",
            label: "Senha inicial",
            tipo: "password",
            obrigatorio: true,
          },
          { nome: "orgaoId", label: "Orgao (id)", obrigatorio: true },
          { nome: "setorId", label: "Setor (id, opcional)" },
          { nome: "localidadeId", label: "Localidade (id, opcional)" },
        ]}
      />
    </main>
  );
}
