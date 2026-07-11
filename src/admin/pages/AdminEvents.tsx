import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Edit3,
  Eye,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { events as initialEvents } from "../../data/events";
import "../style/admin-events.css";

type EventStatus = "Published" | "Draft" | "Sold Out";

type AdminEvent = (typeof initialEvents)[number] & {
  status?: EventStatus;
  ticketsSold?: number;
  capacity?: number;
};

const statusOptions = ["All", "Published", "Draft", "Sold Out"] as const;

function AdminEvents() {
  const [events, setEvents] = useState<AdminEvent[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<(typeof statusOptions)[number]>("All");
  const [eventToDelete, setEventToDelete] = useState<AdminEvent | null>(null);
  const [openMenuId, setOpenMenuId] = useState<
    string | number | null
  >(null);

  const getEventStatus = (
    event: AdminEvent,
    index: number,
  ): EventStatus => {
    if (event.status) {
      return event.status;
    }

    if (index === 1) {
      return "Draft";
    }

    if (index === 2) {
      return "Sold Out";
    }

    return "Published";
  };

  const getEventTickets = (event: AdminEvent, index: number) => {
    const capacity = event.capacity ?? 2500;
    const fallbackTickets = [1840, 0, 2500, 960];

    return {
      sold: event.ticketsSold ?? fallbackTickets[index % fallbackTickets.length],
      capacity,
    };
  };

  const eventsWithAdminData = useMemo(
    () =>
      events.map((event, index) => ({
        ...event,
        adminStatus: getEventStatus(event, index),
        ticketData: getEventTickets(event, index),
      })),
    [events],
  );

  const filteredEvents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return eventsWithAdminData.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.location.toLowerCase().includes(normalizedSearch) ||
        event.slug.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        selectedStatus === "All" ||
        event.adminStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [eventsWithAdminData, searchTerm, selectedStatus]);

  const publishedCount = eventsWithAdminData.filter(
    (event) => event.adminStatus === "Published",
  ).length;

  const draftCount = eventsWithAdminData.filter(
    (event) => event.adminStatus === "Draft",
  ).length;

  const totalTicketsSold = eventsWithAdminData.reduce(
    (total, event) => total + event.ticketData.sold,
    0,
  );

  const handleDeleteEvent = () => {
    if (!eventToDelete) {
      return;
    }

    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== eventToDelete.id),
    );

    setEventToDelete(null);
  };

  const formatTicketNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value);

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
            Create, organize, and manage every festival event displayed on
            the public website.
          </p>
        </div>

        <Link to="/admin/events/new" className="admin-events__add-button">
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
            <small>All festival events</small>
          </div>
        </article>

        <article className="admin-events__stat-card admin-events__stat-card--green">
          <div className="admin-events__stat-icon">
            <CheckCircle2 size={23} />
          </div>

          <div>
            <span>Published</span>
            <strong>{publishedCount}</strong>
            <small>Visible on the website</small>
          </div>
        </article>

        <article className="admin-events__stat-card admin-events__stat-card--orange">
          <div className="admin-events__stat-icon">
            <Clock3 size={23} />
          </div>

          <div>
            <span>Draft Events</span>
            <strong>{draftCount}</strong>
            <small>Waiting to be published</small>
          </div>
        </article>

        <article className="admin-events__stat-card admin-events__stat-card--cyan">
          <div className="admin-events__stat-icon">
            <Ticket size={23} />
          </div>

          <div>
            <span>Tickets Sold</span>
            <strong>{formatTicketNumber(totalTicketsSold)}</strong>
            <small>Across all events</small>
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
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-events__clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="admin-events__filters">
            {statusOptions.map((status) => (
              <button
                type="button"
                key={status}
                className={
                  selectedStatus === status
                    ? "admin-events__filter admin-events__filter--active"
                    : "admin-events__filter"
                }
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="admin-events__table-header">
          <div>
            <h2>Festival Events</h2>

            <p>
              Showing {filteredEvents.length} of {events.length} events
            </p>
          </div>

          <span className="admin-events__result-count">
            {filteredEvents.length} results
          </span>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="admin-events__table-wrapper">
            <table className="admin-events__table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date & Location</th>
                  <th>Tickets</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th aria-label="Event actions" />
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map((event) => {
                  const percentage = Math.min(
                    Math.round(
                      (event.ticketData.sold /
                        event.ticketData.capacity) *
                        100,
                    ),
                    100,
                  );

                  return (
                    <tr key={event.id}>
                      <td data-label="Event">
                        <div className="admin-events__event-info">
                          <div className="admin-events__event-image">
                            <CalendarDays size={22} />
                          </div>

                          <div className="admin-events__event-text">
                            <strong>{event.title}</strong>
                            <span>/{event.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td data-label="Date & Location">
                        <div className="admin-events__details">
                          <span>
                            <CalendarDays size={15} />
                            {event.date}
                          </span>

                          <span>
                            <MapPin size={15} />
                            {event.location}
                          </span>
                        </div>
                      </td>

                      <td data-label="Tickets">
                        <div className="admin-events__ticket-data">
                          <div className="admin-events__ticket-numbers">
                            <strong>
                              {formatTicketNumber(event.ticketData.sold)}
                            </strong>

                            <span>
                              /{" "}
                              {formatTicketNumber(
                                event.ticketData.capacity,
                              )}
                            </span>
                          </div>

                          <div className="admin-events__ticket-progress">
                            <span
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <small>{percentage}% sold</small>
                        </div>
                      </td>

                      <td data-label="Price">
                        <strong className="admin-events__price">
                          {event.price || "$99"}
                        </strong>
                      </td>

                      <td data-label="Status">
                        <span
                          className={`admin-events__status admin-events__status--${event.adminStatus
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          <span className="admin-events__status-dot" />
                          {event.adminStatus}
                        </span>
                      </td>

                      <td data-label="Actions">
                        <div className="admin-events__actions">
                          <Link
                            to={`/events/${event.slug}`}
                            className="admin-events__action-button"
                            aria-label={`View ${event.title}`}
                            title="View event"
                          >
                            <Eye size={17} />
                          </Link>

                          <Link
                            to={`/admin/events/${event.id}/edit`}
                            className="admin-events__action-button"
                            aria-label={`Edit ${event.title}`}
                            title="Edit event"
                          >
                            <Edit3 size={17} />
                          </Link>

                          <div className="admin-events__more-wrapper">
                            <button
                              type="button"
                              className="admin-events__action-button"
                              aria-label={`More actions for ${event.title}`}
                              title="More actions"
                              onClick={() =>
                                setOpenMenuId((currentId) =>
                                  currentId === event.id
                                    ? null
                                    : event.id,
                                )
                              }
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {openMenuId === event.id && (
                              <div className="admin-events__action-menu">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEvents((currentEvents) => [
                                      ...currentEvents,
                                      {
                                        ...event,
                                        id: `${event.id}-copy-${Date.now()}`,
                                        title: `${event.title} Copy`,
                                        slug: `${event.slug}-copy`,
                                        status: "Draft",
                                      },
                                    ]);

                                    setOpenMenuId(null);
                                  }}
                                >
                                  <Copy size={16} />
                                  Duplicate
                                </button>

                                <button
                                  type="button"
                                  className="admin-events__delete-menu-button"
                                  onClick={() => {
                                    setEventToDelete(event);
                                    setOpenMenuId(null);
                                  }}
                                >
                                  <Trash2 size={16} />
                                  Delete event
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
              No events match your current search and filter settings.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedStatus("All");
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
          onClick={() => setEventToDelete(null)}
        >
          <div
            className="admin-events__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-event-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="admin-events__modal-close"
              onClick={() => setEventToDelete(null)}
              aria-label="Close delete confirmation"
            >
              <X size={19} />
            </button>

            <div className="admin-events__modal-icon">
              <Trash2 size={24} />
            </div>

            <h2 id="delete-event-title">Delete this event?</h2>

            <p>
              You are about to delete{" "}
              <strong>{eventToDelete.title}</strong>. This action cannot
              be undone.
            </p>

            <div className="admin-events__modal-actions">
              <button
                type="button"
                className="admin-events__cancel-button"
                onClick={() => setEventToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-events__confirm-delete"
                onClick={handleDeleteEvent}
              >
                <Trash2 size={16} />
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminEvents;