import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CalendarRange,
  ChevronDown,
  CircleHelp,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Ticket,
  UserRound,
  X,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import backLogo from "./back_logo.png";
import NotificationBell from "./components/NotificationBell";

import type {
  AdminNotification,
} from "../services/notifications.service";

import {
  clearAuthSession,
  getAuthenticatedUser,
} from "../services/auth.service";

import "./style/admin.css";

type AdminTheme = "light" | "dark";

type PageDetails = {
  title: string;
  description: string;
};

const ADMIN_THEME_STORAGE_KEY =
  "waterfall-admin-theme";

const pageDetailsByPath: Record<
  string,
  PageDetails
> = {
  "/admin": {
    title: "Dashboard",
    description:
      "Overview of the Waterfall Festival website.",
  },
  "/admin/events": {
    title: "Events",
    description:
      "Create, edit and manage festival events.",
  },
  "/admin/events/create": {
    title: "Create event",
    description:
      "Add a new event to the festival website.",
  },
  "/admin/calendar": {
    title: "Calendar",
    description:
      "View and schedule festival events by date.",
  },
  "/admin/tickets": {
    title: "Tickets",
    description:
      "Manage ticket categories, prices and availability.",
  },
  "/admin/gallery": {
    title: "Gallery",
    description:
      "Upload and organize festival gallery content.",
  },
  "/admin/experience": {
    title: "Experience",
    description:
      "Manage the public festival experience page.",
  },
  "/admin/faq": {
    title: "FAQ",
    description:
      "Manage frequently asked questions and answers.",
  },
  "/admin/messages": {
    title: "Messages",
    description:
      "Review and respond to visitor inquiries.",
  },
  "/admin/settings": {
    title: "Settings",
    description:
      "Configure website and administration preferences.",
  },
};

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

function getPageDetails(
  pathname: string,
): PageDetails {
  if (
    pathname.startsWith("/admin/events/") &&
    pathname.endsWith("/edit")
  ) {
    return {
      title: "Edit event",
      description:
        "Update event information and publishing settings.",
    };
  }

  return (
    pageDetailsByPath[pathname] ?? {
      title: "Admin",
      description:
        "Manage Waterfall Festival website content.",
    }
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] =
    useState<AdminTheme>(getInitialTheme);

  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  const [isProfileMenuOpen, setIsProfileMenuOpen] =
    useState(false);

  const currentUser = getAuthenticatedUser();

  const adminName =
    [currentUser?.firstName, currentUser?.lastName]
      .filter(Boolean)
      .join(" ") ||
    currentUser?.email ||
    "Admin";

  const adminInitials = useMemo(() => {
    const firstInitial =
      currentUser?.firstName?.trim().charAt(0);

    const lastInitial =
      currentUser?.lastName?.trim().charAt(0);

    const initials = `${firstInitial ?? ""}${
      lastInitial ?? ""
    }`.toUpperCase();

    if (initials) {
      return initials;
    }

    return adminName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  }, [
    adminName,
    currentUser?.firstName,
    currentUser?.lastName,
  ]);

  const pageDetails = getPageDetails(
    location.pathname,
  );

  useEffect(() => {
    document.documentElement.dataset.adminTheme =
      theme;

    localStorage.setItem(
      ADMIN_THEME_STORAGE_KEY,
      theme,
    );
  }, [theme]);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  function handleThemeToggle(): void {
    setTheme((currentTheme) =>
      currentTheme === "light"
        ? "dark"
        : "light",
    );
  }

  function handleLogout(): void {
    clearAuthSession();

    navigate("/admin/login", {
      replace: true,
    });
  }

  function handleNotificationClick(
    notification: AdminNotification,
  ): void {
    if (notification.link) {
      navigate(notification.link);
    }
  }

  return (
    <div className="admin-layout">
      <button
        className={`admin-sidebar-backdrop ${
          isSidebarOpen
            ? "admin-sidebar-backdrop--visible"
            : ""
        }`}
        type="button"
        aria-label="Close navigation"
        onClick={() =>
          setIsSidebarOpen(false)
        }
      />

      <aside
        className={`admin-sidebar ${
          isSidebarOpen
            ? "admin-sidebar--open"
            : ""
        }`}
      >
        <div className="admin-sidebar-header">
          <NavLink
            className="admin-brand"
            to="/admin"
            aria-label="Waterfall admin dashboard"
          >
            <div className="admin-brand-mark">
              <img
                src={backLogo}
                alt=""
                className="admin-brand-logo"
                aria-hidden="true"
              />
            </div>

            <span className="admin-brand-copy">
              <strong>Waterfall</strong>
              <small>Admin panel</small>
            </span>
          </NavLink>

          <button
            className="admin-sidebar-close"
            type="button"
            aria-label="Close navigation"
            onClick={() =>
              setIsSidebarOpen(false)
            }
          >
            <X size={19} />
          </button>
        </div>

        <div className="admin-sidebar-section">
          <span className="admin-sidebar-label">
            Main menu
          </span>

          <nav
            className="admin-nav"
            aria-label="Admin navigation"
          >
            <NavLink to="/admin" end>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/admin/events">
              <CalendarDays size={18} />
              <span>Events</span>
            </NavLink>

            <NavLink to="/admin/calendar">
              <CalendarRange size={18} />
              <span>Calendar</span>
            </NavLink>

            <NavLink to="/admin/tickets">
              <Ticket size={18} />
              <span>Tickets</span>
            </NavLink>

            <NavLink to="/admin/gallery">
              <Images size={18} />
              <span>Gallery</span>
            </NavLink>

            <NavLink to="/admin/experience">
              <Sparkles size={18} />
              <span>Experience</span>
            </NavLink>

            <NavLink to="/admin/faq">
              <CircleHelp size={18} />
              <span>FAQ</span>
            </NavLink>

            <NavLink to="/admin/messages">
              <MessageSquare size={18} />
              <span>Messages</span>
            </NavLink>
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <NavLink
            className="admin-sidebar-settings"
            to="/admin/settings"
          >
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>

          <div className="admin-sidebar-profile">
            <span
              className="admin-sidebar-avatar"
              aria-hidden="true"
            >
              {adminInitials || (
                <UserRound size={18} />
              )}
            </span>

            <div className="admin-sidebar-profile-copy">
              <strong>{adminName}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-mobile-menu-button"
              type="button"
              aria-label="Open navigation"
              aria-expanded={isSidebarOpen}
              onClick={() =>
                setIsSidebarOpen(true)
              }
            >
              <Menu size={20} />
            </button>

            <div className="admin-topbar-heading">
              <span className="admin-breadcrumb">
                Admin
                <span aria-hidden="true">/</span>
                {pageDetails.title}
              </span>

              <h1>{pageDetails.title}</h1>

              <p>{pageDetails.description}</p>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <button
              className="admin-icon-button"
              type="button"
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
              onClick={handleThemeToggle}
            >
              {theme === "light" ? (
                <Moon size={19} />
              ) : (
                <Sun size={19} />
              )}
            </button>

            <NotificationBell
              onNotificationClick={
                handleNotificationClick
              }
            />

            <div className="admin-profile-menu">
              <button
                className="admin-profile-button"
                type="button"
                aria-haspopup="menu"
                aria-expanded={
                  isProfileMenuOpen
                }
                onClick={() =>
                  setIsProfileMenuOpen(
                    (currentValue) =>
                      !currentValue,
                  )
                }
              >
                <span
                  className="admin-profile-avatar"
                  aria-hidden="true"
                >
                  {adminInitials || (
                    <UserRound size={18} />
                  )}
                </span>

                <span className="admin-profile-info">
                  <span className="admin-profile-name">
                    {adminName}
                  </span>

                  <span className="admin-profile-role">
                    Administrator
                  </span>
                </span>

                <ChevronDown
                  className="admin-profile-chevron"
                  size={16}
                />
              </button>

              {isProfileMenuOpen && (
                <div
                  className="admin-profile-dropdown"
                  role="menu"
                >
                  <div className="admin-profile-dropdown-header">
                    <strong>{adminName}</strong>

                    <span>
                      {currentUser?.email ??
                        "Administrator"}
                    </span>
                  </div>

                  <NavLink
                    to="/admin/settings"
                    role="menuitem"
                  >
                    <Settings size={17} />
                    Account settings
                  </NavLink>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                  >
                    <LogOut size={17} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;