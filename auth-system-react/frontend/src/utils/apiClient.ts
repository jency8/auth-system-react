import { TokenManager } from "./tokenManager";

const API_BASE = "/api";

type RequestOptions = RequestInit & { _retry?: boolean };

interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

const apiClient = {
  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const token = TokenManager.getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    const data = await res.json() as Record<string, unknown>;

    if (res.status === 401 && (data as Record<string, unknown>).code === "TOKEN_EXPIRED" && !options._retry) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.request<T>(endpoint, { ...options, _retry: true });
      }
      TokenManager.clear();
      window.location.reload();
      return { ok: false, status: 401, data: data as T };
    }

    return { ok: res.ok, status: res.status, data: data as T };
  },

  async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json() as Record<string, unknown>;
      const inner = (data.data as Record<string, unknown>);
      if (res.ok && inner?.accessToken) {
        TokenManager.setAccessToken(inner.accessToken as string);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  get<T = unknown>(url: string) {
    return this.request<T>(url, { method: "GET" });
  },
  post<T = unknown>(url: string, body: unknown) {
    return this.request<T>(url, { method: "POST", body: JSON.stringify(body) });
  },
  delete<T = unknown>(url: string) {
    return this.request<T>(url, { method: "DELETE" });
  },
};

export default apiClient;
