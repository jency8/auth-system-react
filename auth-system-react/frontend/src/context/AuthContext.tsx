import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { TokenManager } from "../utils/tokenManager";
import apiClient from "../utils/apiClient";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

type Page = "login" | "register" | "dashboard";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  page: Page;
  setPage: (p: Page) => void;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string; errors?: { field: string; message: string }[] }>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("login");
  const [loading, setLoading] = useState(true);

  const goToDashboard = useCallback((userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
    setPage("dashboard");
  }, []);

  useEffect(() => {
    const check = async () => {
      const token = TokenManager.getAccessToken();
      const storedUser = TokenManager.getUser();
      if (!token || !storedUser) {
        setLoading(false);
        setPage("login");
        return;
      }
      const res = await apiClient.get<{ success: boolean; data: { user: User } }>("/auth/me");
      if (res.ok) {
        goToDashboard(res.data.data.user, token);
      } else {
        TokenManager.clear();
        setPage("login");
      }
      setLoading(false);
    };
    check();
  }, [goToDashboard]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: { user: User; accessToken: string } }>("/auth/login", { email, password });
    if (res.ok) {
      const { user: u, accessToken: tok } = res.data.data;
      TokenManager.setAccessToken(tok);
      TokenManager.setUser(u);
      setAccessToken(tok);
      goToDashboard(u, tok);
      return { ok: true };
    }
    return { ok: false, message: (res.data as Record<string, unknown>).message as string };
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await apiClient.post<{ success: boolean; message: string; data?: { user: User; accessToken: string }; errors?: { field: string; message: string }[] }>("/auth/register", { name, email, password });
    if (res.ok && res.data.data) {
      const { user: u, accessToken: tok } = res.data.data;
      TokenManager.setAccessToken(tok);
      TokenManager.setUser(u);
      setAccessToken(tok);
      goToDashboard(u, tok);
      return { ok: true };
    }
    return { ok: false, message: res.data.message, errors: res.data.errors };
  };

  const logout = async () => {
    await apiClient.post("/auth/logout", {});
    TokenManager.clear();
    setUser(null);
    setAccessToken(null);
    setPage("login");
  };

  const logoutAll = async () => {
    await apiClient.post("/auth/logout-all", {});
    TokenManager.clear();
    setUser(null);
    setAccessToken(null);
    setPage("login");
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, page, setPage, login, register, logout, logoutAll, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
