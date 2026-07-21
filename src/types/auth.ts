export type UserRole = "ADMIN";

export type AuthUser = {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  user: AuthUser;
};

export type ApiErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};