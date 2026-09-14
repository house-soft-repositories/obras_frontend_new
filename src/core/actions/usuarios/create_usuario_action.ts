"use server";

import { updateTag } from "next/cache";
import api from "@/core/rest_client/api";
import { userErrorTranslator } from "@/core/errors/user_error_translator";
import HttpClientException from "@/core/exceptions/http_client_exception";
import type { CreateUserOutput } from "@/core/schemas/user/create_user_schema";
import type { UsuarioOrganizational } from "@/core/schemas/user/user_schema";
import type ServerActionResult from "@/core/types/server_action_result";

export default async function createUsuarioAction(
  input: CreateUserOutput,
): Promise<ServerActionResult<UsuarioOrganizational>> {
  try {
    const response = await api.auth.post<UsuarioOrganizational>("/api/users", {
      body: JSON.stringify(input),
      headers: { "content-type": "application/json" },
    });
    updateTag("list-usuarios");
    return { success: true, data: response.data, error: null };
  } catch (error) {
    if (error instanceof HttpClientException) {
      return {
        success: false,
        data: null,
        error: userErrorTranslator.translate(error),
      };
    }
    throw error;
  }
}
