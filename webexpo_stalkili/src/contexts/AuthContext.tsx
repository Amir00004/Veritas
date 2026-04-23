"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { API_BASE_URL, apiRequest } from "@/lib/api";

type AuthUser = {
  email: string;
  full_name?: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string;
  refreshToken: string;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(data: unknown, fallback: string) {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return fallback;

  const record = data as Record<string, unknown>;
  if (typeof record.detail === "string") return record.detail;

  for (const value of Object.values(record)) {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && value.length > 0) return String(value[0]);
  }
  return fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [isInitializing, setIsInitializing] = useState(() => {
    if (typeof window === "undefined") return true;
    return Boolean(localStorage.getItem("veritas_access_token"));
  });

  const persistTokens = (nextAccess: string, nextRefresh: string, email: string) => {
    setAccessToken(nextAccess);
    setRefreshToken(nextRefresh);
    localStorage.setItem("veritas_access_token", nextAccess);
    localStorage.setItem("veritas_refresh_token", nextRefresh);
    localStorage.setItem("veritas_email", email);
  };

  const clearAuth = () => {
    setAccessToken("");
    setRefreshToken("");
    setUser(null);
    localStorage.removeItem("veritas_access_token");
    localStorage.removeItem("veritas_refresh_token");
    localStorage.removeItem("veritas_email");
  };

  const fetchMe = async () => {
    const response = await apiRequest("/api/me/", { method: "GET", auth: true });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to fetch current user."));
    }

    setUser({
      email: data.email,
      full_name: data.full_name,
    });
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok || !data?.access || !data?.refresh) {
      throw new Error(getErrorMessage(data, "Invalid credentials."));
    }

    persistTokens(data.access, data.refresh, email);
    await fetchMe();
  };

  const register = async (payload: RegisterPayload) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Registration failed."));
    }
  };

  const logout = () => {
    clearAuth();
  };

  useEffect(() => {
    const storedAccess = localStorage.getItem("veritas_access_token") ?? "";
    const storedRefresh = localStorage.getItem("veritas_refresh_token") ?? "";
    const storedEmail = localStorage.getItem("veritas_email") ?? "";

    if (!storedAccess) {
      Promise.resolve().then(() => setIsInitializing(false));
      return;
    }

    setAccessToken(storedAccess);
    setRefreshToken(storedRefresh);
    if (storedEmail) {
      setUser({ email: storedEmail });
    }

    fetchMe()
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: Boolean(accessToken),
      isInitializing,
      login,
      register,
      logout,
      fetchMe,
    }),
    [user, accessToken, refreshToken, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
