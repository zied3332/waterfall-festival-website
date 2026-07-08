import EventCard from "../components/events/EventCard";
import { events } from "../data/events";
import "./style/events.css";

function Events() {
  return (
    <section className="events-page">
      <div className="events-container">
        <div className="events-hero">
          <p className="events-label">Events</p>

          <h1 className="events-title">Upcoming Events</h1>

          <p className="events-description">
            Explore upcoming Waterfall Festival experiences, parties, and
            special nights in Koh Phangan.
          </p>
        </div>

        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Events;