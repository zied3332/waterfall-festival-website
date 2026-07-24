import { useEffect, useRef, useState } from "react";
import {
  Bell,
  CalendarDays,
  CircleHelp,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  Ticket,
} from "lucide-react";

import {
   getRecentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type AdminNotification,
} from "../../services/notifications.service";

import "./notification-bell.css";

type NotificationBellProps = {
  onNotificationClick?: (
    notification: AdminNotification,
  ) => void;
};

type NotificationPeriod =
  | "all"
  | "today"
  | "week"
  | "earlier";

function getNotificationPeriod(
  createdAt: string,
): Exclude<NotificationPeriod, "all"> {
  const notificationDate = new Date(createdAt);
  const currentDate = new Date();

  const startOfToday = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
  );

  const startOfWeek = new Date(startOfToday);

  startOfWeek.setDate(
    startOfToday.getDate() - 7,
  );

  if (notificationDate >= startOfToday) {
    return "today";
  }

  if (notificationDate >= startOfWeek) {
    return "week";
  }

  return "earlier";
}

function formatRelativeTime(
  createdAt: string,
): string {
  const createdDate = new Date(createdAt);
  const currentDate = new Date();

  if (Number.isNaN(createdDate.getTime())) {
    return "";
  }

  const differenceInMilliseconds =
    currentDate.getTime() -
    createdDate.getTime();

  const differenceInMinutes = Math.max(
    0,
    Math.floor(
      differenceInMilliseconds /
        (1000 * 60),
    ),
  );

  if (differenceInMinutes < 1) {
    return "Just now";
  }

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes} min ago`;
  }

  const differenceInHours = Math.floor(
    differenceInMinutes / 60,
  );

  if (differenceInHours < 24) {
    return `${differenceInHours}h ago`;
  }

  const differenceInDays = Math.floor(
    differenceInHours / 24,
  );

  if (differenceInDays === 1) {
    return "Yesterday";
  }

  if (differenceInDays < 7) {
    return `${differenceInDays}d ago`;
  }

  return createdDate.toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    },
  );
}

function formatNotificationDate(
  createdAt: string,
): string {
  const createdDate = new Date(createdAt);

  if (Number.isNaN(createdDate.getTime())) {
    return "";
  }

  return createdDate.toLocaleString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function formatNotificationTitle(
  title: string,
): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getNotificationIcon(
  notification: AdminNotification,
) {
  const notificationType =
    notification.type.toLowerCase();

  const notificationText = `
    ${notification.type}
    ${notification.title}
    ${notification.message}
  `.toLowerCase();

  if (
    notificationType.includes("contact") ||
    notificationText.includes("contact message") ||
    notificationText.includes("contact form") ||
    notificationText.includes("message received")
  ) {
    return (
      <MessageSquare
        size={18}
        strokeWidth={1.9}
      />
    );
  }

  if (
    notificationType.includes("event") ||
    notificationText.includes("event")
  ) {
    return (
      <CalendarDays
        size={18}
        strokeWidth={1.9}
      />
    );
  }

  if (
    notificationType.includes("gallery") ||
    notificationText.includes("gallery") ||
    notificationText.includes("photo") ||
    notificationText.includes("image")
  ) {
    return (
      <ImageIcon
        size={18}
        strokeWidth={1.9}
      />
    );
  }

  if (
    notificationType.includes("faq") ||
    notificationText.includes("faq") ||
    notificationText.includes("question")
  ) {
    return (
      <CircleHelp
        size={18}
        strokeWidth={1.9}
      />
    );
  }

  if (
    notificationType.includes("ticket") ||
    notificationText.includes("ticket")
  ) {
    return (
      <Ticket
        size={18}
        strokeWidth={1.9}
      />
    );
  }

  if (
    notificationText.includes("maintenance") ||
    notificationText.includes("system") ||
    notificationText.includes("security") ||
    notificationText.includes("update")
  ) {
    return (
      <Settings
        size={18}
        strokeWidth={1.9}
      />
    );
  }

  return (
    <Bell
      size={18}
      strokeWidth={1.9}
    />
  );
}

function NotificationBell({
  onNotificationClick,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [activePeriod, setActivePeriod] =
    useState<NotificationPeriod>("all");

  const [notifications, setNotifications] =
    useState<AdminNotification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  async function loadNotifications(): Promise<void> {
    try {
      const response =
        await getRecentNotifications();

      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error(
        "Unable to load notifications:",
        error,
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();

    const interval = window.setInterval(
      () => {
        void loadNotifications();
      },
      15000,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent,
    ): void {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsOpen(false);
      }
    }

    function handleEscapeKey(
      event: KeyboardEvent,
    ): void {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    document.addEventListener(
      "keydown",
      handleEscapeKey,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );

      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, []);

  const filteredNotifications =
    activePeriod === "all"
      ? notifications
      : notifications.filter(
          (notification) =>
            getNotificationPeriod(
              notification.createdAt,
            ) === activePeriod,
        );

  function handleNotificationClick(
    notification: AdminNotification,
  ): void {
    onNotificationClick?.(notification);
    setIsOpen(false);
  }

  function handleToggleDropdown(): void {
    setIsOpen(
      (currentValue) => !currentValue,
    );
  }
async function handleReadNotification(
  notification: AdminNotification,
): Promise<void> {
  if (!notification.isRead) {
    try {
      await markNotificationAsRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item,
        ),
      );

      setUnreadCount((current) =>
        Math.max(current - 1, 0),
      );
    } catch (error) {
      console.error(
        "Unable to mark notification as read:",
        error,
      );
    }
  }

  onNotificationClick?.(notification);
  setIsOpen(false);
}

async function handleReadAll(): Promise<void> {
  try {
    await markAllNotificationsAsRead();

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
        readAt:
          notification.readAt ??
          new Date().toISOString(),
      })),
    );

    setUnreadCount(0);
  } catch (error) {
    console.error(
      "Unable to mark all notifications as read:",
      error,
    );
  }
}
  return (
    <div
      className="admin-notification-wrapper"
      ref={wrapperRef}
    >
      <button
        className="admin-notification-button"
        type="button"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        onClick={handleToggleDropdown}
      >
        <Bell
          size={20}
          strokeWidth={1.9}
        />

        {unreadCount > 0 && (
          <span
            className="admin-notification-badge"
            aria-label={`${unreadCount} unread notifications`}
          >
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="admin-notification-dropdown"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="admin-notification-dropdown-header">
            <div>
              <h3>Notifications</h3>

              <span className="admin-notification-header-count">
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread`}
              </span>
            </div>

          <button
  className="admin-notification-see-all"
  type="button"
  onClick={() => void handleReadAll()}
>
  Mark all as read
</button>
          </div>

          <div
            className="admin-notification-tabs"
            role="tablist"
            aria-label="Notification periods"
          >
            <button
              className={`admin-notification-tab ${
                activePeriod === "today"
                  ? "admin-notification-tab--active"
                  : ""
              }`}
              type="button"
              role="tab"
              aria-selected={
                activePeriod === "today"
              }
              onClick={() =>
                setActivePeriod("today")
              }
            >
              Today
            </button>

            <button
              className={`admin-notification-tab ${
                activePeriod === "week"
                  ? "admin-notification-tab--active"
                  : ""
              }`}
              type="button"
              role="tab"
              aria-selected={
                activePeriod === "week"
              }
              onClick={() =>
                setActivePeriod("week")
              }
            >
              This Week
            </button>

            <button
              className={`admin-notification-tab ${
                activePeriod === "earlier"
                  ? "admin-notification-tab--active"
                  : ""
              }`}
              type="button"
              role="tab"
              aria-selected={
                activePeriod === "earlier"
              }
              onClick={() =>
                setActivePeriod("earlier")
              }
            >
              Earlier
            </button>
          </div>

          {isLoading ? (
            <div className="admin-notification-empty">
              Loading notifications...
            </div>
          ) : filteredNotifications.length ===
            0 ? (
            <div className="admin-notification-empty">
              No notifications in this period.
            </div>
          ) : (
            <div className="admin-notification-list">
              {filteredNotifications.map(
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
  void handleReadNotification(notification)
}
                  >
                    <span className="admin-notification-item-iSee allcon">
                      {getNotificationIcon(
                        notification,
                      )}
                    </span>

                    <span className="admin-notification-item-content">
                      <span className="admin-notification-item-heading">
                        <strong>
                          {!notification.isRead && (
                            <span
                              className="admin-notification-unread-dot"
                              aria-hidden="true"
                            />
                          )}

                          {formatNotificationTitle(
                            notification.title,
                          )}
                        </strong>

                        <small
                          title={formatNotificationDate(
                            notification.createdAt,
                          )}
                        >
                          {formatRelativeTime(
                            notification.createdAt,
                          )}
                        </small>
                      </span>

                      <span className="admin-notification-item-message">
                        {notification.message}
                      </span>

                      <time
                        className="admin-notification-item-date"
                        dateTime={
                          notification.createdAt
                        }
                      >
                        {formatNotificationDate(
                          notification.createdAt,
                        )}
                      </time>
                    </span>
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