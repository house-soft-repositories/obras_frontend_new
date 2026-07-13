/** Resumo de usuario usado em selects e mapas de nome (GET /usuarios). */
export interface UsuarioResumo {
  id: string;
  nome: string;
  ativo: boolean;
  setorNome: string | null;
}

/**
 * Rotulo de exibicao do usuario: "Nome - Setor" quando ha setor, senao so o
 * nome. Puro (sem dependencia de servidor), reutilizavel em client e server.
 */
export function rotuloUsuario(u: {
  nome: string;
  setorNome?: string | null;
}): string {
  return u.setorNome ? `${u.nome} - ${u.setorNome}` : u.nome;
}
