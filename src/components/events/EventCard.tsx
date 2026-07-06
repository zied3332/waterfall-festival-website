import { Link } from "react-router-dom";
import { Calendar, Clock3, MapPin, Heart } from "lucide-react";
import "./Events.css";

type EventCardProps = {
  title: string;
  date: string;
  location: string;
  slug: string;
};

function EventCard({ title, date, location, slug }: EventCardProps) {
  return (
    <article className="event-card">
      <div className="event-card__image">
        <div className="event-card__badge">Upcoming</div>

        <button className="event-card__heart">
          <Heart size={28} strokeWidth={1.8} />
        </button>
      </div>

      <div className="event-card__content">
        <p className="event-card__label">Event</p>

        <h2 className="event-card__title">{title}</h2>

        <p className="event-card__place">Koh Phangan</p>

        <div className="event-card__details">
          <div className="event-card__detail">
            <Calendar size={18} />
            <span>{date}</span>
          </div>

          <div className="event-card__detail">
            <Clock3 size={18} />
            <span>4:00 PM - 6:00 AM</span>
          </div>

          <div className="event-card__detail">
            <MapPin size={18} />
            <span>{location}</span>
          </div>
        </div>

        <p className="event-card__description">
          The original and biggest Full Moon Party. Dance beneath the stars with
          world-class DJs, incredible visuals, and the unforgettable atmosphere
          of Koh Phangan.
        </p>
      </div>

      <Link to={`/events/${slug}`} className="event-card__button">
        <span>View Event</span>
        <span>→</span>
      </Link>
    </article>
  );
}

export default EventCard;