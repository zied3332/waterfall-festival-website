import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Edit3,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import "../style/admin-faq.css";

type FAQStatus = "Published" | "Draft";

type FAQItem = {
  id: number;
  question: string;
  answer: string;
  category: string;
  status: FAQStatus;
};

type FAQFormData = {
  question: string;
  answer: string;
  category: string;
  status: FAQStatus;
};

const initialFAQs: FAQItem[] = [
  {
    id: 1,
    question: "What should I bring to the festival?",
    answer:
      "Bring your ticket, a valid ID, comfortable clothing, sunscreen, cash or a payment card, and a fully charged phone.",
    category: "General",
    status: "Published",
  },
  {
    id: 2,
    question: "Can I buy tickets at the entrance?",
    answer:
      "Tickets may be available at the entrance, but purchasing online is strongly recommended because some events can sell out.",
    category: "Tickets",
    status: "Published",
  },
  {
    id: 3,
    question: "Is parking available near the venue?",
    answer:
      "Parking areas are available near the venue. Availability may be limited during busy festival nights.",
    category: "Venue",
    status: "Published",
  },
  {
    id: 4,
    question: "What items are prohibited?",
    answer:
      "Outside alcohol, illegal substances, weapons, dangerous objects, and other restricted items are not permitted inside the venue.",
    category: "Rules",
    status: "Published",
  },
  {
    id: 5,
    question: "Is the festival suitable for children?",
    answer:
      "Age restrictions may vary depending on the event. Visitors should review the event details before purchasing tickets.",
    category: "General",
    status: "Draft",
  },
];

const emptyForm: FAQFormData = {
  question: "",
  answer: "",
  category: "General",
  status: "Draft",
};

function AdminFAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFAQs);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | FAQStatus
  >("All");
  const [expandedId, setExpandedId] = useState<number | null>(
    initialFAQs[0]?.id ?? null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFAQId, setEditingFAQId] = useState<number | null>(
    null,
  );
  const [formData, setFormData] =
    useState<FAQFormData>(emptyForm);

  const filteredFAQs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(normalizedSearch) ||
        faq.answer.toLowerCase().includes(normalizedSearch) ||
        faq.category.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "All" || faq.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [faqs, searchTerm, statusFilter]);

  const publishedCount = faqs.filter(
    (faq) => faq.status === "Published",
  ).length;

  const draftCount = faqs.filter(
    (faq) => faq.status === "Draft",
  ).length;

  const openCreateModal = () => {
    setEditingFAQId(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQItem) => {
    setEditingFAQId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      status: faq.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFAQId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const question = formData.question.trim();
    const answer = formData.answer.trim();

    if (!question || !answer) {
      return;
    }

    if (editingFAQId !== null) {
      setFaqs((currentFAQs) =>
        currentFAQs.map((faq) =>
          faq.id === editingFAQId
            ? {
                ...faq,
                question,
                answer,
                category: formData.category,
                status: formData.status,
              }
            : faq,
        ),
      );
    } else {
      const newFAQ: FAQItem = {
        id: Date.now(),
        question,
        answer,
        category: formData.category,
        status: formData.status,
      };

      setFaqs((currentFAQs) => [newFAQ, ...currentFAQs]);
      setExpandedId(newFAQ.id);
    }

    closeModal();
  };

  const handleDelete = (faqId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this FAQ?",
    );

    if (!confirmed) {
      return;
    }

    setFaqs((currentFAQs) =>
      currentFAQs.filter((faq) => faq.id !== faqId),
    );

    if (expandedId === faqId) {
      setExpandedId(null);
    }
  };

  const toggleStatus = (faqId: number) => {
    setFaqs((currentFAQs) =>
      currentFAQs.map((faq) =>
        faq.id === faqId
          ? {
              ...faq,
              status:
                faq.status === "Published"
                  ? "Draft"
                  : "Published",
            }
          : faq,
      ),
    );
  };

  const toggleExpanded = (faqId: number) => {
    setExpandedId((currentId) =>
      currentId === faqId ? null : faqId,
    );
  };

  return (
    <section className="admin-faq">
      <div className="admin-faq__header">
        <div>
          <span className="admin-faq__eyebrow">
            FAQ Management
          </span>

          <h1>Frequently Asked Questions</h1>

          <p>
            Create, edit, publish, and organize common festival
            questions.
          </p>
        </div>

        <button
          type="button"
          className="admin-faq__add-button"
          onClick={openCreateModal}
        >
          <Plus size={19} />
          Add FAQ
        </button>
      </div>

      <div className="admin-faq__stats">
        <article className="admin-faq__stat-card">
          <div className="admin-faq__stat-icon">
            <CircleHelp size={22} />
          </div>

          <div>
            <span>Total FAQs</span>
            <strong>{faqs.length}</strong>
          </div>
        </article>

        <article className="admin-faq__stat-card">
          <div className="admin-faq__stat-icon">
            <Eye size={22} />
          </div>

          <div>
            <span>Published</span>
            <strong>{publishedCount}</strong>
          </div>
        </article>

        <article className="admin-faq__stat-card">
          <div className="admin-faq__stat-icon">
            <EyeOff size={22} />
          </div>

          <div>
            <span>Drafts</span>
            <strong>{draftCount}</strong>
          </div>
        </article>
      </div>

      <div className="admin-faq__toolbar">
        <div className="admin-faq__search">
          <Search size={18} />

          <input
            type="search"
            placeholder="Search questions, answers, or categories..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            aria-label="Search FAQs"
          />
        </div>

        <div className="admin-faq__filters">
          {(["All", "Published", "Draft"] as const).map(
            (status) => (
              <button
                key={status}
                type="button"
                className={
                  statusFilter === status
                    ? "admin-faq__filter admin-faq__filter--active"
                    : "admin-faq__filter"
                }
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="admin-faq__list">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq, index) => {
            const isExpanded = expandedId === faq.id;

            return (
              <article
                key={faq.id}
                className={
                  isExpanded
                    ? "admin-faq__item admin-faq__item--expanded"
                    : "admin-faq__item"
                }
              >
                <button
                  type="button"
                  className="admin-faq__question-row"
                  onClick={() => toggleExpanded(faq.id)}
                  aria-expanded={isExpanded}
                >
                  <div className="admin-faq__number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="admin-faq__question-content">
                    <div className="admin-faq__badges">
                      <span className="admin-faq__category">
                        {faq.category}
                      </span>

                      <span
                        className={`admin-faq__status admin-faq__status--${faq.status.toLowerCase()}`}
                      >
                        {faq.status}
                      </span>
                    </div>

                    <h2>{faq.question}</h2>
                  </div>

                  <span className="admin-faq__expand-icon">
                    {isExpanded ? (
                      <ChevronUp size={22} />
                    ) : (
                      <ChevronDown size={22} />
                    )}
                  </span>
                </button>

                {isExpanded && (
                  <div className="admin-faq__answer">
                    <p>{faq.answer}</p>

                    <div className="admin-faq__actions">
                      <button
                        type="button"
                        className="admin-faq__action-button"
                        onClick={() => openEditModal(faq)}
                      >
                        <Edit3 size={17} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="admin-faq__action-button"
                        onClick={() => toggleStatus(faq.id)}
                      >
                        {faq.status === "Published" ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}

                        {faq.status === "Published"
                          ? "Move to Draft"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        className="admin-faq__action-button admin-faq__action-button--delete"
                        onClick={() => handleDelete(faq.id)}
                      >
                        <Trash2 size={17} />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="admin-faq__empty">
            <CircleHelp size={40} />

            <h2>No FAQs found</h2>

            <p>
              Try another search term or create a new FAQ.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
            >
              <Plus size={18} />
              Add FAQ
            </button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className="admin-faq__modal-backdrop"
          role="presentation"
          onMouseDown={closeModal}
        >
          <div
            className="admin-faq__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="faq-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="admin-faq__modal-header">
              <div>
                <span>FAQ Editor</span>

                <h2 id="faq-modal-title">
                  {editingFAQId !== null
                    ? "Edit FAQ"
                    : "Create New FAQ"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close FAQ editor"
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="admin-faq__form"
              onSubmit={handleSubmit}
            >
              <label>
                Question

                <input
                  type="text"
                  value={formData.question}
                  onChange={(event) =>
                    setFormData((currentData) => ({
                      ...currentData,
                      question: event.target.value,
                    }))
                  }
                  placeholder="Enter the FAQ question"
                  required
                />
              </label>

              <label>
                Answer

                <textarea
                  value={formData.answer}
                  onChange={(event) =>
                    setFormData((currentData) => ({
                      ...currentData,
                      answer: event.target.value,
                    }))
                  }
                  placeholder="Enter the FAQ answer"
                  required
                />
              </label>

              <div className="admin-faq__form-grid">
                <label>
                  Category

                  <select
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((currentData) => ({
                        ...currentData,
                        category: event.target.value,
                      }))
                    }
                  >
                    <option value="General">General</option>
                    <option value="Tickets">Tickets</option>
                    <option value="Venue">Venue</option>
                    <option value="Rules">Rules</option>
                    <option value="Schedule">Schedule</option>
                    <option value="Accessibility">
                      Accessibility
                    </option>
                  </select>
                </label>

                <label>
                  Status

                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((currentData) => ({
                        ...currentData,
                        status: event.target
                          .value as FAQStatus,
                      }))
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">
                      Published
                    </option>
                  </select>
                </label>
              </div>

              <div className="admin-faq__form-actions">
                <button
                  type="button"
                  className="admin-faq__cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-faq__save-button"
                >
                  {editingFAQId !== null
                    ? "Save Changes"
                    : "Create FAQ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminFAQ;