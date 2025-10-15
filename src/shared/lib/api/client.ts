import type { APIResponse, APIRequestConfig } from '../../types/api.types';
import { API_BASE_URL } from '../../constants/config';

export class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    config: APIRequestConfig = {}
  ): Promise<APIResponse<T>> {
    const { method = 'GET', headers = {}, body } = config;

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            message: data.error || 'Request failed',
            code: response.status.toString(),
          },
        };
      }

      return {
        success: true,
        data: data.data || data,
        meta: {
          timestamp: new Date().toISOString(),
          cached: data.cached || false,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  get<T>(endpoint: string, config?: APIRequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown, config?: APIRequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }
}

export const apiClient = new APIClient();
