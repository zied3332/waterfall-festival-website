import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
} from "lucide-react";
import {
  type FormEvent,
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  isAuthenticated,
  login,
  saveAuthSession,
} from "../../services/auth.service";

import "../style/admin-login.css";

type LoginLocationState = {
  from?: string;
};

type AdminTheme = "light" | "dark";

const ADMIN_THEME_STORAGE_KEY =
  "waterfall-admin-theme";

function getInitialTheme(): AdminTheme {
  const storedTheme = localStorage.getItem(
    ADMIN_THEME_STORAGE_KEY,
  );

  if (
    storedTheme === "light" ||
    storedTheme === "dark"
  ) {
    return storedTheme;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

function getLoginErrorMessage(
  error: unknown,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const apiError = error as {
      response?: {
        data?: {
          message?: string | string[];
        };
      };
    };

    const responseMessage =
      apiError.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(" ");
    }

    if (typeof responseMessage === "string") {
      return responseMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to log in. Please try again.";
}

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();

  const locationState =
    location.state as LoginLocationState | null;

  const destination =
    locationState?.from &&
    locationState.from.startsWith("/admin") &&
    locationState.from !== "/admin/login"
      ? locationState.from
      : "/admin";

  const [theme, setTheme] =
    useState<AdminTheme>(getInitialTheme);

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    document.documentElement.dataset.adminTheme =
      theme;

    localStorage.setItem(
      ADMIN_THEME_STORAGE_KEY,
      theme,
    );
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate(destination, {
        replace: true,
      });
    }
  }, [destination, navigate]);

  function handleThemeToggle(): void {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light",
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setErrorMessage("");

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage(
        "Please enter your email address and password.",
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const authData = await login({
        email: normalizedEmail,
        password,
      });

      saveAuthSession(authData);

      navigate(destination, {
        replace: true,
      });
    } catch (error: unknown) {
      setErrorMessage(
        getLoginErrorMessage(error),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="admin-login-page">
      <button
        type="button"
        className="admin-login-theme-toggle"
        onClick={handleThemeToggle}
        aria-label={
          theme === "light"
            ? "Switch to dark mode"
            : "Switch to light mode"
        }
        title={
          theme === "light"
            ? "Dark mode"
            : "Light mode"
        }
      >
        {theme === "light" ? (
          <Moon size={18} aria-hidden="true" />
        ) : (
          <Sun size={18} aria-hidden="true" />
        )}
      </button>

      <section className="admin-login-shell">
        <header className="admin-login-brand">
          <span
            className="admin-login-brand__icon"
            aria-hidden="true"
          >
            <ShieldCheck size={23} />
          </span>

          <div>
            <span className="admin-login-brand__eyebrow">
              Waterfall Festival
            </span>

            <h1>Admin portal</h1>
          </div>
        </header>

        <section
          className="admin-login-card"
          aria-labelledby="admin-login-title"
        >
          <div className="admin-login-card__header">
            <span
              className="admin-login-card__lock"
              aria-hidden="true"
            >
              <LockKeyhole size={20} />
            </span>

            <div>
              <h2 id="admin-login-title">
                Welcome back
              </h2>

              <p>
                Sign in to manage events,
                tickets, gallery content and
                visitor messages.
              </p>
            </div>
          </div>

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="admin-login-field">
              <label htmlFor="admin-email">
                Email address
              </label>

              <div className="admin-login-input-wrapper">
                <Mail
                  size={17}
                  aria-hidden="true"
                />

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);

                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  placeholder="admin@waterfallfestival.com"
                  autoComplete="email"
                  autoFocus
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="admin-login-field">
              <label htmlFor="admin-password">
                Password
              </label>

              <div className="admin-login-input-wrapper">
                <LockKeyhole
                  size={17}
                  aria-hidden="true"
                />

                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(
                      event.target.value,
                    );

                    if (errorMessage) {
                      setErrorMessage("");
                    }
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {errorMessage && (
              <div
                className="admin-login-error"
                role="alert"
              >
                {errorMessage}
              </div>
            )}

            <button
              className="admin-login-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle
                    className="admin-login-spinner"
                    size={18}
                    aria-hidden="true"
                  />

                  Signing in
                </>
              ) : (
                <>
                  Sign in

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </>
              )}
            </button>
          </form>

          <footer className="admin-login-card__footer">
            <span
              className="admin-login-status-dot"
              aria-hidden="true"
            />

            Authorized administrators only
          </footer>
        </section>

        <p className="admin-login-copyright">
          Waterfall Festival Management System
        </p>
      </section>
    </main>
  );
}

export default AdminLogin;