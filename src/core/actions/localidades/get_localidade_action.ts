"use server";

import api from "@/core/rest_client/api";
import { LocalidadeSchema } from "@/core/schemas/localidade/localidade_schema";

export default async function getLocalidadeAction(id: string) {
  const response = await api.auth.get<LocalidadeSchema>(
    `/api/localidades/${id}`,
    {
      next: { tags: ["localidade", `localidade-${id}`] },
    },
  );
  return response.data;
}
