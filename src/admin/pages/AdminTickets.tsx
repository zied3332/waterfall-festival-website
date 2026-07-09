import { Plus, Pencil, Trash2 } from "lucide-react";
import "../style/admin-tickets.css";

const tickets = [
  {
    id: 1,
    name: "Early Bird Pass",
    price: "$35",
    stock: 120,
    status: "Active",
  },
  {
    id: 2,
    name: "General Admission",
    price: "$50",
    stock: 300,
    status: "Active",
  },
  {
    id: 3,
    name: "VIP Experience",
    price: "$120",
    stock: 45,
    status: "Limited",
  },
  {
    id: 4,
    name: "Backstage Pass",
    price: "$180",
    stock: 0,
    status: "Sold Out",
  },
];

function AdminTickets() {
  return (
    <section className="admin-tickets">
      <div className="admin-tickets__header">
        <div>
          <span className="admin-tickets__eyebrow">Ticket Management</span>
          <h1>Tickets</h1>
          <p>Manage festival ticket types, prices, stock, and availability.</p>
        </div>

        <button className="admin-tickets__add">
          <Plus size={18} />
          Add Ticket
        </button>
      </div>

      <div className="admin-tickets__stats">
        <div className="admin-tickets__stat-card">
          <span>Total Tickets</span>
          <strong>4</strong>
        </div>

        <div className="admin-tickets__stat-card">
          <span>Available Stock</span>
          <strong>465</strong>
        </div>

        <div className="admin-tickets__stat-card">
          <span>Sold Out</span>
          <strong>1</strong>
        </div>
      </div>

      <div className="admin-tickets__table-card">
        <div className="admin-tickets__table-header">
          <h2>Ticket List</h2>
          <p>Static data for now. Backend connection can be added later.</p>
        </div>

        <div className="admin-tickets__table-wrap">
          <table className="admin-tickets__table">
            <thead>
              <tr>
                <th>Ticket Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="admin-tickets__actions-title">Actions</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>
                    <strong>{ticket.name}</strong>
                  </td>
                  <td>{ticket.price}</td>
                  <td>{ticket.stock}</td>
                  <td>
                    <span
                      className={`admin-tickets__status admin-tickets__status--${ticket.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-tickets__actions">
                      <button className="admin-tickets__icon-btn">
                        <Pencil size={16} />
                      </button>

                      <button className="admin-tickets__icon-btn admin-tickets__icon-btn--danger">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminTickets;