import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  LoaderCircle,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  deleteEvent,
  getAdminEvents,
} from "../../services/events.service";

import type {
  Event,
  EventStatus,
} from "../../types/event";

import "../style/admin-events.css";

type StatusFilter =
  | "ALL"
  | "PUBLISHED"
  | "DRAFT"
  | "COMPLETED"
  | "CANCELLED";

type SortOption =
  | "UPCOMING"
  | "NEWEST"
  | "OLDEST"
  | "TITLE";

type TicketData = {
  sold: number;
  capacity: number;
  remaining: number;
  percentage: number;
};

const statusOptions: Array<{
  label: string;
  value: StatusFilter;
}> = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Published",
    value: "PUBLISHED",
  },
  {
    label: "Draft",
    value: "DRAFT",
  },
  {
    label: "Completed",
    value: "COMPLETED",
  },
  {
    label: "Cancelled",
    value: "CANCELLED",
  },
];

const sortOptions: Array<{
  label: string;
  value: SortOption;
}> = [
  {
    label: "Upcoming first",
    value: "UPCOMING",
  },
  {
    label: "Newest first",
    value: "NEWEST",
  },
  {
    label: "Oldest first",
    value: "OLDEST",
  },
  {
    label: "Title A–Z",
    value: "TITLE",
  },
];

function formatStatus(status: EventStatus): string {
  return status
    .toLowerCase()
    .replace(/^\w/, (character) =>
      character.toUpperCase(),
    );
}

function parseEventDate(dateValue: string): Date | null {
  const date = new Date(dateValue);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function formatEventDate(dateValue: string): string {
  const date = parseEventDate(dateValue);

  if (!date) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatEventTime(dateValue: string): string {
  const date = parseEventDate(dateValue);

  if (!date) {
    return "Time unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getRelativeTiming(dateValue: string): string {
  const date = parseEventDate(dateValue);

  if (!date) {
    return "Date unavailable";
  }

  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startOfEventDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const differenceInDays = Math.round(
    (startOfEventDay.getTime() -
      startOfToday.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  if (differenceInDays === 0) {
    return "Today";
  }

  if (differenceInDays === 1) {
    return "Tomorrow";
  }

  if (differenceInDays > 1) {
    return `In ${differenceInDays} days`;
  }

  if (differenceInDays === -1) {
    return "Yesterday";
  }

  return `${Math.abs(differenceInDays)} days ago`;
}

function getTicketData(event: Event): TicketData | null {
  if (
    event.capacity === null ||
    event.remainingTickets === null
  ) {
    return null;
  }

  const capacity = Math.max(event.capacity, 0);
  const remaining = Math.max(
    Math.min(event.remainingTickets, capacity),
    0,
  );
  const sold = Math.max(capacity - remaining, 0);

  const percentage =
    capacity > 0
      ? Math.min(
          Math.round((sold / capacity) * 100),
          100,
        )
      : 0;

  return {
    sold,
    capacity,
    remaining,
    percentage,
  };
}

function formatTicketNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(
    value,
  );
}

function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("ALL");

  const [sortOption, setSortOption] =
    useState<SortOption>("UPCOMING");

  const [eventToDelete, setEventToDelete] =
    useState<Event | null>(null);

  const [openMenuId, setOpenMenuId] =
    useState<number | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  async function loadEvents(): Promise<void> {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const adminEvents =
        await getAdminEvents();

      setEvents(adminEvents);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load events.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadEvents();
  }, []);

  useEffect(() => {
    function handleEscapeKey(
      event: KeyboardEvent,
    ): void {
      if (event.key === "Escape") {
        setOpenMenuId(null);

        if (!isDeleting) {
          setEventToDelete(null);
          setDeleteError("");
        }
      }
    }

    document.addEventListener(
      "keydown",
      handleEscapeKey,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscapeKey,
      );
    };
  }, [isDeleting]);

  const eventCounts = useMemo(
    () => ({
      ALL: events.length,
      PUBLISHED: events.filter(
        (event) =>
          event.status === "PUBLISHED",
      ).length,
      DRAFT: events.filter(
        (event) =>
          event.status === "DRAFT",
      ).length,
      COMPLETED: events.filter(
        (event) =>
          event.status === "COMPLETED",
      ).length,
      CANCELLED: events.filter(
        (event) =>
          event.status === "CANCELLED",
      ).length,
    }),
    [events],
  );

  const totalTicketsSold = useMemo(
    () =>
      events.reduce((total, event) => {
        const ticketData = getTicketData(event);

        return total + (ticketData?.sold ?? 0);
      }, 0),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    const matchingEvents = events.filter(
      (event) => {
        const matchesSearch =
          event.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          event.location
            .toLowerCase()
            .includes(normalizedSearch) ||
          event.slug
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          selectedStatus === "ALL" ||
          event.status === selectedStatus;

        return matchesSearch && matchesStatus;
      },
    );

    return [...matchingEvents].sort(
      (firstEvent, secondEvent) => {
        if (sortOption === "TITLE") {
          return firstEvent.title.localeCompare(
            secondEvent.title,
          );
        }

        const firstDate =
          parseEventDate(firstEvent.date)?.getTime() ??
          0;

        const secondDate =
          parseEventDate(secondEvent.date)?.getTime() ??
          0;

        if (sortOption === "OLDEST") {
          return firstDate - secondDate;
        }

        if (sortOption === "NEWEST") {
          return secondDate - firstDate;
        }

        const now = Date.now();

        const firstIsUpcoming =
          firstDate >= now;
        const secondIsUpcoming =
          secondDate >= now;

        if (
          firstIsUpcoming !== secondIsUpcoming
        ) {
          return firstIsUpcoming ? -1 : 1;
        }

        if (firstIsUpcoming) {
          return firstDate - secondDate;
        }

        return secondDate - firstDate;
      },
    );
  }, [
    events,
    searchTerm,
    selectedStatus,
    sortOption,
  ]);

  function openDeleteModal(event: Event): void {
    setDeleteError("");
    setEventToDelete(event);
    setOpenMenuId(null);
  }

  function closeDeleteModal(): void {
    if (isDeleting) {
      return;
    }

    setEventToDelete(null);
    setDeleteError("");
  }

  function clearFilters(): void {
    setSearchTerm("");
    setSelectedStatus("ALL");
    setSortOption("UPCOMING");
  }

  async function handleDeleteEvent(): Promise<void> {
    if (!eventToDelete || isDeleting) {
      return;
    }

    const eventId = eventToDelete.id;

    try {
      setIsDeleting(true);
      setDeleteError("");

      await deleteEvent(eventId);

      setEvents((currentEvents) =>
        currentEvents.filter(
          (event) => event.id !== eventId,
        ),
      );

      setEventToDelete(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Unable to delete the event.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="admin-events">
      <header className="admin-events__header">
        <div className="admin-events__heading">
          <span className="admin-events__eyebrow">
            <CalendarDays size={15} />
            Event overview
          </span>

          <p>
            Manage schedules, publishing, locations,
            and ticket availability.
          </p>
        </div>

        <Link
          to="/admin/events/new"
          className="admin-events__add-button"
        >
          <Plus size={17} />
          Add Event
        </Link>
      </header>

      <div className="admin-events__stats">
        <article className="admin-events__stat-card admin-events__stat-card--purple">
          <div className="admin-events__stat-icon">
            <CalendarDays size={18} />
          </div>

          <div>
            <span>Total Events</span>
            <strong>{events.length}</strong>
            <small>All festival events</small>
          </div>
        </article>

        <article className="admin-events__stat-card admin-events__stat-card--green">
          <div className="admin-events__stat-icon">
            <CheckCircle2 size={18} />
          </div>

          <div>
            <span>Published</span>
            <strong>
              {eventCounts.PUBLISHED}
            </strong>
            <small>Live and visible</small>
          </div>
        </article>

        <article className="admin-events__stat-card admin-events__stat-card--orange">
          <div className="admin-events__stat-icon">
            <Clock3 size={18} />
          </div>

          <div>
            <span>Drafts</span>
            <strong>{eventCounts.DRAFT}</strong>
            <small>Not published</small>
          </div>
        </article>

        <article className="admin-events__stat-card admin-events__stat-card--cyan">
          <div className="admin-events__stat-icon">
            <Ticket size={18} />
          </div>

          <div>
            <span>Tickets Sold</span>
            <strong>
              {formatTicketNumber(
                totalTicketsSold,
              )}
            </strong>
            <small>Across configured events</small>
          </div>
        </article>
      </div>

      <div className="admin-events__content">
        <div className="admin-events__toolbar">
          <div className="admin-events__search">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search by title, location, or slug..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-events__clear-search"
                onClick={() =>
                  setSearchTerm("")
                }
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <label className="admin-events__sort">
            <span>Sort</span>

            <select
              value={sortOption}
              onChange={(event) =>
                setSortOption(
                  event.target
                    .value as SortOption,
                )
              }
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div
          className="admin-events__filters"
          aria-label="Filter events by status"
        >
          {statusOptions.map((status) => (
            <button
              type="button"
              key={status.value}
              className={
                selectedStatus === status.value
                  ? "admin-events__filter admin-events__filter--active"
                  : "admin-events__filter"
              }
              onClick={() =>
                setSelectedStatus(status.value)
              }
            >
              <span>{status.label}</span>

              <small>
                {eventCounts[status.value]}
              </small>
            </button>
          ))}
        </div>

        <div className="admin-events__table-header">
          <div>
            <h2>Festival Events</h2>

            <p>
              Showing {filteredEvents.length} of{" "}
              {events.length} events
            </p>
          </div>

          <span className="admin-events__result-count">
            {filteredEvents.length} results
          </span>
        </div>

        {isLoading ? (
          <div className="admin-events__state">
            <LoaderCircle
              className="admin-events__loading-icon"
              size={28}
            />

            <h3>Loading events</h3>

            <p>
              Retrieving festival events from the
              server.
            </p>
          </div>
        ) : errorMessage ? (
          <div className="admin-events__state admin-events__state--error">
            <div className="admin-events__state-icon">
              <AlertCircle size={26} />
            </div>

            <h3>Unable to load events</h3>

            <p>{errorMessage}</p>

            <button
              type="button"
              onClick={() =>
                void loadEvents()
              }
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="admin-events__table-wrapper">
            <table className="admin-events__table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Schedule</th>
                  <th>Tickets</th>
                  <th>Status</th>
                  <th aria-label="Event actions" />
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map(
                  (event) => {
                    const ticketData =
                      getTicketData(event);

                    const statusClass =
                      event.status.toLowerCase();

                    return (
                      <tr key={event.id}>
                        <td data-label="Event">
                          <div className="admin-events__event-info">
                            <div className="admin-events__event-image">
                              {event.heroImageUrl ? (
                                <img
                                  src={
                                    event.heroImageUrl
                                  }
                                  alt=""
                                />
                              ) : (
                                <CalendarDays
                                  size={21}
                                />
                              )}
                            </div>

                            <div className="admin-events__event-text">
                              <strong>
                                {event.title}
                              </strong>

                              <span>
                                /{event.slug}
                              </span>

                              <small>
                                <MapPin size={13} />
                                {event.location}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td data-label="Schedule">
                          <div className="admin-events__details">
                            <span>
                              <CalendarDays
                                size={14}
                              />

                              {formatEventDate(
                                event.date,
                              )}
                            </span>

                            <span>
                              <Clock3 size={14} />

                              {formatEventTime(
                                event.date,
                              )}
                            </span>
                          </div>
                        </td>

                        <td data-label="Tickets">
                          {ticketData ? (
                            <div className="admin-events__ticket-data">
                              <div className="admin-events__ticket-numbers">
                                <strong>
                                  {formatTicketNumber(
                                    ticketData.sold,
                                  )}
                                </strong>

                                <span>
                                  /{" "}
                                  {formatTicketNumber(
                                    ticketData.capacity,
                                  )}{" "}
                                  sold
                                </span>
                              </div>

                              <div
                                className="admin-events__ticket-progress"
                                aria-label={`${ticketData.percentage}% of tickets sold`}
                              >
                                <span
                                  style={{
                                    width: `${ticketData.percentage}%`,
                                  }}
                                />
                              </div>

                              <small>
                                {formatTicketNumber(
                                  ticketData.remaining,
                                )}{" "}
                                remaining ·{" "}
                                {ticketData.percentage}%
                              </small>
                            </div>
                          ) : (
                            <span className="admin-events__not-available">
                              Not configured
                            </span>
                          )}
                        </td>

                        <td data-label="Status">
                          <div className="admin-events__status-cell">
                            <span
                              className={`admin-events__status admin-events__status--${statusClass}`}
                            >
                              <span className="admin-events__status-dot" />

                              {formatStatus(
                                event.status,
                              )}
                            </span>

                            <small>
                              {getRelativeTiming(
                                event.date,
                              )}
                            </small>
                          </div>
                        </td>

                        <td data-label="Actions">
                          <div className="admin-events__actions">
                            {event.status ===
                              "PUBLISHED" && (
                              <Link
                                to={`/events/${event.slug}`}
                                className="admin-events__action-button"
                                aria-label={`View ${event.title}`}
                                title="View event"
                              >
                                <Eye size={16} />
                              </Link>
                            )}

                            <Link
                              to={`/admin/events/${event.id}/edit`}
                              className="admin-events__action-button"
                              aria-label={`Edit ${event.title}`}
                              title="Edit event"
                            >
                              <Edit3 size={16} />
                            </Link>

                            <div className="admin-events__more-wrapper">
                              <button
                                type="button"
                                className="admin-events__action-button"
                                aria-label={`More actions for ${event.title}`}
                                aria-expanded={
                                  openMenuId ===
                                  event.id
                                }
                                title="More actions"
                                onClick={() =>
                                  setOpenMenuId(
                                    (currentId) =>
                                      currentId ===
                                      event.id
                                        ? null
                                        : event.id,
                                  )
                                }
                              >
                                <MoreHorizontal
                                  size={17}
                                />
                              </button>

                              {openMenuId ===
                                event.id && (
                                <div className="admin-events__action-menu">
                                  <button
                                    type="button"
                                    className="admin-events__delete-menu-button"
                                    onClick={() =>
                                      openDeleteModal(
                                        event,
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={15}
                                    />
                                    Delete event
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-events__empty">
            <div className="admin-events__empty-icon">
              <Search size={26} />
            </div>

            <h3>No events found</h3>

            <p>
              No events match your current search,
              status, and sorting settings.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {eventToDelete && (
        <div
          className="admin-events__modal-overlay"
          role="presentation"
          onClick={closeDeleteModal}
        >
          <div
            className="admin-events__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="admin-events__modal-close"
              onClick={closeDeleteModal}
              aria-label="Close delete confirmation"
              disabled={isDeleting}
            >
              <X size={18} />
            </button>

            <div className="admin-events__modal-icon">
              <Trash2 size={22} />
            </div>

            <h2 id="delete-event-title">
              Delete this event?
            </h2>

            <p>
              You are about to delete{" "}
              <strong>
                {eventToDelete.title}
              </strong>
              . This action cannot be undone.
            </p>

            {deleteError && (
              <div
                className="admin-events__delete-error"
                role="alert"
              >
                <AlertCircle size={15} />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="admin-events__modal-actions">
              <button
                type="button"
                className="admin-events__cancel-button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-events__confirm-delete"
                onClick={() =>
                  void handleDeleteEvent()
                }
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <LoaderCircle
                      size={15}
                      className="admin-events__loading-icon"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete Event
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminEvents;