import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  Clock3,
  ExternalLink,
  Image as ImageIcon,
  LoaderCircle,
  MessageSquare,
  Plus,
  RefreshCw,
  Sparkles,
  Ticket,
  Upload,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import {
  getAdminEvents,
} from "../../services/events.service";
import {
  getTickets,
} from "../../services/ticket.service";
import {
  getAdminMessages,
} from "../../services/contact.service";
import {
  getAdminGallery,
} from "../../services/gallery.service";
import {
  getRecentNotifications,
  getUnreadNotificationCount,
} from "../../services/notifications.service";

import type {
  AdminContactMessage,
} from "../../services/contact.service";
import type {
  AdminNotification,
} from "../../services/notifications.service";
import type {
  TicketPreview,
} from "../../services/ticket.service";
import type {
  Event,
} from "../../types/event";
import type {
  GalleryImage,
} from "../../types/gallery";

import "./../style/dashboard.css";

type DashboardData = {
  events: Event[];
  tickets: TicketPreview[];
  totalTickets: number;
  messages: AdminContactMessage[];
  totalMessages: number;
  gallery: GalleryImage[];
  notifications: AdminNotification[];
  unreadNotifications: number;
};

type DashboardLoadError = {
  message?: string;
  response?: {
    data?: {
      message?: string | string[];
    };
  };
};

const EMPTY_DASHBOARD_DATA: DashboardData = {
  events: [],
  tickets: [],
  totalTickets: 0,
  messages: [],
  totalMessages: 0,
  gallery: [],
  notifications: [],
  unreadNotifications: 0,
};

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return fallbackMessage;
  }

  const apiError = error as DashboardLoadError;
  const responseMessage =
    apiError.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(" ");
  }

  if (typeof responseMessage === "string") {
    return responseMessage;
  }

  if (typeof apiError.message === "string") {
    return apiError.message;
  }

  return fallbackMessage;
}

function normalizeStatus(status?: string): string {
  return status?.trim().toUpperCase() ?? "";
}

function formatStatus(status?: string): string {
  if (!status) {
    return "Unknown";
  }

  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateParts(
  value?: string | null,
): {
  month: string;
  day: string;
} {
  if (!value) {
    return {
      month: "---",
      day: "--",
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      month: "---",
      day: "--",
    };
  }

  return {
    month: new Intl.DateTimeFormat("en-US", {
      month: "short",
    })
      .format(date)
      .toUpperCase(),
    day: new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
    }).format(date),
  };
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const differenceInSeconds = Math.round(
    (date.getTime() - Date.now()) / 1000,
  );

  const formatter = new Intl.RelativeTimeFormat(
    "en",
    {
      numeric: "auto",
    },
  );

  const absoluteDifference = Math.abs(
    differenceInSeconds,
  );

  if (absoluteDifference < 60) {
    return formatter.format(
      differenceInSeconds,
      "second",
    );
  }

  const minutes = Math.round(
    differenceInSeconds / 60,
  );

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);

  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  const days = Math.round(hours / 24);

  if (Math.abs(days) < 30) {
    return formatter.format(days, "day");
  }

  return formatDate(value);
}

function getNotificationIcon(
  type: string,
) {
  switch (normalizeStatus(type)) {
    case "CONTACT_MESSAGE":
      return MessageSquare;

    case "EVENT":
      return CalendarDays;

    case "GALLERY":
      return ImageIcon;

    case "FAQ":
      return CircleHelp;

    default:
      return Bell;
  }
}

function getNotificationClassName(
  type: string,
): string {
  switch (normalizeStatus(type)) {
    case "CONTACT_MESSAGE":
      return "dashboard-activity--message";

    case "EVENT":
      return "dashboard-activity--event";

    case "GALLERY":
      return "dashboard-activity--gallery";

    case "FAQ":
      return "dashboard-activity--faq";

    default:
      return "dashboard-activity--default";
  }
}

function getNotificationLabel(
  type: string,
): string {
  switch (normalizeStatus(type)) {
    case "CONTACT_MESSAGE":
      return "Message";

    case "EVENT":
      return "Event";

    case "GALLERY":
      return "Gallery";

    case "FAQ":
      return "FAQ";

    default:
      return "Update";
  }
}

function Dashboard() {
  const [data, setData] =
    useState<DashboardData>(
      EMPTY_DASHBOARD_DATA,
    );

  const [isLoading, setIsLoading] =
    useState(true);
  const [isRefreshing, setIsRefreshing] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] =
    useState<Date | null>(null);

  const loadDashboard = useCallback(
    async (showRefreshState = false) => {
      if (showRefreshState) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      const results = await Promise.allSettled([
        getAdminEvents(),
        getTickets({
          page: 1,
          limit: 100,
          sortBy: "sortOrder",
          sortDirection: "asc",
        }),
        getAdminMessages(),
        getAdminGallery(),
        getRecentNotifications(6),
        getUnreadNotificationCount(),
      ]);

      const [
        eventsResult,
        ticketsResult,
        messagesResult,
        galleryResult,
        notificationsResult,
        unreadResult,
      ] = results;

      const hasSuccessfulRequest = results.some(
        (result) => result.status === "fulfilled",
      );

      if (!hasSuccessfulRequest) {
        const firstRejectedResult = results.find(
          (
            result,
          ): result is PromiseRejectedResult =>
            result.status === "rejected",
        );

        setError(
          getErrorMessage(
            firstRejectedResult?.reason,
            "Unable to load dashboard information.",
          ),
        );

        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      setData({
        events:
          eventsResult.status === "fulfilled"
            ? eventsResult.value
            : [],
        tickets:
          ticketsResult.status === "fulfilled"
            ? ticketsResult.value.data
            : [],
        totalTickets:
          ticketsResult.status === "fulfilled"
            ? ticketsResult.value.meta.totalItems
            : 0,
        messages:
          messagesResult.status === "fulfilled"
            ? messagesResult.value.data
            : [],
        totalMessages:
          messagesResult.status === "fulfilled"
            ? messagesResult.value.pagination.total
            : 0,
        gallery:
          galleryResult.status === "fulfilled"
            ? galleryResult.value
            : [],
        notifications:
          notificationsResult.status ===
          "fulfilled"
            ? notificationsResult.value.data
            : [],
        unreadNotifications:
          unreadResult.status === "fulfilled"
            ? unreadResult.value.unreadCount
            : notificationsResult.status ===
                "fulfilled"
              ? notificationsResult.value
                  .unreadCount
              : 0,
      });

      const failedRequestCount = results.filter(
        (result) => result.status === "rejected",
      ).length;

      if (failedRequestCount > 0) {
        setError(
          `${failedRequestCount} dashboard ${
            failedRequestCount === 1
              ? "section could"
              : "sections could"
          } not be loaded.`,
        );
      }

      setLastUpdatedAt(new Date());
      setIsLoading(false);
      setIsRefreshing(false);
    },
    [],
  );

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const dashboardSummary = useMemo(() => {
    const now = Date.now();

    const publishedEvents = data.events.filter(
      (event) =>
        normalizeStatus(event.status) ===
        "PUBLISHED",
    );

    const upcomingEvents = publishedEvents
      .filter((event) => {
        const eventTime = new Date(
          event.date,
        ).getTime();

        return (
          !Number.isNaN(eventTime) &&
          eventTime >= now
        );
      })
      .sort(
        (firstEvent, secondEvent) =>
          new Date(firstEvent.date).getTime() -
          new Date(secondEvent.date).getTime(),
      );

    const nextEvent =
      upcomingEvents[0] ?? null;

    const newMessages = data.messages.filter(
      (message) =>
        normalizeStatus(message.status) === "NEW",
    );

    const publishedGalleryItems =
      data.gallery.filter(
        (image) =>
          normalizeStatus(image.status) ===
          "PUBLISHED",
      );

    const availableTickets = data.tickets.filter(
      (ticket) =>
        ![
          "SOLD_OUT",
          "UNAVAILABLE",
          "HIDDEN",
          "DRAFT",
        ].includes(
          normalizeStatus(ticket.status),
        ),
    );

    const soldOutTickets = data.tickets.filter(
      (ticket) =>
        normalizeStatus(ticket.status) ===
          "SOLD_OUT" ||
        ticket.remainingQuantity === 0,
    );

    const ticketsWithoutPurchaseUrl =
      data.tickets.filter(
        (ticket) =>
          !ticket.externalPurchaseUrl,
      );

    const eventsWithoutPurchaseUrl =
      publishedEvents.filter(
        (event) => !event.ticketPurchaseUrl,
      );

    const draftGalleryItems =
      data.gallery.filter(
        (image) =>
          normalizeStatus(image.status) ===
          "DRAFT",
      );

    return {
      publishedEvents,
      nextEvent,
      newMessages,
      publishedGalleryItems,
      availableTickets,
      soldOutTickets,
      ticketsWithoutPurchaseUrl,
      eventsWithoutPurchaseUrl,
      draftGalleryItems,
    };
  }, [data]);

  const nextEventDate = formatDateParts(
    dashboardSummary.nextEvent?.date,
  );

  const statistics = [
    {
      title: "Published Events",
      value:
        dashboardSummary.publishedEvents.length,
      description: `${data.events.length} total events`,
      icon: CalendarDays,
      className: "dashboard-stat--purple",
      path: "/admin/events",
    },
    {
      title: "Ticket Types",
      value: data.totalTickets,
      description: `${dashboardSummary.availableTickets.length} available in loaded results`,
      icon: Ticket,
      className: "dashboard-stat--blue",
      path: "/admin/tickets",
    },
    {
      title: "Contact Messages",
      value: data.totalMessages,
      description: `${dashboardSummary.newMessages.length} new in loaded results`,
      icon: MessageSquare,
      className: "dashboard-stat--orange",
      path: "/admin/messages",
    },
    {
      title: "Gallery Content",
      value:
        dashboardSummary
          .publishedGalleryItems.length,
      description: `${data.gallery.length} total gallery items`,
      icon: ImageIcon,
      className: "dashboard-stat--green",
      path: "/admin/gallery",
    },
  ];

  const contentHealthItems = [
    {
      label: "Tickets missing purchase URL",
      value:
        dashboardSummary
          .ticketsWithoutPurchaseUrl.length,
      path: "/admin/tickets",
      isHealthy:
        dashboardSummary
          .ticketsWithoutPurchaseUrl.length === 0,
    },
    {
      label: "Events missing ticket URL",
      value:
        dashboardSummary
          .eventsWithoutPurchaseUrl.length,
      path: "/admin/events",
      isHealthy:
        dashboardSummary
          .eventsWithoutPurchaseUrl.length === 0,
    },
    {
      label: "Draft gallery items",
      value:
        dashboardSummary.draftGalleryItems
          .length,
      path: "/admin/gallery",
      isHealthy:
        dashboardSummary.draftGalleryItems
          .length === 0,
    },
    {
      label: "New messages to review",
      value:
        dashboardSummary.newMessages.length,
      path: "/admin/messages",
      isHealthy:
        dashboardSummary.newMessages.length ===
        0,
    },
  ];

  if (isLoading) {
    return (
      <section className="admin-dashboard">
        <div className="dashboard-loading">
          <LoaderCircle
            size={30}
            className="dashboard-spin"
            aria-hidden="true"
          />

          <strong>Loading dashboard</strong>

          <p>
            Retrieving the latest festival
            information.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header__content">
          <div className="dashboard-header__eyebrow">
            <Sparkles
              size={15}
              aria-hidden="true"
            />
            <span>Festival control center</span>
          </div>

          <h1>Dashboard overview</h1>

          <p>
            Review website content, upcoming
            events, visitor messages and ticket
            availability.
          </p>
        </div>

        <div className="dashboard-header__actions">
          <div className="dashboard-system-status">
            <span
              className="dashboard-system-status__indicator"
              aria-hidden="true"
            />

            <div>
              <strong>Admin API connected</strong>
              <span>
                {lastUpdatedAt
                  ? `Updated ${lastUpdatedAt.toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}`
                  : "Dashboard ready"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="dashboard-refresh-button"
            onClick={() =>
              void loadDashboard(true)
            }
            disabled={isRefreshing}
          >
            <RefreshCw
              size={16}
              className={
                isRefreshing
                  ? "dashboard-spin"
                  : undefined
              }
              aria-hidden="true"
            />

            {isRefreshing
              ? "Refreshing"
              : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="dashboard-feedback"
          role="alert"
        >
          <AlertCircle
            size={18}
            aria-hidden="true"
          />

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              void loadDashboard(true)
            }
          >
            Try again
          </button>
        </div>
      )}

      <div className="dashboard-stats">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <Link
              to={statistic.path}
              className={`dashboard-stat-card ${statistic.className}`}
              key={statistic.title}
            >
              <div className="dashboard-stat-card__top">
                <div className="dashboard-stat-card__icon">
                  <Icon
                    size={21}
                    aria-hidden="true"
                  />
                </div>

                <ArrowRight
                  size={17}
                  className="dashboard-stat-card__arrow"
                  aria-hidden="true"
                />
              </div>

              <div className="dashboard-stat-card__content">
                <span>{statistic.title}</span>
                <strong>{statistic.value}</strong>
                <small>
                  {statistic.description}
                </small>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="dashboard-primary-grid">
        <article className="dashboard-panel dashboard-event-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__label">
                Next published event
              </span>
              <h2>Upcoming event</h2>
            </div>

            <Link
              to="/admin/events"
              className="dashboard-panel__link"
            >
              View events
              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>
          </div>

          {dashboardSummary.nextEvent ? (
            <div className="dashboard-event-card">
              <div className="dashboard-event-card__main">
                <div className="dashboard-event-card__date">
                  <span>
                    {nextEventDate.month}
                  </span>
                  <strong>
                    {nextEventDate.day}
                  </strong>
                </div>

                <div className="dashboard-event-card__info">
                  <span className="dashboard-event-card__status">
                    {formatStatus(
                      dashboardSummary.nextEvent
                        .status,
                    )}
                  </span>

                  <h3>
                    {
                      dashboardSummary.nextEvent
                        .title
                    }
                  </h3>

                  <p>
                    {dashboardSummary.nextEvent
                      .location ||
                      "Location unavailable"}
                    {" · "}
                    {formatDate(
                      dashboardSummary.nextEvent
                        .date,
                    )}
                  </p>
                </div>
              </div>

              <div className="dashboard-event-card__details">
                <div>
                  <span>
                    <Ticket
                      size={16}
                      aria-hidden="true"
                    />
                    Ticket types
                  </span>

                  <strong>
                    {
                      data.tickets.filter(
                        (ticket) =>
                          ticket.eventId ===
                          dashboardSummary
                            .nextEvent?.id,
                      ).length
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    <Clock3
                      size={16}
                      aria-hidden="true"
                    />
                    Event date
                  </span>

                  <strong>
                    {formatDate(
                      dashboardSummary.nextEvent
                        .date,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    <ExternalLink
                      size={16}
                      aria-hidden="true"
                    />
                    Purchase page
                  </span>

                  <strong>
                    {dashboardSummary.nextEvent
                      .ticketPurchaseUrl
                      ? "Connected"
                      : "Missing"}
                  </strong>
                </div>
              </div>

              <div className="dashboard-event-card__footer">
                <Link
                  to={`/admin/events/${dashboardSummary.nextEvent.id}/edit`}
                >
                  Manage event
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                  />
                </Link>

                {dashboardSummary.nextEvent
                  .ticketPurchaseUrl && (
                  <a
                    href={
                      dashboardSummary.nextEvent
                        .ticketPurchaseUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open ticket page
                    <ExternalLink
                      size={15}
                      aria-hidden="true"
                    />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="dashboard-empty-state">
              <CalendarDays
                size={28}
                aria-hidden="true"
              />

              <strong>
                No upcoming published event
              </strong>

              <p>
                Publish an upcoming event to
                display it here.
              </p>

              <Link to="/admin/events">
                Manage events
              </Link>
            </div>
          )}
        </article>

        <article className="dashboard-panel dashboard-actions-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__label">
                Common tasks
              </span>
              <h2>Quick actions</h2>
            </div>
          </div>

          <div className="dashboard-quick-actions">
            <Link
              to="/admin/events/create"
              className="dashboard-quick-action"
            >
              <span className="dashboard-quick-action__icon">
                <Plus
                  size={19}
                  aria-hidden="true"
                />
              </span>

              <span className="dashboard-quick-action__copy">
                <strong>Create event</strong>
                <small>
                  Add a new festival event
                </small>
              </span>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/admin/tickets"
              className="dashboard-quick-action"
            >
              <span className="dashboard-quick-action__icon">
                <Ticket
                  size={19}
                  aria-hidden="true"
                />
              </span>

              <span className="dashboard-quick-action__copy">
                <strong>Manage tickets</strong>
                <small>
                  Add ticket previews and URLs
                </small>
              </span>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/admin/gallery"
              className="dashboard-quick-action"
            >
              <span className="dashboard-quick-action__icon">
                <Upload
                  size={19}
                  aria-hidden="true"
                />
              </span>

              <span className="dashboard-quick-action__copy">
                <strong>Upload gallery</strong>
                <small>
                  Add festival photos
                </small>
              </span>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/admin/messages"
              className="dashboard-quick-action"
            >
              <span className="dashboard-quick-action__icon">
                <MessageSquare
                  size={19}
                  aria-hidden="true"
                />
              </span>

              <span className="dashboard-quick-action__copy">
                <strong>Review messages</strong>
                <small>
                  Respond to visitor inquiries
                </small>
              </span>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>
          </div>
        </article>
      </div>

      <div className="dashboard-secondary-grid">
        <article className="dashboard-panel dashboard-activity-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__label">
                Latest updates
              </span>
              <h2>Recent activity</h2>
            </div>

            <span className="dashboard-unread-badge">
              {data.unreadNotifications} unread
            </span>
          </div>

          {data.notifications.length > 0 ? (
            <div className="dashboard-activity-list">
              {data.notifications.map(
                (notification) => {
                  const Icon =
                    getNotificationIcon(
                      notification.type,
                    );

                  return (
                    <Link
                      key={notification.id}
                      to={
                        notification.link ??
                        "/admin"
                      }
                      className={`dashboard-activity-item ${getNotificationClassName(
                        notification.type,
                      )} ${
                        !notification.isRead
                          ? "dashboard-activity-item--unread"
                          : ""
                      }`}
                    >
                      <span className="dashboard-activity-item__icon">
                        <Icon
                          size={18}
                          aria-hidden="true"
                        />
                      </span>

                      <span className="dashboard-activity-item__content">
                        <strong>
                          {notification.title}
                        </strong>
                        <small>
                          {notification.message}
                        </small>
                      </span>

                      <span className="dashboard-activity-item__type">
                        {getNotificationLabel(
                          notification.type,
                        )}
                      </span>

                      <time
                        dateTime={
                          notification.createdAt
                        }
                      >
                        {formatRelativeTime(
                          notification.createdAt,
                        )}
                      </time>
                    </Link>
                  );
                },
              )}
            </div>
          ) : (
            <div className="dashboard-empty-state dashboard-empty-state--compact">
              <Bell
                size={25}
                aria-hidden="true"
              />
              <strong>No recent activity</strong>
              <p>
                New notifications will appear
                here.
              </p>
            </div>
          )}
        </article>

        <article className="dashboard-panel dashboard-health-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__label">
                Content checks
              </span>
              <h2>Content health</h2>
            </div>
          </div>

          <div className="dashboard-health-list">
            {contentHealthItems.map((item) => (
              <Link
                to={item.path}
                className="dashboard-health-item"
                key={item.label}
              >
                <span
                  className={`dashboard-health-item__icon ${
                    item.isHealthy
                      ? "dashboard-health-item__icon--healthy"
                      : "dashboard-health-item__icon--warning"
                  }`}
                >
                  {item.isHealthy ? (
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertCircle
                      size={18}
                      aria-hidden="true"
                    />
                  )}
                </span>

                <span className="dashboard-health-item__copy">
                  <strong>{item.label}</strong>
                  <small>
                    {item.isHealthy
                      ? "No action required"
                      : "Review recommended"}
                  </small>
                </span>

                <span className="dashboard-health-item__value">
                  {item.value}
                </span>
              </Link>
            ))}
          </div>

          <div className="dashboard-ticket-summary">
            <div>
              <span>Available tickets</span>
              <strong>
                {
                  dashboardSummary
                    .availableTickets.length
                }
              </strong>
            </div>

            <div>
              <span>Sold out</span>
              <strong>
                {
                  dashboardSummary
                    .soldOutTickets.length
                }
              </strong>
            </div>

            <div>
              <span>Unread alerts</span>
              <strong>
                {data.unreadNotifications}
              </strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;