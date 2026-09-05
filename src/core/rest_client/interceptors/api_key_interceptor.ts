import { env } from '@/core/config/enviroment_variables';
import { Interceptor, RequestConfig } from '@/core/types/http_client';

export class ApiKeyInterceptor implements Interceptor {
  async request(config: RequestConfig): Promise<RequestConfig> {
    if (config.extra?.['API_KEY_REQUIRED']) {
      const apiKey = env.NEXT_API_KEY;

      if (!apiKey) {
        console.warn(
          'API_KEY_REQUIRED is true but NEXT_API_KEY environment variable is not set'
        );
        return config;
      }

      const existingHeaders = config.headers
        ? Object.fromEntries(
            config.headers instanceof Headers
              ? config.headers.entries()
              : Object.entries(config.headers)
          )
        : {};

      const newHeaders = {
        ...existingHeaders,
        'x-api-key': apiKey,
      };

      return {
        ...config,
        headers: newHeaders,
      };
    }
    return config;
  }

  async response(response: Response): Promise<Response> {
    return response;
  }

  async error(error: unknown): Promise<unknown> {
    return error;
  }
}
