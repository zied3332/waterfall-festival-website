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
  popular,
  remaining,
  availableUntil,
  soldOut,
}: TicketCardProps) {
  return (
    <article
      className={`ticket-card ${popular ? "ticket-card--popular" : ""} ${
        soldOut ? "ticket-card--sold-out" : ""
      }`}
    >
      <div className="ticket-card__header">
        <span className="ticket-card__label">Festival Pass</span>

        {soldOut ? (
          <span className="ticket-card__badge ticket-card__badge--sold">
            Sold Out
          </span>
        ) : popular ? (
          <span className="ticket-card__badge">Best Deal</span>
        ) : remaining ? (
          <span className="ticket-card__badge">{remaining} left</span>
        ) : null}
      </div>

      <h3 className="ticket-card__title">{name}</h3>

      <p className="ticket-card__price">{price}</p>

      <p className="ticket-card__description">{description}</p>

      <div className="ticket-card__cut" />

      <div className="ticket-card__info">
        <span>Online ticket</span>
        <span>Fast entry</span>
        {availableUntil && <span>Until {availableUntil}</span>}
      </div>

      <button className="ticket-card__button" disabled={soldOut}>
        {soldOut ? "Sold Out" : "Get Ticket"}
      </button>
    </article>
  );
}

export default TicketCard;