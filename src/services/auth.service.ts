import type {
  ApiErrorResponse,
  AuthUser,
  LoginCredentials,
  LoginResponse,
} from "../types/auth";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

const ACCESS_TOKEN_KEY = "waterfall_access_token";
const AUTH_USER_KEY = "waterfall_auth_user";

function getErrorMessage(error: ApiErrorResponse): string {
  if (Array.isArray(error.message)) {
    return error.message.join(", ");
  }

  if (typeof error.message === "string") {
    return error.message;
  }

  return "Unable to log in. Please try again.";
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Make sure the backend is running.",
    );
  }

  const data = (await response.json()) as
    | LoginResponse
    | ApiErrorResponse;

  if (!response.ok) {
    throw new Error(getErrorMessage(data as ApiErrorResponse));
  }

  return data as LoginResponse;
}

export function saveAuthSession(authData: LoginResponse): void {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    authData.accessToken,
  );

  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify(authData.user),
  );
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAuthenticatedUser(): AuthUser | null {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}

export function clearAuthSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}