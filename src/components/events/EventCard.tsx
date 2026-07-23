import { Link } from "react-router-dom";
import {
  Calendar,
  Clock3,
  Heart,
  MapPin,
} from "lucide-react";

import type { Event } from "../../types/event";

import "./Events.css";

type EventCardProps = {
  event: Event;
};

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatEventTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function EventCard({ event }: EventCardProps) {
  return (
    <article className="event-card">
      <div
        className="event-card__image"
        data-event={event.slug}
        style={
          event.heroImageUrl
            ? {
                backgroundImage: `url("${event.heroImageUrl}")`,
              }
            : undefined
        }
      >
        <div className="event-card__overlay" />

        <div className="event-card__badge">
          <span />
          Upcoming
        </div>

        <button
          className="event-card__heart"
          type="button"
          aria-label={`Add ${event.title} to favorites`}
        >
          <Heart size={26} strokeWidth={1.8} />
        </button>
      </div>

      <div className="event-card__content">
        <p className="event-card__label">
          Waterfall Festival
        </p>

        <h2 className="event-card__title">
          {event.title}
        </h2>

        <p className="event-card__place">
          Koh Phangan
        </p>

        <div className="event-card__details">
          <div className="event-card__detail">
            <Calendar size={17} />

            <span>
              {formatEventDate(event.date)}
            </span>
          </div>

          <div className="event-card__detail">
            <Clock3 size={17} />

            <span>
              {formatEventTime(event.date)}
            </span>
          </div>

          <div className="event-card__detail">
            <MapPin size={17} />

            <span>{event.location}</span>
          </div>
        </div>

        <p className="event-card__description">
          {event.description}
        </p>

        <Link
          to={`/events/${event.slug}`}
          className="event-card__button"
        >
          <span>View Event</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export default EventCard;