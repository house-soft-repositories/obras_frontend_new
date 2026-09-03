import { env } from '@/core/config/enviroment_variables';
import { Interceptor, RequestConfig } from '@/core/types/http_client';

// Nunca logar em produção, mesmo com as flags NEXT_SHOW_LOGGING_* ligadas (V-14).
const IS_PRODUCTION = env.NODE_ENV === 'production'
const SENSITIVE_HEADERS = ['authorization', 'x-api-key', 'cookie', 'set-cookie'];

export class LogInterceptor implements Interceptor {
  constructor(
    private readonly loggingRequest: boolean,
    private readonly logginResponse: boolean,
    private readonly logginError: boolean
  ) {}

  async request(config: RequestConfig): Promise<RequestConfig> {
    if (this.loggingRequest && !IS_PRODUCTION) {
      console.log('\n', this.sanitize(config), '\n');
    }
    return config;
  }

  async response(response: Response): Promise<Response> {
    if (this.logginResponse && !IS_PRODUCTION) {
      console.log('\n', response, '\n');
      let body = null;
      try {
        // Clone a response para não consumir o stream original
        const responseClone = response.clone();
        body = await responseClone.json();
      } catch {
        body = {};
      } finally {
        console.log('\n Body:', body, '\n');
      }
    }
    return response;
  }

  async error(error: unknown): Promise<unknown> {
    if (this.logginError && !IS_PRODUCTION) {
      console.error('\n', error, '\n');
    }
    return error;
  }

  // Remove Authorization / API key dos logs de requisição.
  private sanitize(config: RequestConfig): RequestConfig {
    if (!config.headers) {
      return config;
    }
    const entries =
      config.headers instanceof Headers
        ? Object.fromEntries(config.headers.entries())
        : { ...(config.headers as Record<string, string>) };
    for (const key of Object.keys(entries)) {
      if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
        entries[key] = '[REDACTED]';
      }
    }
    return { ...config, headers: entries };
  }
}
