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

function getNumericPrice(
  price: string,
): string {
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
  const statusLabel = soldOut
    ? "Sold out"
    : remaining
      ? `${remaining} left`
      : "Available";

  const cardClassName = [
    "ticket-preview-card",
    popular
      ? "ticket-preview-card--popular"
      : "",
    soldOut
      ? "ticket-preview-card--sold-out"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={cardClassName}>
      <div className="ticket-preview-card__header">
        <div className="ticket-preview-card__type">
          <span className="ticket-preview-card__type-icon">
            <Ticket
              size={16}
              aria-hidden="true"
            />
          </span>

          <span>Festival pass</span>
        </div>

        <span
          className={[
            "ticket-preview-card__status",
            soldOut
              ? "ticket-preview-card__status--sold"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {statusLabel}
        </span>
      </div>

      {popular && !soldOut && (
        <div className="ticket-preview-card__popular">
          <Zap
            size={13}
            fill="currentColor"
            aria-hidden="true"
          />

          <span>Most popular</span>
        </div>
      )}

      <div className="ticket-preview-card__content">
        <h3 className="ticket-preview-card__title">
          {name}
        </h3>

        <div className="ticket-preview-card__price-row">
          <span className="ticket-preview-card__currency">
            ฿
          </span>

          <strong className="ticket-preview-card__price">
            {getNumericPrice(price)}
          </strong>

          <span className="ticket-preview-card__price-label">
            per person
          </span>
        </div>

        <p className="ticket-preview-card__description">
          {description}
        </p>

        <ul className="ticket-preview-card__features">
          <li>
            <span className="ticket-preview-card__check">
              <Check
                size={12}
                strokeWidth={3}
                aria-hidden="true"
              />
            </span>

            <span>
              Official festival admission
            </span>
          </li>

          <li>
            <span className="ticket-preview-card__check">
              <Check
                size={12}
                strokeWidth={3}
                aria-hidden="true"
              />
            </span>

            <span>
              Secure online booking
            </span>
          </li>
        </ul>

        {(availableUntil ||
          remaining ||
          soldOut) && (
          <div className="ticket-preview-card__availability">
            <Clock3
              size={14}
              aria-hidden="true"
            />

            <span>
              {soldOut
                ? "Ticket sales are currently closed"
                : availableUntil
                  ? `Available until ${availableUntil}`
                  : `${remaining} tickets remaining`}
            </span>
          </div>
        )}
      </div>

      <div className="ticket-preview-card__footer">
        {soldOut ? (
          <button
            type="button"
            className="ticket-preview-card__button"
            disabled
          >
            Unavailable
          </button>
        ) : (
          <Link
            to="/tickets"
            className="ticket-preview-card__button"
            aria-label={`View ticket details for ${name}`}
          >
            <span>View pass</span>

            <ArrowRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </article>
  );
}

export default TicketCard;