import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Bell,
  CalendarDays,
  CheckCheck,
  CircleHelp,
  Image as ImageIcon,
  MessageSquare,
  Settings,
  Ticket,
} from "lucide-react";

import {
  getRecentNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
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

const NOTIFICATION_REFRESH_INTERVAL = 15_000;

const notificationPeriods: Array<{
  value: NotificationPeriod;
  label: string;
}> = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "today",
    label: "Today",
  },
  {
    value: "week",
    label: "This week",
  },
  {
    value: "earlier",
    label: "Earlier",
  },
];

function getNotificationPeriod(
  createdAt: string,
): Exclude<NotificationPeriod, "all"> {
  const notificationDate = new Date(createdAt);

  if (
    Number.isNaN(notificationDate.getTime())
  ) {
    return "earlier";
  }

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

  if (Number.isNaN(createdDate.getTime())) {
    return "";
  }

  const currentDate = new Date();

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
    return `${differenceInMinutes}m ago`;
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

  const notificationText = [
    notification.type,
    notification.title,
    notification.message,
  ]
    .join(" ")
    .toLowerCase();

  if (
    notificationType.includes("contact") ||
    notificationText.includes(
      "contact message",
    ) ||
    notificationText.includes("contact form") ||
    notificationText.includes(
      "message received",
    )
  ) {
    return (
      <MessageSquare
        size={17}
        strokeWidth={1.8}
      />
    );
  }

  if (
    notificationType.includes("event") ||
    notificationText.includes("event")
  ) {
    return (
      <CalendarDays
        size={17}
        strokeWidth={1.8}
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
        size={17}
        strokeWidth={1.8}
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
        size={17}
        strokeWidth={1.8}
      />
    );
  }

  if (
    notificationType.includes("ticket") ||
    notificationText.includes("ticket")
  ) {
    return (
      <Ticket
        size={17}
        strokeWidth={1.8}
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
        size={17}
        strokeWidth={1.8}
      />
    );
  }

  return (
    <Bell
      size={17}
      strokeWidth={1.8}
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

  const [isMarkingAllAsRead, setIsMarkingAllAsRead] =
    useState(false);

  const [activePeriod, setActivePeriod] =
    useState<NotificationPeriod>("all");

  const [notifications, setNotifications] =
    useState<AdminNotification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  const loadNotifications =
    useCallback(async (): Promise<void> => {
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
    }, []);

  useEffect(() => {
    void loadNotifications();

    const intervalId = window.setInterval(
      () => {
        void loadNotifications();
      },
      NOTIFICATION_REFRESH_INTERVAL,
    );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

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
  }, [isOpen]);

  const filteredNotifications = useMemo(
    () =>
      activePeriod === "all"
        ? notifications
        : notifications.filter(
            (notification) =>
              getNotificationPeriod(
                notification.createdAt,
              ) === activePeriod,
          ),
    [activePeriod, notifications],
  );

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
        await markNotificationAsRead(
          notification.id,
        );

        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (currentNotification) =>
                currentNotification.id ===
                notification.id
                  ? {
                      ...currentNotification,
                      isRead: true,
                      readAt:
                        new Date().toISOString(),
                    }
                  : currentNotification,
            ),
        );

        setUnreadCount((currentCount) =>
          Math.max(currentCount - 1, 0),
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
    if (
      unreadCount === 0 ||
      isMarkingAllAsRead
    ) {
      return;
    }

    setIsMarkingAllAsRead(true);

    try {
      await markAllNotificationsAsRead();

      const readAt =
        new Date().toISOString();

      setNotifications(
        (currentNotifications) =>
          currentNotifications.map(
            (notification) => ({
              ...notification,
              isRead: true,
              readAt:
                notification.readAt ?? readAt,
            }),
          ),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Unable to mark all notifications as read:",
        error,
      );
    } finally {
      setIsMarkingAllAsRead(false);
    }
  }

  return (
    <div
      className="admin-notification-wrapper"
      ref={wrapperRef}
    >
      <button
        className={`admin-notification-button ${
          isOpen
            ? "admin-notification-button--open"
            : ""
        }`}
        type="button"
        aria-label="Open notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={handleToggleDropdown}
      >
        <Bell
          size={19}
          strokeWidth={1.8}
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
        <section
          className="admin-notification-dropdown"
          role="dialog"
          aria-modal="false"
          aria-labelledby="admin-notification-title"
        >
          <header className="admin-notification-dropdown-header">
            <div className="admin-notification-header-copy">
              <h2 id="admin-notification-title">
                Notifications
              </h2>

              <span className="admin-notification-header-count">
                {unreadCount === 0
                  ? "You're all caught up"
                  : `${unreadCount} unread ${
                      unreadCount === 1
                        ? "notification"
                        : "notifications"
                    }`}
              </span>
            </div>

            <button
              className="admin-notification-read-all"
              type="button"
              disabled={
                unreadCount === 0 ||
                isMarkingAllAsRead
              }
              onClick={() =>
                void handleReadAll()
              }
            >
              <CheckCheck
                size={15}
                strokeWidth={1.9}
              />

              {isMarkingAllAsRead
                ? "Updating..."
                : "Mark all read"}
            </button>
          </header>

          <div
            className="admin-notification-tabs"
            role="tablist"
            aria-label="Filter notifications"
          >
            {notificationPeriods.map(
              (period) => (
                <button
                  key={period.value}
                  className={`admin-notification-tab ${
                    activePeriod ===
                    period.value
                      ? "admin-notification-tab--active"
                      : ""
                  }`}
                  type="button"
                  role="tab"
                  aria-selected={
                    activePeriod ===
                    period.value
                  }
                  onClick={() =>
                    setActivePeriod(
                      period.value,
                    )
                  }
                >
                  {period.label}
                </button>
              ),
            )}
          </div>

          <div className="admin-notification-body">
            {isLoading ? (
              <div
                className="admin-notification-empty"
                role="status"
              >
                <span className="admin-notification-loading-indicator" />

                <strong>
                  Loading notifications
                </strong>

                <span>
                  Retrieving recent activity.
                </span>
              </div>
            ) : filteredNotifications.length ===
              0 ? (
              <div className="admin-notification-empty">
                <span className="admin-notification-empty-icon">
                  <Bell
                    size={20}
                    strokeWidth={1.7}
                  />
                </span>

                <strong>
                  No notifications
                </strong>

                <span>
                  There is no activity in this
                  period.
                </span>
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
                        void handleReadNotification(
                          notification,
                        )
                      }
                    >
                      <span className="admin-notification-item-icon">
                        {getNotificationIcon(
                          notification,
                        )}
                      </span>

                      <span className="admin-notification-item-content">
                        <span className="admin-notification-item-heading">
                          <strong>
                            {formatNotificationTitle(
                              notification.title,
                            )}
                          </strong>

                          <time
                            dateTime={
                              notification.createdAt
                            }
                            title={formatNotificationDate(
                              notification.createdAt,
                            )}
                          >
                            {formatRelativeTime(
                              notification.createdAt,
                            )}
                          </time>
                        </span>

                        <span className="admin-notification-item-message">
                          {notification.message}
                        </span>

                        <span className="admin-notification-item-footer">
                          <time
                            dateTime={
                              notification.createdAt
                            }
                          >
                            {formatNotificationDate(
                              notification.createdAt,
                            )}
                          </time>

                          {!notification.isRead && (
                            <span className="admin-notification-unread-label">
                              <span
                                className="admin-notification-unread-dot"
                                aria-hidden="true"
                              />

                              Unread
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default NotificationBell;