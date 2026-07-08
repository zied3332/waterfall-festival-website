import { Link, useParams } from "react-router-dom";
import { events } from "../data/events";
import "./style/event-details.css";

const schedule = [
  "21:00 Gates Open",
  "22:00 Warm-up DJ",
  "00:00 Main Stage Show",
  "02:00 Fire Show",
  "04:00 Sunrise Set",
];

function EventDetails() {
  const { slug } = useParams();

  const event = events.find((item) => item.slug === slug);

  if (!event) {
    return (
      <section className="event-details-page">
        <h1>Event not found</h1>
      </section>
    );
  }

  return (
    <section className="event-details-page">
      <div className="event-details-hero">
        <div className="event-details-hero-overlay" />

        <div className="event-details-hero-content">
          <p className="event-details-label">Event Details</p>

          <h1>{event.title}</h1>

          <p className="event-details-meta">
            {event.date} • {event.time} • {event.location}
          </p>

          <Link to="/tickets" className="event-details-button">
            Get Tickets
          </Link>
        </div>
      </div>

      <div className="event-details-container">
        <div className="event-info-grid">
          <div>
            <span>Date</span>
            <strong>{event.date}</strong>
          </div>

          <div>
            <span>Time</span>
            <strong>{event.time}</strong>
          </div>

          <div>
            <span>Venue Area</span>
            <strong>{event.venueArea}</strong>
          </div>

          <div>
            <span>Starting Price</span>
            <strong>{event.price}</strong>
          </div>
        </div>

        <div className="event-section">
          <h2>About This Event</h2>
          <p>{event.description}</p>
        </div>

        <div className="event-section">
          <h2>Lineup</h2>

          <div className="artist-grid">
            {event.artists.map((artist) => (
              <div className="artist-card" key={artist}>
                <div className="artist-image" />
                <h3>{artist}</h3>
                <p>Guest Artist</p>
              </div>
            ))}
          </div>
        </div>

        <div className="event-section">
          <h2>Schedule</h2>

          <div className="schedule-list">
            {schedule.map((item) => (
              <div className="schedule-item" key={item}>
                <span />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="event-section venue-box">
          <div>
            <h2>Venue Area</h2>
            <p>
              This event takes place around the {event.venueArea}. You can find
              food, toilets, VIP zone, parking, and first aid nearby.
            </p>
          </div>

          <Link to="/venue">View Festival Map</Link>
        </div>

        <div className="event-cta">
          <h2>Ready for the night?</h2>
          <p>Choose your ticket and secure your Waterfall Festival experience.</p>
          <Link to="/tickets">Buy Tickets</Link>
        </div>
      </div>
    </section>
  );
}

export default EventDetails;