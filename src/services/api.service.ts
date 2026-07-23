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

  const isFormData = options.body instanceof FormData;

  if (!isFormData && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

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
  } else if (response.status !== 204) {
    data = await response.text();
  }

  if (!response.ok) {
    let message = "Request failed.";

    if (
      typeof data === "object" &&
      data !== null &&
      "message" in data
    ) {
      const responseMessage = (
        data as {
          message?: string | string[];
        }
      ).message;

      if (Array.isArray(responseMessage)) {
        message = responseMessage.join(" ");
      } else if (responseMessage) {
        message = responseMessage;
      }
    } else if (typeof data === "string" && data.trim()) {
      message = data;
    }

    throw new Error(message);
  }

  return data as T;
}

function prepareBody(body: unknown): BodyInit {
  if (body instanceof FormData) {
    return body;
  }

  return JSON.stringify(body);
}

export const api = {
  get<T>(endpoint: string) {
    return request<T>(endpoint);
  },

  post<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, {
      method: "POST",
      body: prepareBody(body),
    });
  },

  patch<T>(endpoint: string, body: unknown) {
    return request<T>(endpoint, {
      method: "PATCH",
      body: prepareBody(body),
    });
  },

  delete<T>(endpoint: string) {
    return request<T>(endpoint, {
      method: "DELETE",
    });
  },
};