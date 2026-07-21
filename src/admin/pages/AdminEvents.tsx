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

function formatStatus(status: EventStatus): string {
  return status
    .toLowerCase()
    .replace(/^\w/, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(dateValue: string): string {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getTicketData(event: Event): {
  sold: number;
  capacity: number;
  percentage: number;
} | null {
  if (
    event.capacity === null ||
    event.remainingTickets === null
  ) {
    return null;
  }

  const sold = Math.max(
    event.capacity - event.remainingTickets,
    0,
  );

  const percentage =
    event.capacity > 0
      ? Math.min(
          Math.round((sold / event.capacity) * 100),
          100,
        )
      : 0;

  return {
    sold,
    capacity: event.capacity,
    percentage,
  };
}

function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("ALL");

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

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return events.filter((event) => {
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
    });
  }, [
    events,
    searchTerm,
    selectedStatus,
  ]);

  const publishedCount = events.filter(
    (event) =>
      event.status === "PUBLISHED",
  ).length;

  const draftCount = events.filter(
    (event) =>
      event.status === "DRAFT",
  ).length;

  const totalTicketsSold = events.reduce(
    (total, event) => {
      const ticketData = getTicketData(event);

      return total + (ticketData?.sold ?? 0);
    },
    0,
  );

  function formatTicketNumber(
    value: number,
  ): string {
    return new Intl.NumberFormat(
      "en-US",
    ).format(value);
  }

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
            <CalendarDays size={16} />
            Festival Management
          </span>

          <h1>Events</h1>

          <p>
            Create, organize, and manage every
            festival event displayed on the public
            website.
          </p>
        </div>

        <Link
          to="/admin/events/new"
          className="admin-events__add-button"
        >
          <Plus size={18} />
          Add New Event
        </Link>
      </header>

      <div className="admin-events__stats">
        <article className="admin-events__stat-card admin-events__stat-card--purple">
          <div className="admin-events__stat-icon">
            <CalendarDays size={23} />
          </div>

          <div>
            <span>Total Events</span>
            <strong>{events.length}</strong>
            <small>
              All festival events
            </small>
          </div>
        </article>

        <article className="admin-events__stat-card admin-events__stat-card--green">
          <div className="admin-events__stat-icon">
            <CheckCircle2 size={23} />
          </div>

          <div>
            <span>Published</span>
            <strong>
              {publishedCount}
            </strong>
            <small>
              Visible on the website
            </small>
          </div>
        </article>

        <article className="admin-events__stat-card admin-events__stat-card--orange">
          <div className="admin-events__stat-icon">
            <Clock3 size={23} />
          </div>

          <div>
            <span>Draft Events</span>
            <strong>{draftCount}</strong>
            <small>
              Waiting to be published
            </small>
          </div>
        </article>

        <article className="admin-events__stat-card admin-events__stat-card--cyan">
          <div className="admin-events__stat-icon">
            <Ticket size={23} />
          </div>

          <div>
            <span>Tickets Sold</span>

            <strong>
              {formatTicketNumber(
                totalTicketsSold,
              )}
            </strong>

            <small>
              Across events with ticket data
            </small>
          </div>
        </article>
      </div>

      <div className="admin-events__content">
        <div className="admin-events__toolbar">
          <div className="admin-events__search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search events by title, location, or slug..."
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
                <X size={16} />
              </button>
            )}
          </div>

          <div className="admin-events__filters">
            {statusOptions.map(
              (status) => (
                <button
                  type="button"
                  key={status.value}
                  className={
                    selectedStatus ===
                    status.value
                      ? "admin-events__filter admin-events__filter--active"
                      : "admin-events__filter"
                  }
                  onClick={() =>
                    setSelectedStatus(
                      status.value,
                    )
                  }
                >
                  {status.label}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="admin-events__table-header">
          <div>
            <h2>Festival Events</h2>

            <p>
              Showing{" "}
              {filteredEvents.length} of{" "}
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
              size={30}
            />

            <h3>Loading events</h3>

            <p>
              Retrieving festival events from
              the server.
            </p>
          </div>
        ) : errorMessage ? (
          <div className="admin-events__state admin-events__state--error">
            <div className="admin-events__state-icon">
              <AlertCircle size={28} />
            </div>

            <h3>
              Unable to load events
            </h3>

            <p>{errorMessage}</p>

            <button
              type="button"
              onClick={() =>
                void loadEvents()
              }
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="admin-events__table-wrapper">
            <table className="admin-events__table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>
                    Date &amp; Location
                  </th>
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
                                  size={22}
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
                            </div>
                          </div>
                        </td>

                        <td data-label="Date & Location">
                          <div className="admin-events__details">
                            <span>
                              <CalendarDays
                                size={15}
                              />

                              {formatDate(
                                event.date,
                              )}
                            </span>

                            <span>
                              <MapPin
                                size={15}
                              />

                              {
                                event.location
                              }
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
                                  )}
                                </span>
                              </div>

                              <div className="admin-events__ticket-progress">
                                <span
                                  style={{
                                    width: `${ticketData.percentage}%`,
                                  }}
                                />
                              </div>

                              <small>
                                {
                                  ticketData.percentage
                                }
                                % sold
                              </small>
                            </div>
                          ) : (
                            <span className="admin-events__not-available">
                              Not configured
                            </span>
                          )}
                        </td>

                        <td data-label="Status">
                          <span
                            className={`admin-events__status admin-events__status--${statusClass}`}
                          >
                            <span className="admin-events__status-dot" />

                            {formatStatus(
                              event.status,
                            )}
                          </span>
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
                                <Eye
                                  size={17}
                                />
                              </Link>
                            )}

                            <Link
                              to={`/admin/events/${event.id}/edit`}
                              className="admin-events__action-button"
                              aria-label={`Edit ${event.title}`}
                              title="Edit event"
                            >
                              <Edit3
                                size={17}
                              />
                            </Link>

                            <div className="admin-events__more-wrapper">
                              <button
                                type="button"
                                className="admin-events__action-button"
                                aria-label={`More actions for ${event.title}`}
                                title="More actions"
                                onClick={() =>
                                  setOpenMenuId(
                                    (
                                      currentId,
                                    ) =>
                                      currentId ===
                                      event.id
                                        ? null
                                        : event.id,
                                  )
                                }
                              >
                                <MoreHorizontal
                                  size={18}
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
                                      size={16}
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
              <Search size={28} />
            </div>

            <h3>No events found</h3>

            <p>
              No events match your current
              search and filter settings.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("ALL");
              }}
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
              <X size={19} />
            </button>

            <div className="admin-events__modal-icon">
              <Trash2 size={24} />
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
                <AlertCircle size={16} />
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
                      size={16}
                      className="admin-events__loading-icon"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
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