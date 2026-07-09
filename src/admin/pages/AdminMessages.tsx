import { Eye, MailCheck, Trash2 } from "lucide-react";
import "../style/admin-messages.css";

const messages = [
  {
    id: 1,
    name: "John Carter",
    email: "john.carter@gmail.com",
    subject: "VIP ticket question",
    date: "12 Aug 2026",
    status: "New",
  },
  {
    id: 2,
    name: "Alice Morgan",
    email: "alice@mail.com",
    subject: "Ticket refund request",
    date: "10 Aug 2026",
    status: "Read",
  },
  {
    id: 3,
    name: "Omar Ben Ali",
    email: "omar@mail.com",
    subject: "Sponsorship opportunity",
    date: "08 Aug 2026",
    status: "New",
  },
  {
    id: 4,
    name: "Maya Chen",
    email: "maya.chen@mail.com",
    subject: "Venue location details",
    date: "05 Aug 2026",
    status: "Read",
  },
];

function AdminMessages() {
  return (
    <section className="admin-messages">
      <div className="admin-messages__header">
        <div>
          <span className="admin-messages__eyebrow">Contact Inbox</span>
          <h1>Messages</h1>
          <p>Review contact form messages, mark them as read, or remove old requests.</p>
        </div>
      </div>

      <div className="admin-messages__stats">
        <div className="admin-messages__stat-card">
          <span>Total Messages</span>
          <strong>4</strong>
        </div>

        <div className="admin-messages__stat-card">
          <span>New Messages</span>
          <strong>2</strong>
        </div>

        <div className="admin-messages__stat-card">
          <span>Read Messages</span>
          <strong>2</strong>
        </div>
      </div>

      <div className="admin-messages__table-card">
        <div className="admin-messages__table-header">
          <h2>Contact Messages</h2>
          <p>Static dummy messages for now. Backend inbox will be connected later.</p>
        </div>

        <div className="admin-messages__table-wrap">
          <table className="admin-messages__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th className="admin-messages__actions-title">Actions</th>
              </tr>
            </thead>

            <tbody>
              {messages.map((message) => (
                <tr key={message.id}>
                  <td>
                    <strong>{message.name}</strong>
                  </td>
                  <td>{message.email}</td>
                  <td>{message.subject}</td>
                  <td>{message.date}</td>
                  <td>
                    <span
                      className={`admin-messages__status admin-messages__status--${message.status.toLowerCase()}`}
                    >
                      {message.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-messages__actions">
                      <button title="View message">
                        <Eye size={16} />
                      </button>

                      <button title="Mark as read">
                        <MailCheck size={16} />
                      </button>

                      <button className="danger" title="Delete message">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminMessages;