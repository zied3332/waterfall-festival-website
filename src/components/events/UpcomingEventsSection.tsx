import SectionTitle from "../common/SectionTitle";
import EventCard from "./EventCard";
import { events } from "../../data/events";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

function UpcomingEventsSection() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          label="Events"
          title="Upcoming Events"
          description="Explore the next Waterfall Festival experiences."
        />

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={30}
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