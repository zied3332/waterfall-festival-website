import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Eye,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Sparkles,
  Ticket,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import "./../style/dashboard.css";

const dashboardStats = [
  {
    title: "Active Events",
    value: "3",
    description: "Festival events currently published",
    change: "+1 this month",
    icon: CalendarDays,
    className: "dashboard-stat--purple",
  },
  {
    title: "Tickets Sold",
    value: "2,458",
    description: "Tickets sold across all events",
    change: "+18.4%",
    icon: Ticket,
    className: "dashboard-stat--cyan",
  },
  {
    title: "Total Revenue",
    value: "฿3.2M",
    description: "Estimated ticket revenue",
    change: "+12.8%",
    icon: CircleDollarSign,
    className: "dashboard-stat--green",
  },
  {
    title: "Unread Messages",
    value: "18",
    description: "Visitor inquiries awaiting reply",
    change: "6 new today",
    icon: MessageSquare,
    className: "dashboard-stat--orange",
  },
];

const recentActivities = [
  {
    title: "New VIP ticket purchased",
    description: "Waterfall Festival Full Moon Edition",
    time: "5 minutes ago",
    icon: Ticket,
    type: "Sale",
    typeClassName: "activity-badge--sale",
  },
  {
    title: "Gallery content uploaded",
    description: "12 new festival photos were added",
    time: "32 minutes ago",
    icon: ImageIcon,
    type: "Gallery",
    typeClassName: "activity-badge--gallery",
  },
  {
    title: "New contact message received",
    description: "Question about ticket transfers",
    time: "1 hour ago",
    icon: MessageSquare,
    type: "Message",
    typeClassName: "activity-badge--message",
  },
  {
    title: "Event information updated",
    description: "Waterfall Festival event schedule",
    time: "3 hours ago",
    icon: CalendarDays,
    type: "Event",
    typeClassName: "activity-badge--event",
  },
];

const quickActions = [
  {
    title: "Create Event",
    description: "Add a new festival event",
    icon: Plus,
    path: "/admin/events",
  },
  {
    title: "Manage Tickets",
    description: "Review ticket types and sales",
    icon: Ticket,
    path: "/admin/tickets",
  },
  {
    title: "Upload Gallery",
    description: "Add photos and videos",
    icon: Upload,
    path: "/admin/gallery",
  },
  {
    title: "View Messages",
    description: "Reply to visitor inquiries",
    icon: MessageSquare,
    path: "/admin/messages",
  },
];

function Dashboard() {
  return (
    <section className="admin-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header__content">
          <div className="dashboard-header__eyebrow">
            <Sparkles size={16} />
            <span>Festival Control Center</span>
          </div>

          <h1>Dashboard Overview</h1>

          <p>
            Monitor festival activity, ticket performance, visitor engagement,
            and website content from one place.
          </p>
        </div>

        <div className="dashboard-header__status">
          <span className="dashboard-status__indicator" />

          <div>
            <strong>Website Online</strong>
            <span>All systems are operational</span>
          </div>
        </div>
      </div>

      <div className="dashboard-stats">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className={`dashboard-stat-card ${stat.className}`}
              key={stat.title}
            >
              <div className="dashboard-stat-card__top">
                <div className="dashboard-stat-card__icon">
                  <Icon size={25} />
                </div>

                <span className="dashboard-stat-card__change">
                  <TrendingUp size={14} />
                  {stat.change}
                </span>
              </div>

              <div className="dashboard-stat-card__content">
                <p className="dashboard-stat-card__title">{stat.title}</p>
                <h2>{stat.value}</h2>
                <p className="dashboard-stat-card__description">
                  {stat.description}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="dashboard-main-grid">
        <article className="dashboard-panel dashboard-performance">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__label">
                Festival Performance
              </span>
              <h2>Event Overview</h2>
            </div>

            <Link to="/admin/events" className="dashboard-panel__link">
              View events
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="dashboard-event-card">
            <div className="dashboard-event-card__main">
              <div className="dashboard-event-card__date">
                <span>JUL</span>
                <strong>20</strong>
              </div>

              <div className="dashboard-event-card__info">
                <span className="dashboard-event-card__status">
                  Upcoming Event
                </span>

                <h3>Waterfall Festival Full Moon Edition</h3>

                <p>
                  Koh Phangan, Thailand · Doors open at 8:00 PM
                </p>
              </div>
            </div>

            <div className="dashboard-event-card__metrics">
              <div>
                <span>
                  <Ticket size={16} />
                  Tickets Sold
                </span>
                <strong>1,840</strong>
              </div>

              <div>
                <span>
                  <Users size={16} />
                  Capacity
                </span>
                <strong>2,500</strong>
              </div>

              <div>
                <span>
                  <Eye size={16} />
                  Page Views
                </span>
                <strong>18.6K</strong>
              </div>
            </div>

            <div className="dashboard-progress">
              <div className="dashboard-progress__header">
                <span>Ticket capacity</span>
                <strong>74%</strong>
              </div>

              <div className="dashboard-progress__track">
                <span className="dashboard-progress__bar" />
              </div>
            </div>
          </div>
        </article>

        <article className="dashboard-panel dashboard-quick-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__label">Shortcuts</span>
              <h2>Quick Actions</h2>
            </div>
          </div>

          <div className="dashboard-quick-actions">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  to={action.path}
                  className="dashboard-quick-action"
                  key={action.title}
                >
                  <div className="dashboard-quick-action__icon">
                    <Icon size={20} />
                  </div>

                  <div className="dashboard-quick-action__content">
                    <strong>{action.title}</strong>
                    <span>{action.description}</span>
                  </div>

                  <ArrowRight
                    size={17}
                    className="dashboard-quick-action__arrow"
                  />
                </Link>
              );
            })}
          </div>
        </article>
      </div>

      <article className="dashboard-panel dashboard-activity-panel">
        <div className="dashboard-panel__header">
          <div>
            <span className="dashboard-panel__label">Latest Updates</span>
            <h2>Recent Activity</h2>
          </div>

          <button type="button" className="dashboard-secondary-button">
            View all activity
          </button>
        </div>

        <div className="dashboard-activity-list">
          {recentActivities.map((activity) => {
            const Icon = activity.icon;

            return (
              <div className="dashboard-activity-item" key={activity.title}>
                <div className="dashboard-activity-item__icon">
                  <Icon size={19} />
                </div>

                <div className="dashboard-activity-item__content">
                  <strong>{activity.title}</strong>
                  <span>{activity.description}</span>
                </div>

                <span
                  className={`dashboard-activity-badge ${activity.typeClassName}`}
                >
                  {activity.type}
                </span>

                <time>{activity.time}</time>
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}

export default Dashboard;