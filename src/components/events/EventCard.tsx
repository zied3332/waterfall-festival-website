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
}: EventCardProps) {
  const eventUrl = `/events/${event.slug}`;

  const imageStyle = event.heroImageUrl
    ? {
        backgroundImage: `url("${event.heroImageUrl}")`,
      }
    : undefined;

  const location =
    event.location?.trim() ||
    "Koh Phangan, Thailand";

  return (
    <article className="event-card">
      <Link
        className="event-card__image-link"
        to={eventUrl}
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

          <div className="event-card__image-top">
            <span className="event-card__badge">
              {getEventBadge(event.date)}
            </span>

            <span className="event-card__location-badge">
              <MapPin
                size={13}
                aria-hidden="true"
              />

              Koh Phangan
            </span>
          </div>
        </div>
      </Link>

      <div className="event-card__content">
        <div className="event-card__main">
          <div className="event-card__heading">
            <p className="event-card__label">
              Waterfall Festival
            </p>

            <h2 className="event-card__title">
              <Link to={eventUrl}>
                {event.title}
              </Link>
            </h2>
          </div>

          <div className="event-card__details">
            <div className="event-card__detail">
              <span className="event-card__detail-icon">
                <CalendarDays
                  size={17}
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

            <div className="event-card__detail">
              <span className="event-card__detail-icon">
                <Clock3
                  size={17}
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

            <div className="event-card__detail">
              <span className="event-card__detail-icon">
                <MapPin
                  size={17}
                  aria-hidden="true"
                />
              </span>

              <div>
                <small>Location</small>

                <strong>{location}</strong>
              </div>
            </div>
          </div>

          <p className="event-card__description">
            {event.description?.trim() ||
              "Discover an unforgettable Waterfall Festival experience with music, performances, and tropical island energy."}
          </p>
        </div>

        <div className="event-card__footer">
          <Link
            to={eventUrl}
            className="event-card__button"
            aria-label={`View ${event.title}`}
          >
            <span>View Event</span>

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default EventCard;