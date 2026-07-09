const BASE_URL = 'http://localhost:8080/api';

interface ApiError {
  status: number;
  message: string;
}

class ApiServiceError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiServiceError';
    this.status = status;
  }
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('shopflow-token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody: ApiError = await response.json();
      message = errorBody.message || message;
    } catch {
      // Response body wasn't JSON, use default message
    }
    throw new ApiServiceError(response.status, message);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export const api = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(response);
  },

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return handleResponse<T>(response);
  },

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<T>(response);
  },
};

export { ApiServiceError };
export type { ApiError };
