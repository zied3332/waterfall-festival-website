import { Link } from "react-router-dom";

import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

import TicketCard from "./TicketCard";
import { tickets } from "../../data/tickets";

import "./Tickets.css";

const MAX_PREVIEW_TICKETS = 3;

function TicketsPreviewSection() {
  const previewTickets = tickets.slice(
    0,
    MAX_PREVIEW_TICKETS,
  );

  return (
    <section
      className="tickets-preview"
      aria-labelledby="tickets-preview-title"
    >
      <div
        className="tickets-preview__background"
        aria-hidden="true"
      >
        <div className="tickets-preview__grid-pattern" />

        <div className="tickets-preview__glow tickets-preview__glow--one" />

        <div className="tickets-preview__glow tickets-preview__glow--two" />
      </div>

      <div className="tickets-preview__container">
        <header className="tickets-preview__header">
          <div>
            <p className="tickets-preview__eyebrow">
              <Sparkles
                size={14}
                aria-hidden="true"
              />

              <span>Festival passes</span>
            </p>

            <h2
              id="tickets-preview-title"
              className="tickets-preview__title"
            >
              Choose your experience.
            </h2>

            <p className="tickets-preview__description">
              Explore available passes and book
              through the official ticket
              provider.
            </p>
          </div>

          <Link
            to="/tickets"
            className="tickets-preview__header-link"
          >
            View all tickets

            <ArrowRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </header>

        {previewTickets.length > 0 ? (
          <div className="tickets-preview__grid">
            {previewTickets.map(
              (ticket, index) => (
                <TicketCard
                  key={ticket.id}
                  {...ticket}
                  popular={index === 1}
                />
              ),
            )}
          </div>
        ) : (
          <div className="tickets-preview__empty">
            <Sparkles
              size={24}
              aria-hidden="true"
            />

            <h3>
              Tickets are coming soon
            </h3>

            <p>
              Available festival passes will
              appear here when sales open.
            </p>
          </div>
        )}

        {previewTickets.length > 0 && (
          <footer className="tickets-preview__footer">
            <Link
              to="/tickets"
              className="tickets-preview__button"
            >
              Explore all passes

              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </Link>
          </footer>
        )}
      </div>
    </section>
  );
}

export default TicketsPreviewSection;