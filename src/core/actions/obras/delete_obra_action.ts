"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";

export default async function deleteObraAction(id: string) {
  await api.auth.delete(`/api/obras/${id}`);
  updateTag("list-obras");
  updateTag(`obra-${id}`);
}
