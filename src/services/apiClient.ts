import { config } from '../config/config';

interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getHeaders(requiresAuth: boolean = false): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });

    if (requiresAuth) {
      const token = localStorage.getItem('adminToken');
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  private async refreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = new Promise(async (resolve, reject) => {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Failed to refresh token');
        }

        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('tokenExpiry', (Date.now() + 3600000).toString()); // 1 saat

        resolve(data.token);
      } catch (error) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('refreshToken');
        reject(error);
      } finally {
        this.refreshPromise = null;
      }
    });

    return this.refreshPromise;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      if (response.status === 401) {
        try {
          await this.refreshToken();
          return null; // Retry signal
        } catch (error) {
          throw new Error('Authentication failed');
        }
      }

      try {
        const error = await response.json();
        throw new Error(error.message || 'API error occurred');
      } catch (e) {
        throw new Error('API error occurred');
      }
    }

    try {
      const data = await response.json();
      if (!data) {
        throw new Error('Empty response received');
      }
      return data;
    } catch (e) {
      if (response.status === 204) {
        return null; // No content
      }
      throw new Error('Invalid JSON response');
    }
  }

  public async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { requiresAuth = false, ...fetchConfig } = config;
    const headers = await this.getHeaders(requiresAuth);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchConfig,
      headers,
    });

    const result = await this.handleResponse(response);
    if (result === null && response.status === 401) {
      // Retry the request with new token
      const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchConfig,
        headers: await this.getHeaders(requiresAuth),
      });
      return this.handleResponse(retryResponse);
    }

    return result;
  }

  public async get<T>(endpoint: string, requiresAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  public async post<T>(endpoint: string, data: any, requiresAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth,
    });
  }

  public async put<T>(endpoint: string, data: any, requiresAuth: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth,
    });
  }

  public async delete(endpoint: string, requiresAuth: boolean = false): Promise<void> {
    return this.request(endpoint, { method: 'DELETE', requiresAuth });
  }
}

export const apiClient = new ApiClient(config.apiUrl); 