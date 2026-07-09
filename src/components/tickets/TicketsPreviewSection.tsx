import { Link } from "react-router-dom";
import TicketCard from "./TicketCard";
import { tickets } from "../../data/tickets";
import "./Tickets.css";

function TicketsPreviewSection() {
  return (
    <section className="tickets-section">
      <div className="tickets-section__glow tickets-section__glow--one" />
      <div className="tickets-section__glow tickets-section__glow--two" />

      <div className="tickets-container">
        <div className="tickets-header">
          <p className="tickets-label">Tickets</p>

          <h2 className="tickets-title">Choose Your Experience</h2>

          <p className="tickets-description">
            Pick the perfect pass for your Waterfall Festival journey.
          </p>
        </div>

        <div className="tickets-grid">
          {tickets.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              {...ticket}
              popular={index === 1}
            />
          ))}
        </div>

        <div className="tickets-action">
          <Link to="/tickets" className="tickets-link">
            View All Tickets
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TicketsPreviewSection;