import {
  useEffect,
  useState,
} from "react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import SectionTitle from "../common/SectionTitle";
import EventCard from "./EventCard";

import { getPublicEvents } from "../../services/events.service.ts";
import type { Event } from "../../types/event";

import "swiper/css";
import "swiper/css/navigation";
import "./Events.css";

function UpcomingEventsSection() {
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
            : "Could not load upcoming events.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadEvents();
  }, []);

  return (
    <section className="events-section">
      <div className="events-section__glow events-section__glow--one" />
      <div className="events-section__glow events-section__glow--two" />

      <div className="events-container">
        <SectionTitle
          label="Events"
          title="Upcoming Events"
          description="Explore the next Waterfall Festival experiences."
        />

        {isLoading && (
          <div className="events-section__message">
            Loading events...
          </div>
        )}

        {!isLoading && error && (
          <div className="events-section__message events-section__message--error">
            {error}
          </div>
        )}

        {!isLoading &&
          !error &&
          events.length === 0 && (
            <div className="events-section__message">
              No upcoming events are available.
            </div>
          )}

        {!isLoading &&
          !error &&
          events.length > 0 && (
            <Swiper
              modules={[Navigation]}
              navigation
              spaceBetween={34}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1200: {
                  slidesPerView: 3,
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
      </div>
    </section>
  );
}

export default UpcomingEventsSection;