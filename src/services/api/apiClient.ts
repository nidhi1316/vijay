import { CONFIG } from '../../constants/config';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = CONFIG.API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', headers = {}, body, token, timeout = CONFIG.API_TIMEOUT_MS } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (error: any) {
      clearTimeout(timer);
      throw error;
    }
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
