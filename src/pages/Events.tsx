import { useEffect, useState } from "react";

import EventCard from "../components/events/EventCard";
import { getPublicEvents } from "../services/events.service.ts";
import type { Event } from "../types/event";

import "./style/events.css";

function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
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
    };

    void loadEvents();
  }, []);

  return (
    <section className="events-page">
      <div className="events-container">
        <div className="events-hero">
          <p className="events-label">
            Events
          </p>

          <h1 className="events-title">
            Upcoming Events
          </h1>

          <p className="events-description">
            Explore upcoming Waterfall Festival
            experiences, parties, and special nights
            in Koh Phangan.
          </p>
        </div>

        {isLoading && (
          <div className="events-page__message">
            Loading events...
          </div>
        )}

        {!isLoading && error && (
          <div className="events-page__message events-page__message--error">
            {error}
          </div>
        )}

        {!isLoading &&
          !error &&
          events.length === 0 && (
            <div className="events-page__message">
              No upcoming events are currently
              available.
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
  );
}

export default Events;