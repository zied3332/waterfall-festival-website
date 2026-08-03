import {
  CalendarDays,
  MapPin,
} from "lucide-react";

import type { Event } from "../../types/event";

import "./Events.css";

type EventCardProps = {
  event: Event;
  onOpen: (event: Event) => void;
};

function formatEventDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date coming soon";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getEventBadge(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Coming soon";
  }

  return parsedDate.getTime() >= Date.now()
    ? "Upcoming"
    : "Past event";
}

function EventCard({
  event,
  onOpen,
}: EventCardProps) {
  const location =
    event.location?.trim() ||
    "Koh Phangan, Thailand";

  function handleOpen(): void {
    onOpen(event);
  }

  return (
    <article className="event-card">
      <button
        type="button"
        className="event-card__link"
        aria-label={`Open details for ${event.title}`}
        onClick={handleOpen}
      >
        <div className="event-card__poster-wrapper">
          {event.heroImageUrl ? (
            <img
              src={event.heroImageUrl}
              alt={`${event.title} event poster`}
              className="event-card__poster"
              loading="lazy"
            />
          ) : (
            <div className="event-card__poster-placeholder">
              <CalendarDays
                size={38}
                aria-hidden="true"
              />

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
              {getEventBadge(event.date)}
            </span>

            <span className="event-card__view-label">
              View details
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

                {formatEventDate(event.date)}
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
      </button>
    </article>
  );
}

export default EventCard;