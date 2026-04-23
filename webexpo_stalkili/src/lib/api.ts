export const API_BASE_URL = "http://localhost:8000";

type RequestOptions = RequestInit & {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

function getStoredAccessToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("veritas_access_token") ?? "";
}

function getStoredRefreshToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("veritas_refresh_token") ?? "";
}

async function refreshAccessToken(): Promise<string> {
  const refresh = getStoredRefreshToken();
  if (!refresh) {
    throw new Error("No refresh token available.");
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  const data = await response.json();
  if (!response.ok || !data?.access) {
    throw new Error(data?.detail || "Token refresh failed.");
  }

  localStorage.setItem("veritas_access_token", data.access);
  return data.access;
}

export async function apiRequest(path: string, options: RequestOptions = {}) {
  const { auth = true, retryOnUnauthorized = true, headers, ...rest } = options;
  const mergedHeaders = new Headers(headers ?? {});

  if (!mergedHeaders.has("Content-Type") && rest.body) {
    mergedHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getStoredAccessToken();
    if (token) {
      mergedHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const makeRequest = () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: mergedHeaders,
    });

  let response = await makeRequest();

  if (auth && retryOnUnauthorized && response.status === 401) {
    try {
      const nextAccess = await refreshAccessToken();
      mergedHeaders.set("Authorization", `Bearer ${nextAccess}`);
      response = await makeRequest();
    } catch {
      localStorage.removeItem("veritas_access_token");
      localStorage.removeItem("veritas_refresh_token");
      localStorage.removeItem("veritas_email");
    }
  }

  return response;
}
