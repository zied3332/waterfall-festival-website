import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

import { getRecentNotifications } from "../../services/notifications.service";
import type { AdminNotification } from "../../services/notifications.service";
import "./notification-bell.css";
type NotificationBellProps = {
  onNotificationClick?: (
    notification: AdminNotification,
  ) => void;
};

function NotificationBell({
  onNotificationClick,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [notifications, setNotifications] = useState<
    AdminNotification[]
  >([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  async function loadNotifications() {
    try {
      const response =
        await getRecentNotifications();

      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();

    const interval = setInterval(() => {
      void loadNotifications();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  return (
    <div
      className="admin-notification-wrapper"
      ref={wrapperRef}
    >
      <button
        className="admin-notification-button"
        type="button"
        onClick={() =>
          setIsOpen((value) => !value)
        }
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="admin-notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="admin-notification-dropdown">
          <div className="admin-notification-dropdown-header">
            <h3>Notifications</h3>

            <span>
              {unreadCount} unread
            </span>
          </div>

          {isLoading ? (
            <div className="admin-notification-empty">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="admin-notification-empty">
              No notifications
            </div>
          ) : (
            <div className="admin-notification-list">
              {notifications.map(
                (notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className={`admin-notification-item ${
                      notification.isRead
                        ? ""
                        : "admin-notification-item--unread"
                    }`}
                    onClick={() =>
                      onNotificationClick?.(
                        notification,
                      )
                    }
                  >
                    <strong>
                      {notification.title}
                    </strong>

                    <p>
                      {notification.message}
                    </p>

                    <small>
                      {new Date(
                        notification.createdAt,
                      ).toLocaleString()}
                    </small>
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;