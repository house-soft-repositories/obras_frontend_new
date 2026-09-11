"use server";

import api from "@/core/rest_client/api";
import { z } from "zod";
import { updateSession } from "@/core/config/auth_options";
import { authTokensSchema } from "@/core/schemas/auth/auth_tokens";
import { accessTokenPayloadSchema, authenticatedUserSchema } from "@/core/schemas/auth/nextauth";
import HttpClientException from "@/core/exceptions/http_client_exception";
import type ServerActionResult from "@/core/types/server_action_result";

const switchTenancyResponseSchema = authTokensSchema.extend({
  tenancy: authenticatedUserSchema.shape.tenant.unwrap(),
});

type SwitchTenancyData = z.infer<typeof switchTenancyResponseSchema>["tenancy"];

function validarPayloadAccess(token: string) {
  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const resultado = accessTokenPayloadSchema.safeParse(JSON.parse(decoded));
    return resultado.success ? resultado.data : null;
  } catch {
    return null;
  }
}

export default async function switchTenancyAction(
  tenantId: string,
): Promise<ServerActionResult<SwitchTenancyData>> {
  try {
    const response = await api.auth.post<unknown>("/api/auth/switch-tenancy", {
      body: JSON.stringify({ tenantId }),
      headers: { "content-type": "application/json" },
    });
    const data = switchTenancyResponseSchema.parse(response.data);
    const payload = validarPayloadAccess(data.accessToken);

    if (!payload) {
      return { success: false, data: null, error: "Access token inválido no switch de tenancy." };
    }

    await updateSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpiresAt: payload.exp * 1000,
      tenant: data.tenancy,
    } as never);

    return { success: true, data: data.tenancy, error: null };
  } catch (error) {
    if (error instanceof HttpClientException) {
      return { success: false, data: null, error: error.message };
    }
    return { success: false, data: null, error: "Não foi possível trocar a tenancy." };
  }
}
