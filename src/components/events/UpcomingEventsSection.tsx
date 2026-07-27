import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarDays,
  RotateCcw,
} from "lucide-react";

import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

import { Navigation } from "swiper/modules";

import EventCard from "./EventCard";

import { getPublicEvents } from "../../services/events.service";
import type { Event } from "../../types/event";

import "swiper/css";
import "swiper/css/navigation";
import "./Events.css";

const EVENT_SKELETON_COUNT = 3;

function UpcomingEventsSection() {
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
          : "Could not load upcoming events.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <section className="events-section">
      <div className="events-section__container">
        <div className="events-section__header">
          <div className="events-section__heading">
            <p className="events-section__label">
              Festival calendar
            </p>

            <h2 className="events-section__title">
              Upcoming Events
            </h2>

            <p className="events-section__description">
              Discover the next Waterfall
              Festival experiences in Koh
              Phangan.
            </p>
          </div>

          {!isLoading &&
            !error &&
            events.length > 0 && (
              <Link
                className="events-section__view-all"
                to="/events"
              >
                View all events

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </Link>
            )}
        </div>

        {isLoading && (
          <div
            className="events-section__skeleton-grid"
            aria-label="Loading upcoming events"
          >
            {Array.from({
              length: EVENT_SKELETON_COUNT,
            }).map((_, index) => (
              <div
                className="events-card-skeleton"
                key={index}
                aria-hidden="true"
              >
                <div className="events-card-skeleton__image" />

                <div className="events-card-skeleton__content">
                  <div className="events-card-skeleton__line events-card-skeleton__line--label" />

                  <div className="events-card-skeleton__line events-card-skeleton__line--title" />

                  <div className="events-card-skeleton__line" />

                  <div className="events-card-skeleton__line events-card-skeleton__line--short" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <div className="events-section__message events-section__message--error">
            <div>
              <h3>
                We couldn’t load the events
              </h3>

              <p>
                Something went wrong while
                fetching the latest festival
                dates.
              </p>
            </div>

            <button
              className="events-section__retry"
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
            <div className="events-section__message">
              <span
                className="events-section__message-icon"
                aria-hidden="true"
              >
                <CalendarDays size={24} />
              </span>

              <div>
                <h3>
                  No upcoming events yet
                </h3>

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
            <Swiper
              modules={[Navigation]}
              navigation
              watchOverflow
              spaceBetween={18}
              slidesPerView={1.08}
              breakpoints={{
                480: {
                  slidesPerView: 1.25,
                  spaceBetween: 18,
                },
                640: {
                  slidesPerView: 1.7,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                1100: {
                  slidesPerView: 3,
                  spaceBetween: 22,
                },
              }}
              className="events-swiper"
            >
              {events.map((event) => (
                <SwiperSlide key={event.id}>
                  <EventCard event={event} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}

        {!isLoading &&
          !error &&
          events.length > 0 && (
            <Link
              className="events-section__mobile-view-all"
              to="/events"
            >
              View all events

              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </Link>
          )}
      </div>
    </section>
  );
}

export default UpcomingEventsSection;