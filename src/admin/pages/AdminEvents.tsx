import { Edit, Plus, Trash2 } from "lucide-react";
import { events } from "../../data/events";
import "../style/admin-events.css";

function AdminEvents() {
  return (
    <section className="admin-events">
      <div className="admin-events__header">
        <div>
          <h2>Events</h2>
          <p>Manage festival events displayed on the public website.</p>
        </div>

        <button>
          <Plus size={18} />
          Add Event
        </button>
      </div>

      <div className="admin-events__table-card">
        <table className="admin-events__table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Location</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>
                  <strong>{event.title}</strong>
                  <span>{event.slug}</span>
                </td>

                <td>{event.date}</td>
                <td>{event.location}</td>
                <td>{event.price || "$99"}</td>

                <td>
                  <span className="admin-events__status">Upcoming</span>
                </td>

                <td>
                  <div className="admin-events__actions">
                    <button>
                      <Edit size={16} />
                    </button>

                    <button className="danger">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminEvents;