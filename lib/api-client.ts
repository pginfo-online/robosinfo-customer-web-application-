// =====================================================================
// Customer Web Platform — Production Axios API Client
// =====================================================================

import axios, { AxiosError } from 'axios';
import { APP_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from './constants';

export const apiClient = axios.create({
  baseURL: APP_CONFIG.apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    } else if (token === 'undefined' || token === 'null') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    }
    config.headers['X-Correlation-ID'] = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const resData = response.data;
    // Backend wraps response in { success: boolean, data: T, message?: string }
    if (resData && typeof resData === 'object' && 'data' in resData) {
      return resData.data;
    }
    return resData;
  },
  async (error: AxiosError<{ message?: string; detail?: string }>) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers['X-Retry']) {
      originalRequest.headers['X-Retry'] = 'true';
      try {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const res = await axios.post(`${APP_CONFIG.apiUrl}${API_ENDPOINTS.REFRESH}`, {
            refreshToken,
          });
          const newTokens = res.data?.data || res.data;
          const newAccessToken = newTokens?.accessToken;
          const newRefreshToken = newTokens?.refreshToken;

          if (newAccessToken) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  get: <T>(url: string, params?: Record<string, unknown>): Promise<T> =>
    apiClient.get(url, { params }).then((r) => r as unknown as T),
  post: <T>(url: string, data?: unknown): Promise<T> =>
    apiClient.post(url, data).then((r) => r as unknown as T),
  put: <T>(url: string, data?: unknown): Promise<T> =>
    apiClient.put(url, data).then((r) => r as unknown as T),
  patch: <T>(url: string, data?: unknown): Promise<T> =>
    apiClient.patch(url, data).then((r) => r as unknown as T),
  delete: <T>(url: string): Promise<T> =>
    apiClient.delete(url).then((r) => r as unknown as T),
};
