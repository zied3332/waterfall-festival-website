import {
  CalendarDays,
  Ticket,
  Image,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import "./../style/dashboard.css";
function Dashboard() {
  return (
    <>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <CalendarDays size={34} />
          <h3>Events</h3>
          <h2>3</h2>
          <p>Active festival events</p>
        </div>

        <div className="dashboard-card">
          <Ticket size={34} />
          <h3>Tickets Sold</h3>
          <h2>2,458</h2>
          <p>Across all events</p>
        </div>

        <div className="dashboard-card">
          <Image size={34} />
          <h3>Gallery</h3>
          <h2>84</h2>
          <p>Photos & videos</p>
        </div>

        <div className="dashboard-card">
          <MessageSquare size={34} />
          <h3>Messages</h3>
          <h2>18</h2>
          <p>Unread inquiries</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <h2>Recent Activity</h2>

          <div className="activity-list">
            <div className="activity-item">
              <TrendingUp size={18} />
              <span>New ticket purchased</span>
            </div>

            <div className="activity-item">
              <TrendingUp size={18} />
              <span>Gallery updated with 12 new photos</span>
            </div>

            <div className="activity-item">
              <TrendingUp size={18} />
              <span>New contact message received</span>
            </div>

            <div className="activity-item">
              <TrendingUp size={18} />
              <span>Waterfall Festival event updated</span>
            </div>
          </div>
        </div>

        <div className="dashboard-panel">
          <h2>Quick Actions</h2>

          <div className="quick-actions">
            <button>Add Event</button>
            <button>Upload Gallery</button>
            <button>Edit FAQ</button>
            <button>View Messages</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;