import SectionTitle from "../common/SectionTitle";
import EventCard from "./EventCard";
import { events } from "../../data/events";

function UpcomingEventsSection() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <SectionTitle
          label="Events"
          title="Upcoming Events"
          description="Explore the next Waterfall Festival experiences."
        />

        <div className="grid gap-8 md:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default UpcomingEventsSection;