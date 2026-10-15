import {
  getAccessToken,
} from "./auth.service";

// Vite substitutes these values at build time. Production falls back to the
// current origin (for a reverse proxy), never a development-only port.
export const API_URL = (
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.DEV ? `http://${window.location.hostname}:3000` : window.location.origin)
).replace(/\/+$/, "");

type RequestOptions =
  Omit<
    RequestInit,
    "headers"
  > & {
    headers?:
      HeadersInit;
  };

/** Resolve backend media paths independently of an API prefix such as /api.
 * Absolute legacy URLs are validated and preserved. Invalid input is absent
 * media, not a request for the current document or an invented API path.
 */
export function getApiMediaUrl(mediaUrl: string | null | undefined): string | null {
  if (typeof mediaUrl !== "string") return null;
  const value = mediaUrl.trim();
  if (!value || [...value].some(character => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127 || character === "\\") || /%(?![0-9a-f]{2})/i.test(value)) return null;
  if (/^blob:.+/i.test(value) || /^data:(image|video)\/[a-z0-9.+-]+[;,]/i.test(value)) return value;

  try {
    const base = new URL(API_URL, window.location.origin);
    if (!/^https?:$/.test(base.protocol)) return null;
    if (/^https?:\/\//i.test(value)) {
      const absolute = new URL(value);
      return absolute.hostname && !absolute.username && !absolute.password ? value : null;
    }
    if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return null;
    if (value.startsWith("//")) {
      const absolute = new URL(value, base.origin);
      return absolute.hostname && !absolute.username && !absolute.password ? absolute.href : null;
    }
    // Retain relative media filenames/paths, but reject arbitrary text and
    // query-only values that would fetch a page rather than a media resource.
    if (!value.startsWith("/") && !/^[^:/?#]+\//.test(value) && !/^[^:/?#]+\.[a-z0-9]+(?:[?#]|$)/i.test(value)) return null;
    return new URL(value.startsWith("/") ? value : `/${value}`, base.origin).href;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(
  endpoint: string,
  options:
    RequestOptions = {},
): Promise<T> {
  const token =
    getAccessToken();

  const headers =
    new Headers(
      options.headers,
    );

  const isFormData =
    options.body instanceof
    FormData;

  if (
    !isFormData &&
    options.body !==
      undefined
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers,
      },
    );

  let data:
    unknown = null;

  const contentType =
    response.headers.get(
      "content-type",
    );

  if (
    contentType?.includes(
      "application/json",
    )
  ) {
    data =
      await response.json();
  } else if (
    response.status !==
    204
  ) {
    data =
      await response.text();
  }

  if (!response.ok) {
    let message =
      "Request failed.";

    if (
      typeof data ===
        "object" &&
      data !== null &&
      "message" in data
    ) {
      const responseMessage =
        (
          data as {
            message?:
              | string
              | string[];
          }
        ).message;

      if (
        Array.isArray(
          responseMessage,
        )
      ) {
        message =
          responseMessage.join(
            " ",
          );
      } else if (
        responseMessage
      ) {
        message =
          responseMessage;
      }
    } else if (
      typeof data ===
        "string" &&
      data.trim()
    ) {
      message =
        data;
    }

    throw new ApiError(message, response.status);
  }

  return data as T;
}

function prepareBody(
  body: unknown,
): BodyInit {
  if (
    body instanceof
    FormData
  ) {
    return body;
  }

  return JSON.stringify(
    body,
  );
}

export const api = {
  get<T>(
    endpoint: string,
  ) {
    return request<T>(
      endpoint,
    );
  },

  post<T>(
    endpoint: string,
    body: unknown,
  ) {
    return request<T>(
      endpoint,
      {
        method:
          "POST",

        body:
          prepareBody(
            body,
          ),
      },
    );
  },

  patch<T>(
    endpoint: string,
    body: unknown,
  ) {
    return request<T>(
      endpoint,
      {
        method:
          "PATCH",

        body:
          prepareBody(
            body,
          ),
      },
    );
  },

  delete<T>(
    endpoint: string,
    body?: unknown,
  ) {
    return request<T>(
      endpoint,
      {
        method:
          "DELETE",
        ...(body === undefined ? {} : { body: prepareBody(body) }),
      },
    );
  },
};