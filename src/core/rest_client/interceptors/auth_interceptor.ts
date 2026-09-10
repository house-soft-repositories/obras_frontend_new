import "server-only";

import { Interceptor, RequestConfig } from "@/core/types/http_client";
import {obterTokensDaSessao} from "@/core/config/server-tokens";
export class AuthInterceptor implements Interceptor {
  async request(config: RequestConfig): Promise<RequestConfig> {
    if (config.extra?.AUTH_REQUIRED === false) return config;
    if (typeof window !== "undefined") return config;

    const tokens = await obterTokensDaSessao();
    if (!tokens) return config


    const headers = new Headers(config.headers);

    if (!headers.has("authorization")) {
      headers.set("authorization", `Bearer ${tokens.accessToken}`);
    }

    return { ...config, headers };
  }

 
}
