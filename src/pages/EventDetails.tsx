import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Music2,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

import { getPublicEventBySlug } from "../services/events.service.ts";
import type { Event } from "../types/event";

import "./style/event-details.css";

const schedule = [
  {
    time: "21:00",
    title: "Gates Open",
    description:
      "Welcome, check-in, food area, and opening atmosphere.",
  },
  {
    time: "22:00",
    title: "Warm-up DJ",
    description:
      "The night begins with tropical house and island rhythms.",
  },
  {
    time: "00:00",
    title: "Main Stage Show",
    description:
      "The headline performance takes over the waterfall stage.",
  },
  {
    time: "02:00",
    title: "Fire Show",
    description:
      "A special fire performance surrounded by music and lights.",
  },
  {
    time: "04:00",
    title: "Sunrise Set",
    description:
      "Finish the night with an unforgettable sunrise experience.",
  },
];

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
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

function EventDetails() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const [event, setEvent] =
    useState<Event | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadEvent = async () => {
      if (!slug) {
        setError("Invalid event link.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data =
          await getPublicEventBySlug(slug);

        setEvent(data);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Event not found.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvent();
  }, [slug]);

  if (isLoading) {
    return (
      <main className="event-details-page">
        <section className="event-not-found">
          <span className="event-not-found__icon">
            <Music2 size={34} />
          </span>

          <p className="event-details-eyebrow">
            Waterfall Festival
          </p>

          <h1>Loading event...</h1>
        </section>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="event-details-page">
        <section className="event-not-found">
          <span className="event-not-found__icon">
            <Music2 size={34} />
          </span>

          <p className="event-details-eyebrow">
            Waterfall Festival
          </p>

          <h1>Event not found</h1>

          <p>
            {error ??
              "The event may have been removed or the link may be incorrect."}
          </p>

          <Link to="/events">
            <ArrowLeft size={18} />
            Back to Events
          </Link>
        </section>
      </main>
    );
  }

  const formattedDate =
    formatEventDate(event.date);

  const formattedTime =
    formatEventTime(event.date);

  return (
    <main className="event-details-page">
      <section className="event-details-hero">
        <div
          className="event-details-hero__background"
          style={
            event.heroImageUrl
              ? {
                  backgroundImage: `url("${event.heroImageUrl}")`,
                }
              : undefined
          }
        />

        <div className="event-details-hero__overlay" />

        <div className="event-details-hero__glow event-details-hero__glow--one" />

        <div className="event-details-hero__glow event-details-hero__glow--two" />

        <div className="event-details-hero__content">
          <Link
            to="/events"
            className="event-details-back"
          >
            <ArrowLeft size={17} />
            All Events
          </Link>

          <div className="event-details-badge">
            <Sparkles size={15} />
            Waterfall Festival Experience
          </div>

          <h1>{event.title}</h1>

          <div className="event-details-hero__meta">
            <span>
              <CalendarDays size={18} />
              {formattedDate}
            </span>

            <span>
              <Clock3 size={18} />
              {formattedTime}
            </span>

            <span>
              <MapPin size={18} />
              {event.location}
            </span>
          </div>

          <p className="event-details-hero__description">
            {event.description}
          </p>

          <div className="event-details-hero__actions">
            <Link
              to="/tickets"
              className="event-details-primary-button"
            >
              <Ticket size={19} />
              Get Tickets
              <ArrowRight size={18} />
            </Link>

            <a
              href="#event-information"
              className="event-details-secondary-button"
            >
              Explore Event
            </a>
          </div>
        </div>

        <div className="event-details-scroll-indicator">
          <span />
          Scroll to explore
        </div>
      </section>

      <section
        className="event-details-content"
        id="event-information"
      >
        <div className="event-details-container">
          <div className="event-info-grid">
            <article className="event-info-card">
              <div className="event-info-card__icon">
                <CalendarDays size={22} />
              </div>

              <div>
                <span>Date</span>
                <strong>{formattedDate}</strong>
              </div>
            </article>

            <article className="event-info-card">
              <div className="event-info-card__icon">
                <Clock3 size={22} />
              </div>

              <div>
                <span>Event Time</span>
                <strong>{formattedTime}</strong>
              </div>
            </article>

            <article className="event-info-card">
              <div className="event-info-card__icon">
                <MapPin size={22} />
              </div>

              <div>
                <span>Location</span>
                <strong>{event.location}</strong>
              </div>
            </article>

            <article className="event-info-card">
              <div className="event-info-card__icon">
                <Users size={22} />
              </div>

              <div>
                <span>Availability</span>

                <strong>
                  {event.remainingTickets !== null
                    ? `${event.remainingTickets} tickets left`
                    : "Available"}
                </strong>
              </div>
            </article>
          </div>

          <section className="event-overview">
            <div className="event-section-heading">
              <div>
                <p className="event-details-eyebrow">
                  The Experience
                </p>

                <h2>About This Event</h2>
              </div>

              <span className="event-section-heading__number">
                01
              </span>
            </div>

            <div className="event-overview__grid">
              <div className="event-overview__description">
                <p>{event.description}</p>
              </div>

              <div className="event-overview__features">
                <div>
                  <Sparkles size={20} />
                  <span>
                    Immersive waterfall stage
                  </span>
                </div>

                <div>
                  <Music2 size={20} />
                  <span>
                    Live music and guest DJs
                  </span>
                </div>

                <div>
                  <Ticket size={20} />
                  <span>
                    Festival ticket experiences
                  </span>
                </div>

                <div>
                  <MapPin size={20} />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="event-schedule-section">
            <div className="event-section-heading">
              <div>
                <p className="event-details-eyebrow">
                  Night Program
                </p>

                <h2>Event Schedule</h2>
              </div>

              <span className="event-section-heading__number">
                02
              </span>
            </div>

            <div className="schedule-list">
              {schedule.map((item, index) => (
                <article
                  className="schedule-item"
                  key={item.time}
                >
                  <div className="schedule-item__timeline">
                    <span className="schedule-item__dot" />

                    {index <
                      schedule.length - 1 && (
                      <span className="schedule-item__line" />
                    )}
                  </div>

                  <time>{item.time}</time>

                  <div className="schedule-item__content">
                    <h3>{item.title}</h3>

                    <p>{item.description}</p>
                  </div>

                  <span className="schedule-item__number">
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>
                </article>
              ))}
            </div>
          </section>

          <section className="event-venue-box">
            <div className="event-venue-box__content">
              <div className="event-venue-box__icon">
                <MapPin size={27} />
              </div>

              <div>
                <p className="event-details-eyebrow">
                  Festival Location
                </p>

                <h2>{event.location}</h2>

                <p>
                  Food, toilets, parking, first aid,
                  and festival areas are available
                  nearby.
                </p>
              </div>
            </div>

            <Link to="/venue">
              View Festival Map
              <ArrowRight size={18} />
            </Link>
          </section>

          <section className="event-final-cta">
            <div className="event-final-cta__glow event-final-cta__glow--one" />

            <div className="event-final-cta__glow event-final-cta__glow--two" />

            <div className="event-final-cta__content">
              <p className="event-details-eyebrow">
                Join the Experience
              </p>

              <h2>
                Ready for an unforgettable night?
              </h2>

              <p>
                Choose your ticket and secure your
                place at the next Waterfall Festival
                experience.
              </p>

              <Link to="/tickets">
                <Ticket size={19} />
                Buy Tickets
                <ArrowRight size={18} />
              </Link>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default EventDetails;