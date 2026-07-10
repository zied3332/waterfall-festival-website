import {
  ArrowRight,
  Check,
  Clock3,
  Ticket,
  Zap,
} from "lucide-react";

import "./Tickets.css";

type TicketCardProps = {
  name: string;
  price: string;
  description: string;
  popular?: boolean;
  remaining?: string;
  availableUntil?: string;
  soldOut?: boolean;
};

function TicketCard({
  name,
  price,
  description,
  popular = false,
  remaining,
  availableUntil,
  soldOut = false,
}: TicketCardProps) {
  const ticketStatus = soldOut
    ? "Sold Out"
    : popular
      ? "Most Popular"
      : remaining
        ? `${remaining} left`
        : "Available";

  return (
    <article
      className={[
        "ticket-card",
        popular ? "ticket-card--popular" : "",
        soldOut ? "ticket-card--sold-out" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {popular && !soldOut && (
        <div className="ticket-card__popular-ribbon">
          <Zap size={13} fill="currentColor" />
          Best value
        </div>
      )}

      <div className="ticket-card__decorations" aria-hidden="true">
        <span className="ticket-card__circle ticket-card__circle--one" />
        <span className="ticket-card__circle ticket-card__circle--two" />
      </div>

      <div className="ticket-card__top">
        <div className="ticket-card__type">
          <Ticket size={17} />
          <span>Festival Pass</span>
        </div>

        <span
          className={[
            "ticket-card__status",
            soldOut ? "ticket-card__status--sold" : "",
            popular ? "ticket-card__status--popular" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {ticketStatus}
        </span>
      </div>

      <div className="ticket-card__main">
        <h3 className="ticket-card__title">{name}</h3>

        <div className="ticket-card__price-wrapper">
          <span className="ticket-card__currency">฿</span>

          <p className="ticket-card__price">
            {price.replace(/[^\d.,]/g, "") || price}
          </p>

          <span className="ticket-card__price-label">per person</span>
        </div>

        <p className="ticket-card__description">{description}</p>
      </div>

      <div className="ticket-card__divider">
        <span className="ticket-card__cut ticket-card__cut--left" />
        <span className="ticket-card__divider-line" />
        <span className="ticket-card__cut ticket-card__cut--right" />
      </div>

      <ul className="ticket-card__features">
        <li>
          <span className="ticket-card__check">
            <Check size={13} strokeWidth={3} />
          </span>
          Online festival ticket
        </li>

        <li>
          <span className="ticket-card__check">
            <Check size={13} strokeWidth={3} />
          </span>
          Fast entrance access
        </li>

        <li>
          <span className="ticket-card__check">
            <Check size={13} strokeWidth={3} />
          </span>
          Secure online booking
        </li>
      </ul>

      {availableUntil && (
        <div className="ticket-card__availability">
          <Clock3 size={15} />

          <span>
            Available until <strong>{availableUntil}</strong>
          </span>
        </div>
      )}

      <button
        type="button"
        className="ticket-card__button"
        disabled={soldOut}
      >
        <span>{soldOut ? "Currently Unavailable" : "Choose This Pass"}</span>

        {!soldOut && <ArrowRight size={18} />}
      </button>
    </article>
  );
}

export default TicketCard;