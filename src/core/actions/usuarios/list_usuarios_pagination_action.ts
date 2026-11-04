"use server";

import api from "@/core/rest_client/api";
import type { UserRole, UsuarioOrganizational } from "@/core/schemas/user/user_schema";
import type PageParam from "@/core/types/pagination/page_param";
import type Pagination from "@/core/types/pagination/pagination";

export default async function listUsuariosPaginationAction({
  page,
  order,
  take,
  role,
}: PageParam & { role?: UserRole }) {
  const params = new URLSearchParams({
    page: page.toString(),
    order,
    take: take.toString(),
    ...(role ? { role } : {}),
  });

  const response = await api.auth.get<Pagination<UsuarioOrganizational>>(
    `/api/users?${params.toString()}`,
    { next: { tags: ["list-usuarios"] } },
  );
  return response.data;
}
