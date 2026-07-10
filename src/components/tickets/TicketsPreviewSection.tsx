import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  TicketCheck,
} from "lucide-react";

import TicketCard from "./TicketCard";
import { tickets } from "../../data/tickets";

import "./Tickets.css";

function TicketsPreviewSection() {
  return (
    <section className="tickets-section">
      <div className="tickets-section__background" aria-hidden="true">
        <div className="tickets-section__grid-pattern" />

        <div className="tickets-section__glow tickets-section__glow--one" />
        <div className="tickets-section__glow tickets-section__glow--two" />
      </div>

      <div className="tickets-container">
        <div className="tickets-header">
          <div className="tickets-header__content">
            <div className="tickets-eyebrow">
              <Sparkles size={15} />
              <span>Festival Tickets</span>
            </div>

            <h2 className="tickets-title">
              Choose your pass.
              <span> Join the experience.</span>
            </h2>

            <p className="tickets-description">
              Select the pass that matches your Waterfall Festival experience.
              Book online, secure your place, and get ready for an
              unforgettable night in Koh Phangan.
            </p>
          </div>

          <div className="tickets-header__trust">
            <div className="tickets-trust-item">
              <span className="tickets-trust-item__icon">
                <ShieldCheck size={20} />
              </span>

              <div>
                <strong>Secure booking</strong>
                <span>Protected online payment</span>
              </div>
            </div>

            <div className="tickets-trust-item">
              <span className="tickets-trust-item__icon">
                <TicketCheck size={20} />
              </span>

              <div>
                <strong>Instant confirmation</strong>
                <span>Your ticket arrives by email</span>
              </div>
            </div>
          </div>
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

        <div className="tickets-footer">
          <p>
            Not sure which ticket is right for you? Explore every available
            pass and compare the full details.
          </p>

          <Link to="/tickets" className="tickets-link">
            View All Tickets
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TicketsPreviewSection;