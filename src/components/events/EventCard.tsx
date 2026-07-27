import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import type { Event } from "../../types/event";

import "./Events.css";

type EventCardProps = {
  event: Event;
};

function formatEventDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date to be announced";
  }

  return new Intl.DateTimeFormat("en-US", {
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

function EventCard({
  event,
}: EventCardProps) {
  const imageStyle = event.heroImageUrl
    ? {
        backgroundImage: `url("${event.heroImageUrl}")`,
      }
    : undefined;

  return (
    <article className="event-card">
      <Link
        className="event-card__image-link"
        to={`/events/${event.slug}`}
        aria-label={`View details for ${event.title}`}
      >
        <div
          className="event-card__image"
          style={imageStyle}
        >
          <div
            className="event-card__image-overlay"
            aria-hidden="true"
          />

          <span className="event-card__badge">
            Upcoming
          </span>
        </div>
      </Link>

      <div className="event-card__content">
        <div className="event-card__heading">
          <p className="event-card__label">
            Waterfall Festival
          </p>

          <h2 className="event-card__title">
            <Link
              to={`/events/${event.slug}`}
            >
              {event.title}
            </Link>
          </h2>
        </div>

        <div className="event-card__details">
          <div className="event-card__detail">
            <CalendarDays
              size={17}
              aria-hidden="true"
            />

            <span>
              {formatEventDate(event.date)}
            </span>
          </div>

          <div className="event-card__detail">
            <Clock3
              size={17}
              aria-hidden="true"
            />

            <span>
              {formatEventTime(event.date)}
            </span>
          </div>

          <div className="event-card__detail">
            <MapPin
              size={17}
              aria-hidden="true"
            />

            <span>
              {event.location ||
                "Koh Phangan, Thailand"}
            </span>
          </div>
        </div>

        {event.description && (
          <p className="event-card__description">
            {event.description}
          </p>
        )}

        <Link
          to={`/events/${event.slug}`}
          className="event-card__button"
        >
          View Event

          <ArrowRight
            size={18}
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}

export default EventCard;