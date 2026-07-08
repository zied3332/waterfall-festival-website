import "./style/tickets.css";

const tickets = [
  {
    name: "General Admission",
    price: "$99",
    label: "Classic",
    description: "The perfect ticket for your first Waterfall Festival night.",
    features: ["Main festival access", "All stages", "Food & drink areas"],
  },
  {
    name: "VIP",
    price: "$199",
    label: "Most Popular",
    description: "Upgrade your night with better comfort and exclusive access.",
    features: ["Priority entry", "VIP zone access", "Better stage views"],
  },
  {
    name: "Backstage",
    price: "$399",
    label: "Premium",
    description: "The full premium experience for serious festival lovers.",
    features: ["Backstage areas", "Artist lounge access", "Premium support"],
  },
];

function Tickets() {
  return (
    <section className="tickets-page">
      <div className="tickets-container">
        <p className="tickets-label">Tickets</p>

        <h1 className="tickets-title">Choose Your Experience</h1>

        <p className="tickets-description">
          Select the perfect ticket for your Waterfall Festival adventure.
        </p>

        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <article className="ticket-card" key={ticket.name}>
              <p className="ticket-card__label">{ticket.label}</p>

              <h2>{ticket.name}</h2>

              <p className="ticket-card__description">{ticket.description}</p>

              <p className="ticket-card__price">{ticket.price}</p>

              <ul>
                {ticket.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>

              <button>Buy Ticket</button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Tickets;