"use client";

import { DataTable } from "@/components/ui/data-table";
import type { UsuarioOrganizational } from "@/core/schemas/user/user_schema";

function formatNullable(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UsuariosTable({
  usuarios,
}: {
  usuarios: UsuarioOrganizational[];
}) {
  return (
    <DataTable<UsuarioOrganizational>
      title="Usuários cadastrados"
      data={usuarios}
      getRowId={(usuario) => usuario.id}
      renderCardTitle={(usuario) => usuario.name}
      renderCardStatus={(usuario) => usuario.role}
      pageSize={10}
      columns={[
        { id: "name", header: "Nome", cell: (usuario) => usuario.name },
        { id: "email", header: "E-mail", cell: (usuario) => usuario.email },
        { id: "role", header: "Perfil", cell: (usuario) => usuario.role },
        {
          id: "orgao",
          header: "Órgão",
          cell: (usuario) => formatNullable(usuario.orgao?.nome),
        },
        {
          id: "setor",
          header: "Setor",
          cell: (usuario) => formatNullable(usuario.setor?.nome),
        },
        {
          id: "createdAt",
          header: "Criado em",
          cell: (usuario) => formatDate(usuario.createdAt),
        },
      ]}
    />
  );
}
