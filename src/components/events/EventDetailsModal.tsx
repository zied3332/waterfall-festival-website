import {
  type MouseEvent,
  useEffect,
  useId,
  useRef,
} from "react";

import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Ticket,
  X,
} from "lucide-react";

import type { Event } from "../../types/event";

import "./EventDetailsModal.css";

type EventDetailsModalProps = {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
};

function formatEventDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date to be announced";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function formatEventTime(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Time to be announced";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(parsedDate);
}

function getEventBadge(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Coming soon";
  }

  return parsedDate.getTime() >= Date.now()
    ? "Upcoming event"
    : "Past event";
}

function EventDetailsModal({
  event,
  isOpen,
  onClose,
}: EventDetailsModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const closeButtonRef =
    useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen || !event) {
      return;
    }

    const previousBodyOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    function handleKeyDown(
      keyboardEvent: KeyboardEvent,
    ): void {
      if (keyboardEvent.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.clearTimeout(focusTimer);

      document.body.style.overflow =
        previousBodyOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [event, isOpen, onClose]);

  if (!isOpen || !event) {
    return null;
  }

  const eventUrl = `/events/${event.slug}`;

  const location =
    event.location?.trim() ||
    "Koh Phangan, Thailand";

  const description =
    event.description?.trim() ||
    "Discover an unforgettable Waterfall Festival experience with music, performances, and tropical island energy.";

  const ticketPurchaseUrl =
    event.ticketPurchaseUrl?.trim() || null;

  function handleBackdropMouseDown(
    mouseEvent: MouseEvent<HTMLDivElement>,
  ): void {
    if (
      mouseEvent.target ===
      mouseEvent.currentTarget
    ) {
      onClose();
    }
  }

  const modalContent = (
    <div
      className="event-modal"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className="event-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="event-modal__close"
          aria-label="Close event details"
          onClick={onClose}
        >
          <X
            size={22}
            aria-hidden="true"
          />
        </button>

        <div className="event-modal__layout">
          <div className="event-modal__poster-column">
            <button
              type="button"
              className="event-modal__poster-button"
              aria-label={`View the ${event.title} poster`}
            >
              {event.heroImageUrl ? (
                <img
                  src={event.heroImageUrl}
                  alt={`${event.title} event poster`}
                  className="event-modal__poster"
                />
              ) : (
                <div className="event-modal__poster-placeholder">
                  <CalendarDays
                    size={40}
                    aria-hidden="true"
                  />

                  <span>
                    Event poster coming soon
                  </span>
                </div>
              )}
            </button>
          </div>

          <div className="event-modal__content">
            <div className="event-modal__heading">
              <span className="event-modal__badge">
                {getEventBadge(event.date)}
              </span>

              <h2
                id={titleId}
                className="event-modal__title"
              >
                {event.title}
              </h2>
            </div>

            <div className="event-modal__meta">
              <div className="event-modal__meta-item">
                <span className="event-modal__meta-icon">
                  <CalendarDays
                    size={20}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <small>Date</small>

                  <strong>
                    {formatEventDate(event.date)}
                  </strong>
                </div>
              </div>

              <div className="event-modal__meta-item">
                <span className="event-modal__meta-icon">
                  <Clock3
                    size={20}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <small>Time</small>

                  <strong>
                    {formatEventTime(event.date)}
                  </strong>
                </div>
              </div>

              <div className="event-modal__meta-item">
                <span className="event-modal__meta-icon">
                  <MapPin
                    size={20}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <small>Location</small>

                  <strong>{location}</strong>
                </div>
              </div>
            </div>

            <div className="event-modal__section">
              <p className="event-modal__section-label">
                About this event
              </p>

              <p
                id={descriptionId}
                className="event-modal__description"
              >
                {description}
              </p>
            </div>

            <div className="event-modal__section">
              <p className="event-modal__section-label">
                Event information
              </p>

              <div className="event-modal__information">
                <div>
                  <span>Status</span>

                  <strong>
                    {getEventBadge(event.date)}
                  </strong>
                </div>

                <div>
                  <span>Organizer</span>

                  <strong>
                    Waterfall Festival
                  </strong>
                </div>

                {event.capacity !== null && (
                  <div>
                    <span>Capacity</span>

                    <strong>
                      {event.capacity.toLocaleString()}
                    </strong>
                  </div>
                )}

                {event.remainingTickets !==
                  null && (
                  <div>
                    <span>
                      Remaining tickets
                    </span>

                    <strong>
                      {event.remainingTickets.toLocaleString()}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <div className="event-modal__actions">
              {ticketPurchaseUrl && (
                <a
                  href={ticketPurchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-modal__action event-modal__action--primary"
                >
                  <Ticket
                    size={19}
                    aria-hidden="true"
                  />

                  <span>
                    <strong>Get Tickets</strong>
                    <small>
                      Continue to official booking
                    </small>
                  </span>

                  <ExternalLink
                    size={18}
                    aria-hidden="true"
                  />
                </a>
              )}

              <Link
                to={eventUrl}
                className="event-modal__action event-modal__action--secondary"
                onClick={onClose}
              >
                <ExternalLink
                  size={19}
                  aria-hidden="true"
                />

                <span>
                  <strong>
                    View Event Page
                  </strong>
                  <small>
                    See complete event details
                  </small>
                </span>

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(
    modalContent,
    document.body,
  );
}

export default EventDetailsModal;