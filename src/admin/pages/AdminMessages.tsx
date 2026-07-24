import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Eye,
  LoaderCircle,
  MailCheck,
  RefreshCw,
  Trash2,
} from "lucide-react";

import {
  getAdminMessages,
  type AdminContactMessage,
} from "../../services/contact.service";

import "../style/admin-messages.css";

function formatMessageDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load contact messages.";
}

function AdminMessages() {
  const [messages, setMessages] = useState<AdminContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMessages(showRefreshState = false) {
    try {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      const response = await getAdminMessages();

      setMessages(response.data);
    } catch (loadError: unknown) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    void loadMessages();
  }, []);

  const statistics = useMemo(() => {
    return {
      total: messages.length,
      new: messages.filter(
        (message) => message.status === "NEW",
      ).length,
      read: messages.filter(
        (message) => message.status === "READ",
      ).length,
    };
  }, [messages]);

  return (
    <section className="admin-messages">
      <div className="admin-messages__header">
        <div>
          <span className="admin-messages__eyebrow">
            Contact Inbox
          </span>

          <h1>Messages</h1>

          <p>
            Review contact form messages, mark them as read, or
            remove old requests.
          </p>
        </div>

        <button
          type="button"
          className="admin-messages__refresh-button"
          onClick={() => void loadMessages(true)}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw
            size={17}
            className={
              isRefreshing
                ? "admin-messages__spinning-icon"
                : undefined
            }
          />

          <span>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      <div className="admin-messages__stats">
        <div className="admin-messages__stat-card">
          <span>Total Messages</span>
          <strong>{statistics.total}</strong>
        </div>

        <div className="admin-messages__stat-card">
          <span>New Messages</span>
          <strong>{statistics.new}</strong>
        </div>

        <div className="admin-messages__stat-card">
          <span>Read Messages</span>
          <strong>{statistics.read}</strong>
        </div>
      </div>

      <div className="admin-messages__table-card">
        <div className="admin-messages__table-header">
          <h2>Contact Messages</h2>

          <p>
            Messages submitted through the public contact form.
          </p>
        </div>

        {isLoading ? (
          <div className="admin-messages__state">
            <LoaderCircle
              size={34}
              className="admin-messages__spinning-icon"
            />

            <h3>Loading messages</h3>

            <p>
              Contacting the server and retrieving your inbox.
            </p>
          </div>
        ) : error ? (
          <div className="admin-messages__state admin-messages__state--error">
            <AlertCircle size={34} />

            <h3>Messages could not be loaded</h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => void loadMessages()}
            >
              Try again
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="admin-messages__state">
            <MailCheck size={34} />

            <h3>No contact messages yet</h3>

            <p>
              New messages submitted through the contact form will
              appear here.
            </p>
          </div>
        ) : (
          <div className="admin-messages__table-wrap">
            <table className="admin-messages__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Date</th>
                  <th>Status</th>

                  <th className="admin-messages__actions-title">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {messages.map((message) => {
                  const statusClass = message.status
                    .toLowerCase()
                    .replace(/_/g, "-");

                  return (
                    <tr key={message.id}>
                      <td>
                        <strong>{message.name}</strong>
                      </td>

                      <td>
                        <a
                          className="admin-messages__email"
                          href={`mailto:${message.email}`}
                        >
                          {message.email}
                        </a>
                      </td>

                      <td>
                        {message.subject?.trim() || "No subject"}
                      </td>

                      <td>
                        {formatMessageDate(message.createdAt)}
                      </td>

                      <td>
                        <span
                          className={`admin-messages__status admin-messages__status--${statusClass}`}
                        >
                          {formatStatus(message.status)}
                        </span>
                      </td>

                      <td>
                        <div className="admin-messages__actions">
                          <button
                            type="button"
                            title="View message — Phase 2"
                            aria-label={`View message from ${message.name}`}
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            title="Mark as read — Phase 2"
                            aria-label={`Mark message from ${message.name} as read`}
                          >
                            <MailCheck size={16} />
                          </button>

                          <button
                            type="button"
                            className="danger"
                            title="Delete message — Phase 2"
                            aria-label={`Delete message from ${message.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminMessages;