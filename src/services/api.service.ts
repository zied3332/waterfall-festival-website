import {
  getAccessToken,
} from "./auth.service";

export const API_URL =
  (
    import.meta.env.VITE_API_URL ??
    `http://${window.location.hostname}:3000`
  ).replace(
    /\/+$/,
    "",
  );

type RequestOptions =
  Omit<
    RequestInit,
    "headers"
  > & {
    headers?:
      HeadersInit;
  };

/**
 * Converts a media path returned by the backend
 * into a URL that the browser can load.
 *
 * Examples:
 *
 * /uploads/events/event-12.jpg
 * ->
 * http://localhost:3000/uploads/events/event-12.jpg
 *
 * Existing absolute URLs are preserved.
 */
export function getApiMediaUrl(
  mediaUrl:
    | string
    | null
    | undefined,
): string | null {
  if (!mediaUrl) {
    return null;
  }

  const trimmedUrl =
    mediaUrl.trim();

  if (!trimmedUrl) {
    return null;
  }

  /*
   * Blob URLs are used by the EventForm
   * while previewing a newly selected file.
   */
  if (
    trimmedUrl.startsWith(
      "blob:",
    )
  ) {
    return trimmedUrl;
  }

  /*
   * Data URLs can also be used directly.
   */
  if (
    trimmedUrl.startsWith(
      "data:",
    )
  ) {
    return trimmedUrl;
  }

  /*
   * Preserve existing absolute URLs.
   *
   * This also means old Cloudinary records
   * continue to behave normally until those
   * posters are replaced.
   */
  if (
    /^https?:\/\//i.test(
      trimmedUrl,
    )
  ) {
    return trimmedUrl;
  }

  /*
   * Backend-generated local paths.
   */
  if (
    trimmedUrl.startsWith(
      "/",
    )
  ) {
    return `${API_URL}${trimmedUrl}`;
  }

  return `${API_URL}/${trimmedUrl}`;
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

    throw new Error(
      message,
    );
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
  ) {
    return request<T>(
      endpoint,
      {
        method:
          "DELETE",
      },
    );
  },
};