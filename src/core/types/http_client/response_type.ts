import { RequestConfig } from '@/core/types/http_client/request_config';

export interface ResponseType<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
  config: RequestConfig;
}
