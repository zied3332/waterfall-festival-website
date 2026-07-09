import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Ticket,
  Images,
  CircleHelp,
  MessageSquare,
  Settings,
} from "lucide-react";

import "./style/admin.css";

function AdminLayout() {
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
          <div>
            <h1>Dashboard</h1>
            <p>Manage Waterfall Festival website content.</p>
          </div>

          <button className="admin-profile">Admin</button>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;