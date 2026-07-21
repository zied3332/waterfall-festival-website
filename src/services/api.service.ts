import { getAccessToken } from "./auth.service";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type RequestOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
};

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = getAccessToken();

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  let data: unknown = null;

  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data
        ? (data as { message?: string }).message
        : "Request failed.";

    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get<T>(endpoint: string) {
    return request<T>(endpoint);
  },

  post<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  patch<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete<T>(endpoint: string) {
    return request<T>(endpoint, {
      method: "DELETE",
    });
  },
};