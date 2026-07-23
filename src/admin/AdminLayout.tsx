import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CircleHelp,
  Images,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Ticket,
  UserRound,
} from "lucide-react";

import {
  clearAuthSession,
  getAuthenticatedUser,
} from "../services/auth.service";

import "./style/admin.css";

function AdminLayout() {
  const navigate = useNavigate();

  const currentUser = getAuthenticatedUser();

  const adminName =
    [currentUser?.firstName, currentUser?.lastName]
      .filter(Boolean)
      .join(" ") ||
    currentUser?.email ||
    "Admin";

  function handleLogout(): void {
    clearAuthSession();

    navigate("/admin/login", {
      replace: true,
    });
  }

  function handleNotificationClick(): void {
    /*
     * The notification dropdown will be connected here
     * after creating the notification service and component.
     */
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Waterfall</h2>
          <p>Admin Panel</p>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end>
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink to="/admin/events">
            <CalendarDays size={18} />
            Events
          </NavLink>

          <NavLink to="/admin/tickets">
            <Ticket size={18} />
            Tickets
          </NavLink>

          <NavLink to="/admin/gallery">
            <Images size={18} />
            Gallery
          </NavLink>

          <NavLink to="/admin/faq">
            <CircleHelp size={18} />
            FAQ
          </NavLink>

          <NavLink to="/admin/messages">
            <MessageSquare size={18} />
            Messages
          </NavLink>

          <NavLink to="/admin/settings">
            <Settings size={18} />
            Settings
          </NavLink>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-heading">
            <h1>Dashboard</h1>
            <p>Manage Waterfall Festival website content.</p>
          </div>

          <div className="admin-topbar-actions">
            <div className="admin-notification-wrapper">
              <button
                className="admin-notification-button"
                type="button"
                aria-label="Open notifications"
                title="Notifications"
                onClick={handleNotificationClick}
              >
                <Bell size={20} />

                <span
                  className="admin-notification-badge"
                  aria-label="0 unread notifications"
                >
                  0
                </span>
              </button>
            </div>

            <div className="admin-profile">
              <span className="admin-profile-icon">
                <UserRound size={18} />
              </span>

              <div className="admin-profile-info">
                <span className="admin-profile-name">
                  {adminName}
                </span>

                <span className="admin-profile-role">
                  Administrator
                </span>
              </div>
            </div>

            <button
              className="admin-logout-button"
              type="button"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Sign out
            </button>
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