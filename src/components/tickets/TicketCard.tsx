import "./Tickets.css";

type TicketCardProps = {
  name: string;
  price: string;
  description: string;
};

function TicketCard({ name, price, description }: TicketCardProps) {
  return (
    <article className="ticket-card">
      <div className="ticket-card__image" />

      <p className="ticket-card__label">Ticket</p>

      <h3 className="ticket-card__title">{name}</h3>

      <p className="ticket-card__description">{description}</p>

      <div className="ticket-card__divider" />

      <p className="ticket-card__small">Starting from</p>

      <p className="ticket-card__price">{price}</p>

      <button className="ticket-card__button">View Ticket</button>
    </article>
  );
}

export default TicketCard;