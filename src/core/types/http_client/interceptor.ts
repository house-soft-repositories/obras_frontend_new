import { RequestConfig } from '@/core/types/http_client/request_config';

export interface Interceptor {
  request?: (config: RequestConfig) => Promise<RequestConfig>;
  response?: (response: Response) => Promise<Response>;
  error?: (error: unknown) => Promise<unknown>;
}
