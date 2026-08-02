import { Link } from "react-router-dom";

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

function getNumericPrice(price: string): string {
  return (
    price.replace(/[^\d.,]/g, "").trim() ||
    price
  );
}

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

  const cardClassName = [
    "ticket-card",
    popular
      ? "ticket-card--popular"
      : "",
    soldOut
      ? "ticket-card--sold-out"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const statusClassName = [
    "ticket-card__status",
    soldOut
      ? "ticket-card__status--sold"
      : "",
    popular
      ? "ticket-card__status--popular"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClassName}>
      {popular && !soldOut && (
        <div className="ticket-card__popular-ribbon">
          <Zap
            size={13}
            fill="currentColor"
            aria-hidden="true"
          />

          <span>Best value</span>
        </div>
      )}

      <div
        className="ticket-card__decorations"
        aria-hidden="true"
      >
        <span className="ticket-card__circle ticket-card__circle--one" />

        <span className="ticket-card__circle ticket-card__circle--two" />
      </div>

      <div className="ticket-card__top">
        <div className="ticket-card__type">
          <span className="ticket-card__type-icon">
            <Ticket
              size={16}
              aria-hidden="true"
            />
          </span>

          <span>Festival Pass</span>
        </div>

        <span className={statusClassName}>
          {ticketStatus}
        </span>
      </div>

      <div className="ticket-card__main">
        <div className="ticket-card__heading">
          <h3 className="ticket-card__title">
            {name}
          </h3>

          <div className="ticket-card__price-wrapper">
            <span className="ticket-card__currency">
              ฿
            </span>

            <p className="ticket-card__price">
              {getNumericPrice(price)}
            </p>

            <span className="ticket-card__price-label">
              per person
            </span>
          </div>

          <p className="ticket-card__description">
            {description}
          </p>
        </div>

        <div className="ticket-card__divider">
          <span className="ticket-card__cut ticket-card__cut--left" />

          <span className="ticket-card__divider-line" />

          <span className="ticket-card__cut ticket-card__cut--right" />
        </div>

        <div className="ticket-card__body">
          <p className="ticket-card__features-label">
            This pass includes
          </p>

          <ul className="ticket-card__features">
            <li>
              <span className="ticket-card__check">
                <Check
                  size={13}
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </span>

              <span>Official online festival ticket</span>
            </li>

            <li>
              <span className="ticket-card__check">
                <Check
                  size={13}
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </span>

              <span>Fast entrance access</span>
            </li>

            <li>
              <span className="ticket-card__check">
                <Check
                  size={13}
                  strokeWidth={3}
                  aria-hidden="true"
                />
              </span>

              <span>Secure online booking</span>
            </li>
          </ul>

          <div className="ticket-card__availability-slot">
            {availableUntil ? (
              <div className="ticket-card__availability">
                <Clock3
                  size={15}
                  aria-hidden="true"
                />

                <span>
                  Available until{" "}
                  <strong>
                    {availableUntil}
                  </strong>
                </span>
              </div>
            ) : (
              <div className="ticket-card__availability ticket-card__availability--default">
                <Ticket
                  size={15}
                  aria-hidden="true"
                />

                <span>
                  {soldOut
                    ? "Ticket sales are currently closed"
                    : "Available while supplies last"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ticket-card__footer">
        {soldOut ? (
          <button
            type="button"
            className="ticket-card__button"
            disabled
          >
            <span>Currently Unavailable</span>
          </button>
        ) : (
          <Link
            to="/tickets"
            className="ticket-card__button"
            aria-label={`View ticket options for ${name}`}
          >
            <span>Choose This Pass</span>

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </article>
  );
}

export default TicketCard;