import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/admin", {
        replace: true,
      });
    }
  }, [navigate]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
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
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to log in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="admin-login-page">
      <div
        className="admin-login-page__glow admin-login-page__glow--left"
        aria-hidden="true"
      />

      <div
        className="admin-login-page__glow admin-login-page__glow--right"
        aria-hidden="true"
      />

      <div className="admin-login-shell">
        <div className="admin-login-brand">
          <div className="admin-login-brand__icon">
            <ShieldCheck size={28} />
          </div>

          <div>
            <p className="admin-login-brand__eyebrow">
              Waterfall Festival
            </p>

            <h1>Admin Portal</h1>
          </div>
        </div>

        <div className="admin-login-card">
          <div className="admin-login-card__header">
            <div className="admin-login-card__lock">
              <LockKeyhole size={25} />
            </div>

            <div>
              <h2>Welcome back</h2>

              <p>
                Sign in to manage events, tickets,
                gallery content and messages.
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
                <Mail size={18} aria-hidden="true" />

                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="admin@waterfallfestival.com"
                  autoComplete="email"
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
                  size={18}
                  aria-hidden="true"
                />

                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
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
                    size={19}
                  />

                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          <div className="admin-login-card__footer">
            <span className="admin-login-status-dot" />

            Authorized administrators only
          </div>
        </div>

        <p className="admin-login-copyright">
          Waterfall Festival Management System
        </p>
      </div>
    </section>
  );
}

export default AdminLogin;