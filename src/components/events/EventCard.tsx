import {
  CalendarDays,
  MapPin,
} from "lucide-react";

import {
  getApiMediaUrl,
} from "../../services/api.service";

import type {
  Event,
} from "../../types/event";

import "./Events.css";

type EventCardProps = {
  event: Event;
  onOpen?: (event: Event) => void;
};

const LOCAL_EVENT_POSTERS: Record<
  string,
  string
> = {
  "waterfall-festival-september-16-2026":
    "/images/events/waterfall-september-16-2026.png",

  "september-24th-2026-waterfall-festival-2-days-before-full-moon-party":
    "/images/events/waterfall-september-24-2026.png",

  "september-28th-2026-waterfall-festival-2-days-after-full-moon-party":
    "/images/events/waterfall-september-28-2026.png",
};

/**
 * ============================================================
 * DATE
 * ============================================================
 */

function formatEventDate(
  date: string,
): string {
  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return "Date coming soon";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(parsedDate);
}

/**
 * ============================================================
 * EVENT BADGE
 * ============================================================
 */

function getEventBadge(
  date: string,
): string {
  const parsedDate =
    new Date(date);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return "Coming soon";
  }

  return parsedDate.getTime() >=
    Date.now()
    ? "Upcoming"
    : "Past event";
}

/**
 * ============================================================
 * EVENT POSTER
 * ============================================================
 *
 * Old events may still use frontend-local posters.
 *
 * New event posters are stored by the backend and returned
 * as paths such as:
 *
 * /uploads/events/event-12-xxxxx.jpg
 *
 * getApiMediaUrl() converts those paths into complete
 * backend URLs.
 *
 * Example:
 *
 * /uploads/events/event-12.jpg
 *
 * becomes:
 *
 * https://api.example.com/uploads/events/event-12.jpg
 *
 * Absolute URLs such as old Cloudinary URLs are preserved.
 * ============================================================
 */

function getEventPoster(
  event: Event,
): string {
  const localPoster =
    LOCAL_EVENT_POSTERS[
      event.slug
    ];

  if (localPoster) {
    return localPoster;
  }

  return (
    getApiMediaUrl(
      event.heroImageUrl,
    ) ?? ""
  );
}

/**
 * ============================================================
 * EVENT CARD
 * ============================================================
 */

function EventCard({
  event,
  onOpen,
}: EventCardProps) {
  const location =
    event.location?.trim() ||
    "Koh Phangan, Thailand";

  const ticketUrl =
    event.ticketPurchaseUrl?.trim() ||
    "";

  const posterUrl =
    getEventPoster(event);

  const cardContent = (
    <div className="event-card">
      <div className="event-card__media">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${event.title} event poster`}
            className="event-card__poster"
            loading="lazy"
          />
        ) : (
          <div className="event-card__poster-placeholder">
            <span>
              Event poster coming soon
            </span>
          </div>
        )}

        <div
          className="event-card__poster-shade"
          aria-hidden="true"
        />

        <div className="event-card__top">
          <span className="event-card__badge">
            {getEventBadge(
              event.date,
            )}
          </span>

          <span className="event-card__view-label">
            {onOpen
              ? "View event"
              : ticketUrl
                ? "Get tickets"
                : "View event"}
          </span>
        </div>

        <div className="event-card__summary">
          <p className="event-card__festival">
            Waterfall Festival
          </p>

          <h2 className="event-card__title">
            {event.title}
          </h2>

          <div className="event-card__metadata">
            <span>
              <CalendarDays
                size={15}
                aria-hidden="true"
              />

              {formatEventDate(
                event.date,
              )}
            </span>

            <span>
              <MapPin
                size={15}
                aria-hidden="true"
              />

              {location}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  /**
   * When an onOpen handler is provided,
   * the whole event card behaves like a button.
   */
  if (onOpen) {
    return (
      <button
        type="button"
        className="event-card__link"
        onClick={() =>
          onOpen(event)
        }
        aria-label={`View ${event.title}`}
      >
        {cardContent}
      </button>
    );
  }

  /**
   * If the event has an external ticket URL,
   * open the ticket provider in a new tab.
   */
  if (ticketUrl) {
    return (
      <a
        href={ticketUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="event-card__link"
        aria-label={`Buy tickets for ${event.title}`}
      >
        {cardContent}
      </a>
    );
  }

  /**
   * Event without ticket URL.
   */
  return (
    <div
      className="event-card__link"
      aria-label={`${event.title} - tickets coming soon`}
    >
      {cardContent}
    </div>
  );
}

export default EventCard;