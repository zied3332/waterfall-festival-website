import SectionTitle from "../common/SectionTitle";
import EventCard from "./EventCard";
import { events } from "../../data/events";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "./Events.css";

function UpcomingEventsSection() {
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

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={34}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
          className="events-swiper"
        >
          {events.map((event) => (
            <SwiperSlide key={event.id}>
              <EventCard {...event} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default UpcomingEventsSection;