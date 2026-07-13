"use client";

import { rotuloUsuario, type UsuarioResumo } from "@/lib/ui/usuario-labels";

/**
 * Select de usuarios (ativos) por nome — o mesmo fluxo do Responsavel da obra.
 * `vazio` e o rotulo da opcao vazia (ex.: "Selecione..." ou "(voce)").
 */
export function SelecaoUsuario({
  usuarios,
  valor,
  onChange,
  vazio = "Selecione o usuário",
  required,
}: {
  usuarios: UsuarioResumo[];
  valor: string;
  onChange: (v: string) => void;
  vazio?: string;
  required?: boolean;
}) {
  const ativos = usuarios.filter((u) => u.ativo);
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      required={required}
    >
      <option value="">{vazio}</option>
      {ativos.map((u) => (
        <option key={u.id} value={u.id}>
          {rotuloUsuario(u)}
        </option>
      ))}
    </select>
  );
}
