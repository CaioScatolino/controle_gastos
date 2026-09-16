import { authStorage } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export interface ApiResponse<T = any> {
  error: string | null;
  data: T | null;
  details?: Array<{ field: string; message: string }>;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = authStorage.getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  try {
    const response = await fetch(`${API_BASE_URL}${cleanEndpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error:
          data?.error || `Erro na requisição (Status: ${response.status})`,
        data: null,
        details: data?.details,
      };
    }

    // Se o backend responder no padrão { error: null, data: ... }
    if (data && typeof data === "object" && "data" in data && "error" in data) {
      return data as ApiResponse<T>;
    }

    return {
      error: null,
      data: data as T,
    };
  } catch (err: any) {
    return {
      error:
        err.message || "Não foi possível conectar à API. Verifique se o servidor está ativo.",
      data: null,
    };
  }
}
