import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CalendarDays,
  RotateCcw,
} from "lucide-react";

import EventCard from "../components/events/EventCard";
import { getPublicEvents } from "../services/events.service";
import type { Event } from "../types/event";

import "./style/events.css";

const EVENT_SKELETON_COUNT = 3;

function Events() {
  const [events, setEvents] = useState<Event[]>(
    [],
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await getPublicEvents();

      setEvents(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load events.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <main className="events-page">
      <section className="events-hero">
        <div className="events-hero-content">
          <p className="events-label">
            Events
          </p>

          <h1 className="events-title">
            Upcoming Events
          </h1>

          <p className="events-description">
            Discover upcoming parties, special
            nights, and Waterfall Festival
            experiences in Koh Phangan.
          </p>
        </div>
      </section>

      <section className="events-content">
        <div className="events-container">
          {!isLoading &&
            !error &&
            events.length > 0 && (
              <div className="events-section-header">
                <div>
                  <p className="events-section-label">
                    Festival calendar
                  </p>

                  <h2 className="events-section-title">
                    Upcoming experiences
                  </h2>
                </div>

                <div className="events-count">
                  <CalendarDays
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    {events.length}{" "}
                    {events.length === 1
                      ? "event"
                      : "events"}{" "}
                    available
                  </span>
                </div>
              </div>
            )}

          {isLoading && (
            <div
              className="events-grid"
              aria-label="Loading events"
            >
              {Array.from({
                length: EVENT_SKELETON_COUNT,
              }).map((_, index) => (
                <div
                  className="event-skeleton"
                  key={index}
                  aria-hidden="true"
                >
                  <div className="event-skeleton__image" />

                  <div className="event-skeleton__content">
                    <div className="event-skeleton__line event-skeleton__line--small" />

                    <div className="event-skeleton__line event-skeleton__line--title" />

                    <div className="event-skeleton__line" />

                    <div className="event-skeleton__line event-skeleton__line--short" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="events-page-message events-page-message--error">
              <div>
                <h2>
                  We couldn’t load the events
                </h2>

                <p>
                  Something went wrong while
                  fetching the latest festival
                  dates. Please try again.
                </p>
              </div>

              <button
                className="events-retry-button"
                type="button"
                onClick={() =>
                  void loadEvents()
                }
              >
                <RotateCcw
                  size={17}
                  aria-hidden="true"
                />

                Try Again
              </button>
            </div>
          )}

          {!isLoading &&
            !error &&
            events.length === 0 && (
              <div className="events-page-message">
                <span
                  className="events-message-icon"
                  aria-hidden="true"
                >
                  <CalendarDays size={25} />
                </span>

                <div>
                  <h2>
                    No upcoming events yet
                  </h2>

                  <p>
                    New festival dates will appear
                    here as soon as they are
                    announced.
                  </p>
                </div>
              </div>
            )}

          {!isLoading &&
            !error &&
            events.length > 0 && (
              <div className="events-grid">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                  />
                ))}
              </div>
            )}
        </div>
      </section>
    </main>
  );
}

export default Events;