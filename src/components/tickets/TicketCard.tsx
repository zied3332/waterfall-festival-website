import { Link } from "react-router-dom";

import {
  ArrowRight,
  CalendarClock,
  Check,
  ImageIcon,
  Ticket,
  Zap,
} from "lucide-react";

import type {
  TicketPreview,
  TicketStatus,
} from "../../services/ticket.service";

import "./Tickets.css";

type TicketCardProps = {
  ticket: TicketPreview;
};

const MAX_VISIBLE_BENEFITS = 3;

function formatPrice(
  price: number,
  currency: string,
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits:
        Number.isInteger(price) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return `${currency} ${price.toLocaleString(
      "en-US",
    )}`;
  }
}

function formatDate(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function getStatusLabel(
  status: TicketStatus,
  remainingQuantity: number | null,
  availabilityLabel: string | null,
): string {
  if (availabilityLabel?.trim()) {
    return availabilityLabel.trim();
  }

  switch (status) {
    case "SCHEDULED":
      return "Coming soon";

    case "LIMITED":
      return remainingQuantity !== null
        ? `Only ${remainingQuantity} left`
        : "Limited";

    case "SOLD_OUT":
      return "Sold out";

    case "EXPIRED":
      return "Sale ended";

    case "HIDDEN":
      return "Unavailable";

    case "DRAFT":
      return "Unavailable";

    case "AVAILABLE":
    default:
      return remainingQuantity !== null
        ? `${remainingQuantity} left`
        : "Available";
  }
}

function getStatusModifier(
  status: TicketStatus,
): string {
  switch (status) {
    case "LIMITED":
      return "ticket-preview-card__status--limited";

    case "SOLD_OUT":
    case "EXPIRED":
    case "HIDDEN":
    case "DRAFT":
      return "ticket-preview-card__status--unavailable";

    case "SCHEDULED":
      return "ticket-preview-card__status--scheduled";

    case "AVAILABLE":
    default:
      return "ticket-preview-card__status--available";
  }
}

function isTicketUnavailable(
  status: TicketStatus,
): boolean {
  return [
    "SOLD_OUT",
    "EXPIRED",
    "HIDDEN",
    "DRAFT",
  ].includes(status);
}

function TicketCard({
  ticket,
}: TicketCardProps) {
  const unavailable =
    isTicketUnavailable(ticket.status);

  const statusLabel = getStatusLabel(
    ticket.status,
    ticket.remainingQuantity,
    ticket.availabilityLabel,
  );

  const formattedSaleEndDate =
    formatDate(ticket.saleEndsAt);

  const sortedBenefits = [
    ...(ticket.benefits ?? []),
  ]
    .sort(
      (firstBenefit, secondBenefit) =>
        firstBenefit.sortOrder -
        secondBenefit.sortOrder,
    )
    .slice(0, MAX_VISIBLE_BENEFITS);

  const cardClassName = [
    "ticket-preview-card",
    ticket.isFeatured
      ? "ticket-preview-card--featured"
      : "",
    unavailable
      ? "ticket-preview-card--unavailable"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const statusClassName = [
    "ticket-preview-card__status",
    getStatusModifier(ticket.status),
  ].join(" ");

  const internalTicketUrl =
    `/tickets/${ticket.slug}`;

  const purchaseUrl =
    ticket.externalPurchaseUrl?.trim() ||
    ticket.event?.ticketPurchaseUrl?.trim() ||
    null;

  const ticketDescription =
    ticket.shortDescription?.trim() ||
    ticket.description?.trim() ||
    "Discover this Waterfall Festival pass and secure your place for an unforgettable night.";

  const cardActionContent = (
    <>
      <span>
        {purchaseUrl
          ? "Buy ticket"
          : "View pass"}
      </span>

      <ArrowRight
        size={17}
        aria-hidden="true"
      />
    </>
  );

  return (
    <article className={cardClassName}>
      <div className="ticket-preview-card__media">
        {ticket.imageUrl ? (
          <img
            className="ticket-preview-card__image"
            src={ticket.imageUrl}
            alt={`${ticket.name} ticket`}
            loading="lazy"
          />
        ) : (
          <div className="ticket-preview-card__image-placeholder">
            <ImageIcon
              size={30}
              aria-hidden="true"
            />

            <span>Festival pass</span>
          </div>
        )}

        <div
          className="ticket-preview-card__image-overlay"
          aria-hidden="true"
        />

        <div className="ticket-preview-card__media-top">
          <span className={statusClassName}>
            {statusLabel}
          </span>

          {ticket.badge?.trim() && (
            <span className="ticket-preview-card__badge">
              {ticket.isFeatured && (
                <Zap
                  size={12}
                  fill="currentColor"
                  aria-hidden="true"
                />
              )}

              {ticket.badge.trim()}
            </span>
          )}
        </div>

        <div className="ticket-preview-card__media-bottom">
          <span className="ticket-preview-card__category">
            <Ticket
              size={14}
              aria-hidden="true"
            />

            {ticket.category}
          </span>
        </div>
      </div>

      <div className="ticket-preview-card__content">
        <div className="ticket-preview-card__heading">
          <h3 className="ticket-preview-card__title">
            {ticket.name}
          </h3>

          <div className="ticket-preview-card__pricing">
            <strong>
              {formatPrice(
                ticket.price,
                ticket.currency,
              )}
            </strong>

            {ticket.originalPrice !== null &&
              ticket.originalPrice >
                ticket.price && (
                <span>
                  {formatPrice(
                    ticket.originalPrice,
                    ticket.currency,
                  )}
                </span>
              )}
          </div>
        </div>

        <p className="ticket-preview-card__description">
          {ticketDescription}
        </p>

        {sortedBenefits.length > 0 && (
          <ul className="ticket-preview-card__benefits">
            {sortedBenefits.map(
              (benefit) => (
                <li key={benefit.id}>
                  <span className="ticket-preview-card__check">
                    <Check
                      size={12}
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </span>

                  <span>{benefit.text}</span>
                </li>
              ),
            )}
          </ul>
        )}

        <div className="ticket-preview-card__meta">
          {formattedSaleEndDate && (
            <span>
              <CalendarClock
                size={14}
                aria-hidden="true"
              />

              Sale ends{" "}
              {formattedSaleEndDate}
            </span>
          )}

          {!formattedSaleEndDate &&
            ticket.minimumPerOrder !==
              null && (
              <span>
                <Ticket
                  size={14}
                  aria-hidden="true"
                />

                Minimum{" "}
                {ticket.minimumPerOrder} per
                order
              </span>
            )}
        </div>
      </div>

      <div className="ticket-preview-card__footer">
        {unavailable ? (
          <button
            type="button"
            className="ticket-preview-card__button"
            disabled
          >
            Currently unavailable
          </button>
        ) : purchaseUrl ? (
          <a
            href={purchaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ticket-preview-card__button"
            aria-label={`Buy ${ticket.name}`}
          >
            {cardActionContent}
          </a>
        ) : (
          <Link
            to={internalTicketUrl}
            className="ticket-preview-card__button"
            aria-label={`View ${ticket.name}`}
          >
            {cardActionContent}
          </Link>
        )}
      </div>
    </article>
  );
}

export default TicketCard;