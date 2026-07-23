import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
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

import { faqService } from "../../services/faq.service";
import type {
  CreateFaqInput,
  Faq,
  FaqStatus,
  UpdateFaqInput,
} from "../../types/faq";

import "../style/admin-faq.css";

type StatusFilter = "ALL" | FaqStatus;

type FaqFormData = {
  question: string;
  answer: string;
  category: string;
  status: FaqStatus;
  sortOrder: string;
};

const emptyForm: FaqFormData = {
  question: "",
  answer: "",
  category: "General",
  status: "DRAFT",
  sortOrder: "0",
};

const statusLabels: Record<FaqStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

function AdminFAQ() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [expandedId, setExpandedId] =
    useState<number | null>(null);
  const [editingFaqId, setEditingFaqId] =
    useState<number | null>(null);
  const [formData, setFormData] =
    useState<FaqFormData>(emptyForm);

  const [isModalOpen, setIsModalOpen] =
    useState(false);
  const [isLoading, setIsLoading] =
    useState(true);
  const [isSaving, setIsSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const loadFaqs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await faqService.getAll();
      setFaqs(data);

      setExpandedId((currentId) => {
        if (
          currentId !== null &&
          data.some((faq) => faq.id === currentId)
        ) {
          return currentId;
        }

        return data[0]?.id ?? null;
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load FAQs.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadFaqs();
  }, []);

  const filteredFaqs = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesSearch =
        !search ||
        faq.question.toLowerCase().includes(search) ||
        faq.answer.toLowerCase().includes(search) ||
        faq.category?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" ||
        faq.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [faqs, searchTerm, statusFilter]);

  const publishedCount = faqs.filter(
    (faq) => faq.status === "PUBLISHED",
  ).length;

  const draftCount = faqs.filter(
    (faq) => faq.status === "DRAFT",
  ).length;

  const openCreateModal = () => {
    setEditingFaqId(null);
    setFormData(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (faq: Faq) => {
    setEditingFaqId(faq.id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? "",
      status: faq.status,
      sortOrder: String(faq.sortOrder),
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingFaqId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const question = formData.question.trim();
    const answer = formData.answer.trim();
    const category = formData.category.trim();
    const sortOrder = Number(formData.sortOrder);

    if (!question || !answer) {
      setError("Question and answer are required.");
      return;
    }

    if (
      !Number.isInteger(sortOrder) ||
      sortOrder < 0
    ) {
      setError(
        "Sort order must be a non-negative integer.",
      );
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const data: CreateFaqInput = {
        question,
        answer,
        category: category || undefined,
        status: formData.status,
        sortOrder,
      };

      if (editingFaqId !== null) {
        const updatedFaq = await faqService.update(
          editingFaqId,
          data,
        );

        setFaqs((currentFaqs) =>
          currentFaqs.map((faq) =>
            faq.id === updatedFaq.id
              ? updatedFaq
              : faq,
          ),
        );
      } else {
        const createdFaq =
          await faqService.create(data);

        setFaqs((currentFaqs) => [
          createdFaq,
          ...currentFaqs,
        ]);
        setExpandedId(createdFaq.id);
      }

      setIsModalOpen(false);
      setEditingFaqId(null);
      setFormData(emptyForm);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save the FAQ.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (faq: Faq) => {
    const confirmed = window.confirm(
      `Delete "${faq.question}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(null);
      await faqService.remove(faq.id);

      setFaqs((currentFaqs) =>
        currentFaqs.filter(
          (currentFaq) =>
            currentFaq.id !== faq.id,
        ),
      );

      if (expandedId === faq.id) {
        setExpandedId(null);
      }
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete the FAQ.",
      );
    }
  };

  const toggleStatus = async (faq: Faq) => {
    const nextStatus: FaqStatus =
      faq.status === "PUBLISHED"
        ? "DRAFT"
        : "PUBLISHED";

    const data: UpdateFaqInput = {
      status: nextStatus,
    };

    try {
      setError(null);

      const updatedFaq = await faqService.update(
        faq.id,
        data,
      );

      setFaqs((currentFaqs) =>
        currentFaqs.map((currentFaq) =>
          currentFaq.id === updatedFaq.id
            ? updatedFaq
            : currentFaq,
        ),
      );
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Could not update the FAQ status.",
      );
    }
  };

  return (
    <section className="admin-faq">
      <header className="admin-faq__header">
        <div>
          <span className="admin-faq__eyebrow">
            FAQ Management
          </span>

          <h1>Frequently Asked Questions</h1>

          <p>
            Create, edit, publish, and organize common
            festival questions.
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
      </header>

      <div className="admin-faq__stats">
        <article className="admin-faq__stat-card">
          <CircleHelp size={22} />

          <div>
            <span>Total FAQs</span>
            <strong>{faqs.length}</strong>
          </div>
        </article>

        <article className="admin-faq__stat-card">
          <Eye size={22} />

          <div>
            <span>Published</span>
            <strong>{publishedCount}</strong>
          </div>
        </article>

        <article className="admin-faq__stat-card">
          <EyeOff size={22} />

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
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
          />
        </div>

        <div className="admin-faq__filters">
          {(
            [
              "ALL",
              "PUBLISHED",
              "DRAFT",
              "ARCHIVED",
            ] as const
          ).map((status) => (
            <button
              key={status}
              type="button"
              className={
                statusFilter === status
                  ? "admin-faq__filter admin-faq__filter--active"
                  : "admin-faq__filter"
              }
              onClick={() =>
                setStatusFilter(status)
              }
            >
              {status === "ALL"
                ? "All"
                : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {error && !isModalOpen && (
        <div className="admin-faq__message admin-faq__message--error">
          {error}
        </div>
      )}

      <div className="admin-faq__list">
        {isLoading ? (
          <div className="admin-faq__empty">
            <CircleHelp size={40} />
            <h2>Loading FAQs...</h2>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="admin-faq__empty">
            <CircleHelp size={40} />
            <h2>No FAQs found</h2>
            <p>
              Change the filters or create a new FAQ.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
            >
              <Plus size={18} />
              Add FAQ
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isExpanded =
              expandedId === faq.id;

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
                  onClick={() =>
                    setExpandedId(
                      isExpanded ? null : faq.id,
                    )
                  }
                  aria-expanded={isExpanded}
                >
                  <span className="admin-faq__number">
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <span className="admin-faq__question-content">
                    <span className="admin-faq__badges">
                      <span className="admin-faq__category">
                        {faq.category || "General"}
                      </span>

                      <span
                        className={`admin-faq__status admin-faq__status--${faq.status.toLowerCase()}`}
                      >
                        {statusLabels[faq.status]}
                      </span>
                    </span>

                    <strong>{faq.question}</strong>
                  </span>

                  {isExpanded ? (
                    <ChevronUp size={22} />
                  ) : (
                    <ChevronDown size={22} />
                  )}
                </button>

                {isExpanded && (
                  <div className="admin-faq__answer">
                    <p>{faq.answer}</p>

                    <div className="admin-faq__details">
                      Sort order: {faq.sortOrder}
                    </div>

                    <div className="admin-faq__actions">
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(faq)
                        }
                      >
                        <Edit3 size={17} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void toggleStatus(faq)
                        }
                      >
                        {faq.status ===
                        "PUBLISHED" ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}

                        {faq.status ===
                        "PUBLISHED"
                          ? "Move to Draft"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        className="admin-faq__delete-button"
                        onClick={() =>
                          void handleDelete(faq)
                        }
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
        )}
      </div>

      {isModalOpen && (
        <div
          className="admin-faq__modal-backdrop"
          onMouseDown={closeModal}
        >
          <div
            className="admin-faq__modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-faq__modal-header">
              <div>
                <span>FAQ Editor</span>

                <h2>
                  {editingFaqId === null
                    ? "Create FAQ"
                    : "Edit FAQ"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="admin-faq__form"
              onSubmit={handleSubmit}
            >
              {error && (
                <div className="admin-faq__message admin-faq__message--error">
                  {error}
                </div>
              )}

              <label>
                Question

                <input
                  type="text"
                  value={formData.question}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      question: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <label>
                Answer

                <textarea
                  value={formData.answer}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      answer: event.target.value,
                    }))
                  }
                  required
                />
              </label>

              <div className="admin-faq__form-grid">
                <label>
                  Category

                  <input
                    type="text"
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        category:
                          event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Status

                  <select
                    value={formData.status}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        status: event.target
                          .value as FaqStatus,
                      }))
                    }
                  >
                    <option value="DRAFT">
                      Draft
                    </option>
                    <option value="PUBLISHED">
                      Published
                    </option>
                    <option value="ARCHIVED">
                      Archived
                    </option>
                  </select>
                </label>
              </div>

              <label>
                Sort order

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.sortOrder}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      sortOrder:
                        event.target.value,
                    }))
                  }
                />
              </label>

              <div className="admin-faq__form-actions">
                <button
                  type="button"
                  className="admin-faq__cancel-button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-faq__save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingFaqId === null
                      ? "Create FAQ"
                      : "Save Changes"}
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