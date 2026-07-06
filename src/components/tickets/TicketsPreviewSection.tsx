import { Link } from "react-router-dom";
import TicketCard from "./TicketCard";
import { tickets } from "../../data/tickets";
import "./Tickets.css";

function TicketsPreviewSection() {
  return (
    <section className="tickets-section">
      <div className="tickets-container">
        <div className="tickets-header">
          <p className="tickets-label">Tickets</p>

          <h2 className="tickets-title">Choose Your Experience</h2>

          <p className="tickets-description">
            Select the ticket that fits your festival journey.
          </p>
        </div>

        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} {...ticket} />
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