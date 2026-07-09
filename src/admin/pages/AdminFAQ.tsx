import { Plus, Pencil, Trash2 } from "lucide-react";
import "../style/admin-faq.css";

const faqs = [
  {
    id: 1,
    question: "Where is Waterfall Festival located?",
    category: "Venue",
    status: "Published",
  },
  {
    id: 2,
    question: "Can I buy tickets at the entrance?",
    category: "Tickets",
    status: "Published",
  },
  {
    id: 3,
    question: "What should I bring to the festival?",
    category: "Experience",
    status: "Draft",
  },
  {
    id: 4,
    question: "Is transport available to the venue?",
    category: "Transport",
    status: "Published",
  },
];

function AdminFAQ() {
  return (
    <section className="admin-faq">
      <div className="admin-faq__header">
        <div>
          <span className="admin-faq__eyebrow">FAQ Management</span>
          <h1>FAQ</h1>
          <p>Manage public questions, categories, and visibility status.</p>
        </div>

        <button className="admin-faq__add">
          <Plus size={18} />
          Add FAQ
        </button>
      </div>

      <div className="admin-faq__table-card">
        <div className="admin-faq__table-header">
          <h2>FAQ List</h2>
          <p>Static FAQ data for now. Real editing can be connected later.</p>
        </div>

        <div className="admin-faq__table-wrap">
          <table className="admin-faq__table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Category</th>
                <th>Status</th>
                <th className="admin-faq__actions-title">Actions</th>
              </tr>
            </thead>

            <tbody>
              {faqs.map((faq) => (
                <tr key={faq.id}>
                  <td>
                    <strong>{faq.question}</strong>
                  </td>
                  <td>{faq.category}</td>
                  <td>
                    <span
                      className={`admin-faq__status admin-faq__status--${faq.status.toLowerCase()}`}
                    >
                      {faq.status}
                    </span>
                  </td>
                  <td>
                    <div className="admin-faq__actions">
                      <button title="Edit FAQ">
                        <Pencil size={16} />
                      </button>

                      <button className="danger" title="Delete FAQ">
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

export default AdminFAQ;