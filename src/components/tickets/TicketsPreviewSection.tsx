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
    <section className="tickets-preview">
      <div
        className="tickets-preview__background"
        aria-hidden="true"
      >
        <div className="tickets-preview__grid-pattern" />

        <div className="tickets-preview__glow tickets-preview__glow--one" />

        <div className="tickets-preview__glow tickets-preview__glow--two" />
      </div>

      <div className="tickets-preview__container">
        <div className="tickets-preview__header">
          <div className="tickets-preview__header-content">
            <div className="tickets-preview__eyebrow">
              <Sparkles
                size={15}
                aria-hidden="true"
              />

              <span>Festival Tickets</span>
            </div>

            <h2 className="tickets-preview__title">
              Choose your pass.
              <span>
                Join the experience.
              </span>
            </h2>

            <p className="tickets-preview__description">
              Select the pass that matches your
              Waterfall Festival experience.
              Book online, secure your place,
              and get ready for an unforgettable
              night in Koh Phangan.
            </p>
          </div>

          <div className="tickets-preview__trust">
            <div className="tickets-preview__trust-item">
              <span className="tickets-preview__trust-icon">
                <ShieldCheck
                  size={20}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>Secure booking</strong>

                <span>
                  Protected online payment
                </span>
              </div>
            </div>

            <div className="tickets-preview__trust-item">
              <span className="tickets-preview__trust-icon">
                <TicketCheck
                  size={20}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  Instant confirmation
                </strong>

                <span>
                  Your ticket arrives by email
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="tickets-preview__grid">
          {tickets.map((ticket, index) => (
            <TicketCard
              key={ticket.id}
              {...ticket}
              popular={index === 1}
            />
          ))}
        </div>

        <div className="tickets-preview__footer">
          <p>
            Not sure which ticket is right for
            you? Explore every available pass
            and compare the full details.
          </p>

          <Link
            to="/tickets"
            className="tickets-preview__link"
          >
            View All Tickets

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TicketsPreviewSection;