import HttpClientException from '@/core/exceptions/http_client_exception';
import {
  Interceptor,
  RequestConfig,
  ResponseType,
} from '@/core/types/http_client';

export class HttpClient {
  private static instance: HttpClient | null = null;
  private interceptors: Interceptor[] = [];
  private extra: Record<string, unknown> = {};

  private constructor(
    private readonly baseURL: string,
    private readonly config: RequestConfig = {}
  ) {
    this.baseURL = baseURL;
    this.config = config;
  }

  public static getInstance(baseURL: string): HttpClient {
    if (typeof window !== 'undefined') {
      if (!HttpClient.instance) {
        HttpClient.instance = new HttpClient(baseURL);
      }
      return HttpClient.instance;
    }
    return new HttpClient(baseURL);
  }

  public addInterceptor(interceptor: Interceptor): void {
    this.interceptors.push(interceptor);
  }

  public get auth(): HttpClient {
    this.extra['AUTH_REQUIRED'] = true;
    return this;
  }

  public get unauth(): HttpClient {
    this.extra['AUTH_REQUIRED'] = false;
    return this;
  }

  public get apiKey(): HttpClient {
    this.extra['API_KEY_REQUIRED'] = true;
    return this;
  }

  public get unApiKey(): HttpClient {
    this.extra['API_KEY_REQUIRED'] = false;
    return this;
  }

  private async runInterceptors(
    type: 'request' | 'response' | 'error',
    value: unknown
  ): Promise<unknown> {
    let result = value;

    for (const interceptor of this.interceptors) {
      if (interceptor[type]) {
        result = await interceptor[type]!(result);
      }
    }

    return result;
  }

  async request<T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<ResponseType<T>> {
    try {
      // Merge configurations
      const finalConfig: RequestConfig = {
        ...this.config,
        ...config,
        headers: {
          ...this.config.headers,
          ...config.headers,
        },
        extra: {
          ...this.extra,
          ...config.extra,
        },
      };

      const interceptedConfig = await this.runInterceptors(
        'request',
        finalConfig
      ) as RequestConfig;

      const fullUrl = this.baseURL + url;
      const response = await fetch(fullUrl, interceptedConfig);
      const responseForInterceptors = response.clone();

      await this.runInterceptors('response', responseForInterceptors);

      let data: unknown;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const rawMessage =
          typeof data === 'object' && data !== null && 'message' in data
            ? data.message
            : undefined;
        const message = Array.isArray(rawMessage)
          ? rawMessage.join(', ')
          : typeof rawMessage === 'string'
            ? rawMessage
            : 'Request failed';
        throw new HttpClientException(message, response.status);
      }

      return {
        data: data as T,
        status: response.status,
        headers: response.headers,
        config: finalConfig,
      };
    } catch (error) {
      const interceptedError = await this.runInterceptors('error', error);
      let isConnectionError = false;
      if (typeof error === 'object' && error !== null && 'code' in error) {
        if ((error as { code?: unknown }).code === 'ECONNREFUSED') {
          isConnectionError = true;
        }
      }
      if (
        error instanceof TypeError &&
        error.message &&
        (error.message.toLowerCase().includes('failed to fetch') ||
          error.message.toLowerCase().includes('fetch failed') ||
          error.message.toLowerCase().includes('networkerror') ||
          error.message.toLowerCase().includes('network request failed'))
      ) {
        isConnectionError = true;
      }
      if (isConnectionError) {
        throw new HttpClientException(
          'Desculpe o transtorno mas nosso servidor esta fora do ar',
          503
        );
      }

      if (error instanceof HttpClientException) {
        throw error;
      }
      if (interceptedError instanceof Error) {
        throw new HttpClientException(
          interceptedError.message || 'Unknown error',
          500
        );
      }
      throw interceptedError;
    }
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ResponseType<T>> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, config?: RequestConfig): Promise<ResponseType<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
    });
  }
  async put<T>(url: string, config?: RequestConfig): Promise<ResponseType<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
    });
  }
  async patch<T>(
    url: string,
    config?: RequestConfig
  ): Promise<ResponseType<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
    });
  }
  async delete<T>(
    url: string,
    config?: RequestConfig
  ): Promise<ResponseType<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'DELETE',
    });
  }

  async downloadFile(
    url: string,
    config?: RequestConfig
  ): Promise<{ blob: Blob; fileName: string; headers: Headers }> {
    try {
      // Merge configurations
      const finalConfig: RequestConfig = {
        ...this.config,
        ...(config || {}),
        headers: {
          ...this.config.headers,
          ...(config?.headers || {}),
        },
        extra: {
          ...this.extra,
          ...(config?.extra || {}),
        },
      };

      const interceptedConfig = await this.runInterceptors(
        'request',
        finalConfig
      ) as RequestConfig;

      const fullUrl = this.baseURL + url;
      const response = await fetch(fullUrl, interceptedConfig);
      const responseForInterceptors = response.clone();

      await this.runInterceptors('response', responseForInterceptors);

      if (!response.ok) {
        throw new HttpClientException('Download failed', response.status);
      }

      // 202: o arquivo ainda não existe (ex.: PDF do boleto sendo gerado
      // async por um worker) — o corpo é JSON, não binário. Tratar como uma
      // falha "ainda processando" em vez de devolver esse JSON como blob.
      if (response.status === 202) {
        const pendingBody = await response.json().catch(() => ({})) as {
          message?: string;
        };
        throw new HttpClientException(
          pendingBody.message || 'Arquivo ainda sendo processado',
          202,
          pendingBody
        );
      }

      // Obter o blob
      const blob = await response.blob();

      // Extrair nome do arquivo do header Content-Disposition
      const contentDisposition =
        response.headers.get('content-disposition') || '';
      let fileName = 'download';
      const matches = contentDisposition.match(/filename="?([^"]+)"?/);
      if (matches) {
        fileName = matches[1];
      }

      return {
        blob,
        fileName,
        headers: response.headers,
      };
    } catch (error) {
      const interceptedError = await this.runInterceptors('error', error);

      if (error instanceof HttpClientException) {
        throw error;
      }
      if (interceptedError instanceof Error) {
        throw new HttpClientException(
          interceptedError.message || 'Download failed',
          500
        );
      }
      throw interceptedError;
    }
  }
}
