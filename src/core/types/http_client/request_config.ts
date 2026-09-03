export interface RequestConfig extends RequestInit {
  baseURL?: string;
  extra?: Record<string, any>;
}
